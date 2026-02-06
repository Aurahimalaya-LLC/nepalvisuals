import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { RichTextEditor } from '../components/common/RichTextEditor';
import { ImageUpload } from '../components/admin/ImageUpload';
import { BlogService, BlogCategory, BlogTag, BlogPost } from '../lib/services/blogService';
import { supabase } from '../lib/supabaseClient';

interface FAQ {
    question: string;
    answer: string;
}

interface BlogFormData {
    // Core Content
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    
    // Classification
    category_id: string;
    tag_ids: string[];
    content_type: string;
    template: string;
    parent_id: string;
    related_post_ids: string[];
    
    // Media
    featured_image: string;
    featured_image_alt: string;
    og_image: string;
    
    // SEO
    seo_title: string;
    meta_description: string;
    canonical_url: string;
    is_no_index: boolean;
    is_no_follow: boolean;
    primary_keyword: string;
    secondary_keywords: string; // Comma separated for input
    search_intent: string;
    
    // Social
    og_title: string;
    og_description: string;
    twitter_card: string;
    
    // Settings
    author_id: string;
    status: 'draft' | 'published' | 'archived' | 'scheduled';
    published_at: string;
    scheduled_at: string;
    is_featured: boolean;
    is_sticky: boolean;
    show_toc: boolean;
    
    // Schema Data (Stored in JSONB)
    schema_type: string;
    faqs: FAQ[];
    reviewRating: string;
    reviewCount: string;
    steps: string[];
    speakableSelector: string;
}

const AdminBlogCreatePage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditing = !!id;

    const [activeTab, setActiveTab] = useState<'content' | 'relationships' | 'seo' | 'social' | 'settings'>('content');
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<BlogCategory[]>([]);
    const [tags, setTags] = useState<BlogTag[]>([]);
    const [availablePosts, setAvailablePosts] = useState<BlogPost[]>([]);
    const [authors, setAuthors] = useState<{id: string, full_name: string, email: string}[]>([]);
    const [selectedSecondaryCategories, setSelectedSecondaryCategories] = useState<string[]>([]);
    const [childPosts, setChildPosts] = useState<BlogPost[]>([]);
    
    // Auto-calculated stats
    const [stats, setStats] = useState({
        wordCount: 0,
        readingTime: 0,
        internalLinks: 0,
        externalLinks: 0,
        contentScore: 0
    });

    // Link Analysis State
    const [linkSuggestions, setLinkSuggestions] = useState<{ text: string, post: BlogPost }[]>([]);
    const [brokenLinks, setBrokenLinks] = useState<string[]>([]);
    const [analyzingLinks, setAnalyzingLinks] = useState(false);

    const analyzeLinks = () => {
        setAnalyzingLinks(true);
        const text = formData.content.toLowerCase();
        
        // 1. Suggestions
        const suggestions: { text: string, post: BlogPost }[] = [];
        availablePosts.forEach(post => {
            if (post.id === (id || '')) return; // Skip self
            
            // Check title match (if title is at least 4 chars to avoid noise)
            if (post.title.length > 3 && text.includes(post.title.toLowerCase())) {
                suggestions.push({ text: post.title, post });
            }
            // Check primary keyword match
            else if (post.primary_keyword && post.primary_keyword.length > 3 && text.includes(post.primary_keyword.toLowerCase())) {
                 suggestions.push({ text: post.primary_keyword, post });
            }
        });
        setLinkSuggestions(suggestions);

        // 2. Broken Internal Links
        const doc = new DOMParser().parseFromString(formData.content, 'text/html');
        const links = Array.from(doc.querySelectorAll('a'));
        const broken: string[] = [];

        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('/blog/')) {
                // Remove /blog/ prefix and query params/hashes
                const slug = href.replace('/blog/', '').split(/[?#]/)[0];
                const exists = availablePosts.some(p => p.slug === slug);
                if (!exists) broken.push(href);
            }
        });
        setBrokenLinks(broken);
        setAnalyzingLinks(false);
    };

    const [socialPreviewType, setSocialPreviewType] = useState<'facebook' | 'twitter'>('facebook');

    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    const [formData, setFormData] = useState<BlogFormData>({
        title: '',
        slug: '',
        content: '',
        excerpt: '',
        
        category_id: '',
        tag_ids: [],
        content_type: 'article',
        template: 'standard',
        parent_id: '',
        related_post_ids: [],
        
        featured_image: '',
        featured_image_alt: '',
        og_image: '',
        
        seo_title: '',
        meta_description: '',
        canonical_url: '',
        is_no_index: false,
        is_no_follow: false,
        primary_keyword: '',
        secondary_keywords: '',
        search_intent: 'informational',
        
        og_title: '',
        og_description: '',
        twitter_card: 'summary_large_image',
        
        author_id: '',
        status: 'draft',
        published_at: new Date().toISOString().split('T')[0],
        scheduled_at: '',
        is_featured: false,
        is_sticky: false,
        show_toc: true,
        
        schema_type: 'BlogPosting',
        faqs: [],
        reviewRating: '5',
        reviewCount: '1',
        steps: [],
        speakableSelector: '#content'
    });

    useEffect(() => {
        loadDependencies();
        if (isEditing && id) {
            loadPost(id);
        } else {
            // Check for parent_id query param
            const params = new URLSearchParams(window.location.search);
            const parentId = params.get('parent_id');
            if (parentId) {
                setFormData(prev => ({ ...prev, parent_id: parentId }));
            }

            // Check for autosave on new post
            const saved = localStorage.getItem('blog_autosave_new');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    if (window.confirm('Found an unsaved draft for a new post. Restore it?')) {
                        setFormData(parsed);
                    } else {
                        localStorage.removeItem('blog_autosave_new');
                    }
                } catch (e) {
                    console.error('Failed to parse autosave', e);
                }
            }
        }
    }, [isEditing, id]);

    // Autosave Effect
    useEffect(() => {
        const timer = setInterval(() => {
            if (hasUnsavedChanges) {
                const key = isEditing && id ? `blog_autosave_${id}` : 'blog_autosave_new';
                localStorage.setItem(key, JSON.stringify(formData));
                // console.log('Autosaved to', key);
            }
        }, 30000); // 30 seconds

        return () => clearInterval(timer);
    }, [formData, hasUnsavedChanges, isEditing, id]);

    // Mark changes
    useEffect(() => {
        setHasUnsavedChanges(true);
    }, [formData]);

    // Calculate stats whenever content or SEO fields change
    useEffect(() => {
        calculateStats();
    }, [formData.content, formData.title, formData.meta_description, formData.featured_image, formData.primary_keyword]);

    const loadDependencies = async () => {
        try {
            const [cats, tgs, posts, auths] = await Promise.all([
                BlogService.getAllCategories(),
                BlogService.getAllTags(),
                BlogService.getAllPosts(),
                BlogService.getAllAuthors()
            ]);
            setCategories(cats);
            setTags(tgs);
            setAvailablePosts(posts);
            setAuthors(auths);
            
            // Set current user as author if creating
            if (!isEditing) {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) setFormData(prev => ({ ...prev, author_id: user.id }));
            }
        } catch (err) {
            console.error("Failed to load dependencies", err);
        }
    };

    const loadPost = async (postId: string) => {
        try {
            setLoading(true);
            const [post, related, children] = await Promise.all([
                BlogService.getPostById(postId),
                BlogService.getRelatedPosts(postId),
                BlogService.getChildPosts(postId)
            ]);
            
            if (post) {
                setChildPosts(children);
                if (post.secondary_categories) {
                    setSelectedSecondaryCategories(post.secondary_categories.map(c => c.id));
                }

                setFormData({
                    title: post.title,
                    slug: post.slug,
                    content: post.content || '',
                    excerpt: post.excerpt || '',
                    
                    category_id: post.category_id || '',
                    tag_ids: post.tags?.map(t => t.id) || [],
                    content_type: post.content_type || 'article',
                    template: post.template || 'standard',
                    parent_id: post.parent_id || '',
                    related_post_ids: related.map(p => p.id) || [],
                    
                    featured_image: post.featured_image || '',
                    featured_image_alt: post.featured_image_alt || '',
                    og_image: post.og_image || '',
                    
                    seo_title: post.seo_title || '',
                    meta_description: post.meta_description || '',
                    canonical_url: post.canonical_url || '',
                    is_no_index: post.is_no_index || false,
                    is_no_follow: post.is_no_follow || false,
                    primary_keyword: post.primary_keyword || '',
                    secondary_keywords: (post.secondary_keywords || []).join(', '),
                    search_intent: post.search_intent || 'informational',
                    
                    og_title: post.og_title || '',
                    og_description: post.og_description || '',
                    twitter_card: post.twitter_card || 'summary_large_image',
                    
                    author_id: post.author_id || '',
                    status: post.status as any || 'draft',
                    published_at: post.published_at ? post.published_at.split('T')[0] : '',
                    scheduled_at: post.scheduled_at || '',
                    is_featured: post.is_featured || false,
                    is_sticky: post.is_sticky || false,
                    show_toc: post.show_toc ?? true,
                    
                    schema_type: post.schema_type || 'BlogPosting',
                    faqs: post.schema_data?.faqs || [],
                    reviewRating: post.schema_data?.reviewRating || '5',
                    reviewCount: post.schema_data?.reviewCount || '1',
                    steps: post.schema_data?.steps || [],
                    speakableSelector: post.schema_data?.speakableSelector || '#content'
                });

                // Check for local autosave that might be newer
                const saved = localStorage.getItem(`blog_autosave_${postId}`);
                if (saved) {
                    try {
                        const parsed = JSON.parse(saved);
                        // We could compare timestamps if we had them, for now just ask
                        if (window.confirm('Found a local unsaved draft for this post. Restore it?')) {
                            setFormData(parsed);
                        } else {
                            localStorage.removeItem(`blog_autosave_${postId}`);
                        }
                    } catch (e) {
                        console.error(e);
                    }
                }
                setHasUnsavedChanges(false);
            }
        } catch (err) {
            console.error(err);
            alert('Failed to load post');
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = () => {
        const text = formData.content.replace(/<[^>]*>?/gm, '');
        const wordCount = text.trim().split(/\s+/).length;
        const readingTime = Math.ceil(wordCount / 200); // 200 words per minute
        
        // Link counting (rough regex)
        const internalLinks = (formData.content.match(/href="(\/|https:\/\/nepalvisuals\.com)/g) || []).length;
        const totalLinks = (formData.content.match(/href="/g) || []).length;
        const externalLinks = totalLinks - internalLinks;

        // Content Score Calculation (0-100)
        let score = 0;
        if (formData.title.length > 10) score += 10;
        if (formData.slug) score += 5;
        if (wordCount > 300) score += 10;
        if (wordCount > 1000) score += 5;
        if (formData.meta_description) score += 10;
        if (formData.featured_image) score += 10;
        if (formData.primary_keyword) {
            score += 5;
            if (formData.title.toLowerCase().includes(formData.primary_keyword.toLowerCase())) score += 5;
            if (formData.content.toLowerCase().includes(formData.primary_keyword.toLowerCase())) score += 5;
            if (formData.meta_description.toLowerCase().includes(formData.primary_keyword.toLowerCase())) score += 5;
        }
        if (internalLinks > 0) score += 5;
        if (externalLinks > 0) score += 5;
        if (formData.category_id) score += 5;
        if (score > 100) score = 100;

        setStats({
            wordCount,
            readingTime,
            internalLinks,
            externalLinks,
            contentScore: score
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleTagToggle = (tagId: string) => {
        setFormData(prev => {
            const newTags = prev.tag_ids.includes(tagId)
                ? prev.tag_ids.filter(id => id !== tagId)
                : [...prev.tag_ids, tagId];
            return { ...prev, tag_ids: newTags };
        });
    };

    const handleSecondaryCategoryToggle = (catId: string) => {
        setSelectedSecondaryCategories(prev => {
            if (prev.includes(catId)) return prev.filter(id => id !== catId);
            return [...prev, catId];
        });
    };

    const handleRelatedPostToggle = (postId: string) => {
        setFormData(prev => {
            const newIds = prev.related_post_ids.includes(postId)
                ? prev.related_post_ids.filter(id => id !== postId)
                : [...prev.related_post_ids, postId];
            return { ...prev, related_post_ids: newIds };
        });
    };

    const handleAutoSuggestRelated = () => {
        if (!formData.category_id && formData.tag_ids.length === 0) {
            alert('Please select a category or tags first to get suggestions.');
            return;
        }

        const scores = availablePosts
            .filter(p => p.id !== (id || ''))
            .map(post => {
                let score = 0;
                // Same category
                if (post.category_id === formData.category_id) score += 5;
                
                // Shared tags
                const postTagIds = post.tags?.map(t => t.id) || [];
                const sharedTags = postTagIds.filter(tid => formData.tag_ids.includes(tid));
                score += sharedTags.length * 3;
                
                // Title similarity (simple word match)
                const currentWords = formData.title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
                const postWords = post.title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
                const sharedWords = postWords.filter(w => currentWords.includes(w));
                score += sharedWords.length * 2;
                
                return { id: post.id, score };
            })
            .sort((a, b) => b.score - a.score)
            .filter(item => item.score > 0)
            .slice(0, 5); // Top 5

        if (scores.length === 0) {
            alert('No related posts found based on current category and tags.');
            return;
        }

        const newIds = scores.map(s => s.id);
        const uniqueIds = Array.from(new Set([...formData.related_post_ids, ...newIds]));
        
        setFormData(prev => ({ ...prev, related_post_ids: uniqueIds }));
        alert(`Found and added ${newIds.length} related posts.`);
    };

    const handleContentChange = (html: string) => {
        setFormData(prev => ({ ...prev, content: html }));
    };

    const handleSave = async () => {
        if (!formData.title) {
            alert('Title is required');
            return;
        }

        // Validate Author and Category
        if (!formData.author_id) {
            alert('Please select an Author in the Settings tab.');
            setActiveTab('settings');
            return;
        }
        if (!formData.category_id) {
            alert('Please select a Primary Category in the Settings tab.');
            setActiveTab('settings');
            return;
        }

        setLoading(true);
        try {
            const postData: Partial<BlogPost> = {
                title: formData.title,
                slug: formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                content: formData.content,
                excerpt: formData.excerpt,
                
                category_id: formData.category_id || null,
                content_type: formData.content_type,
                template: formData.template,
                parent_id: formData.parent_id || null,
                
                featured_image: formData.featured_image,
                featured_image_alt: formData.featured_image_alt,
                og_image: formData.og_image,
                
                seo_title: formData.seo_title,
                meta_description: formData.meta_description,
                canonical_url: formData.canonical_url,
                is_no_index: formData.is_no_index,
                is_no_follow: formData.is_no_follow,
                primary_keyword: formData.primary_keyword,
                secondary_keywords: formData.secondary_keywords.split(',').map(s => s.trim()).filter(Boolean),
                search_intent: formData.search_intent,
                
                reading_time_minutes: stats.readingTime,
                word_count: stats.wordCount,
                internal_link_count: stats.internalLinks,
                external_link_count: stats.externalLinks,
                content_score: stats.contentScore,
                
                og_title: formData.og_title,
                og_description: formData.og_description,
                twitter_card: formData.twitter_card,
                
                author_id: formData.author_id || null,
                status: formData.status,
                published_at: formData.published_at ? new Date(formData.published_at).toISOString() : null,
                scheduled_at: formData.scheduled_at ? new Date(formData.scheduled_at).toISOString() : null,
                is_featured: formData.is_featured,
                is_sticky: formData.is_sticky,
                show_toc: formData.show_toc,
                
                schema_type: formData.schema_type,
                schema_data: {
                    faqs: formData.faqs,
                    reviewRating: formData.reviewRating,
                    reviewCount: formData.reviewCount,
                    steps: formData.steps,
                    speakableSelector: formData.speakableSelector
                }
            };

            if (isEditing && id) {
                await BlogService.updatePost(id, postData, formData.tag_ids, formData.related_post_ids, selectedSecondaryCategories);
                localStorage.removeItem(`blog_autosave_${id}`);
                setHasUnsavedChanges(false);
                alert('Post updated successfully!');
            } else {
                await BlogService.createPost(postData, formData.tag_ids, formData.related_post_ids, selectedSecondaryCategories);
                localStorage.removeItem('blog_autosave_new');
                setHasUnsavedChanges(false);
                alert('Post created successfully!');
                navigate('/admin/blog');
            }
        } catch (err: any) {
            console.error(err);
            alert('Failed to save post: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Schema / FAQ / Steps Handlers (Preserved from original)
    const handleAddFAQ = () => setFormData(prev => ({ ...prev, faqs: [...prev.faqs, { question: '', answer: '' }] }));
    const handleFAQChange = (index: number, field: 'question' | 'answer', value: string) => {
        const newFAQs = [...formData.faqs];
        newFAQs[index][field] = value;
        setFormData(prev => ({ ...prev, faqs: newFAQs }));
    };
    const handleDeleteFAQ = (index: number) => setFormData(prev => ({ ...prev, faqs: prev.faqs.filter((_, i) => i !== index) }));
    
    const handleAddStep = () => setFormData(prev => ({ ...prev, steps: [...prev.steps, ''] }));
    const handleStepChange = (index: number, value: string) => {
        const newSteps = [...formData.steps];
        newSteps[index] = value;
        setFormData(prev => ({ ...prev, steps: newSteps }));
    };
    const handleDeleteStep = (index: number) => setFormData(prev => ({ ...prev, steps: prev.steps.filter((_, i) => i !== index) }));

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="mb-8 flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-admin-text-primary">{isEditing ? 'Edit Blog Post' : 'Create Blog Post'}</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                            formData.status === 'published' ? 'bg-green-100 text-green-700' : 
                            formData.status === 'draft' ? 'bg-gray-100 text-gray-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                            {formData.status}
                        </span>
                        {stats.contentScore > 0 && (
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                stats.contentScore >= 80 ? 'bg-green-100 text-green-700' :
                                stats.contentScore >= 50 ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                            }`}>
                                SEO Score: {stats.contentScore}/100
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex gap-3">
                    {isEditing && (
                        <a 
                            href={`/blog/${formData.slug}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="px-4 py-2 border border-admin-border rounded-lg text-sm font-semibold text-admin-text-secondary bg-white hover:bg-gray-50 flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-sm">visibility</span>
                            Preview
                        </a>
                    )}
                    <Link to="/admin/blog" className="px-4 py-2 border border-admin-border rounded-lg text-sm font-semibold text-admin-text-secondary bg-white hover:bg-gray-50">Cancel</Link>
                    <button onClick={handleSave} disabled={loading} className="px-4 py-2 bg-admin-primary text-white rounded-lg text-sm font-bold shadow-sm hover:bg-admin-primary-hover flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">save</span>
                        {loading ? 'Saving...' : 'Save Post'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Main Form Area */}
                <div className="lg:col-span-3 bg-admin-surface rounded-xl border border-admin-border shadow-sm overflow-hidden">
                    {/* Tabs */}
                    <div className="border-b border-admin-border bg-gray-50/50 flex overflow-x-auto">
                        {['content', 'relationships', 'seo', 'social', 'settings'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`px-6 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${
                                    activeTab === tab 
                                    ? 'border-admin-primary text-admin-primary bg-admin-primary/5' 
                                    : 'border-transparent text-admin-text-secondary hover:text-admin-text-primary'
                                }`}
                            >
                                <span className="material-symbols-outlined text-lg">
                                    {tab === 'content' ? 'edit_document' : tab === 'relationships' ? 'hub' : tab === 'seo' ? 'search' : tab === 'social' ? 'share' : 'settings'}
                                </span>
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>

                    <div className="p-6 lg:p-8 min-h-[600px]">
                        {/* --- CONTENT TAB --- */}
                        {activeTab === 'content' && (
                            <div className="space-y-6 animate-fadeIn">
                                <div>
                                    <label className="block text-sm font-medium text-admin-text-secondary mb-1">Title (H1) *</label>
                                    <input type="text" name="title" value={formData.title} onChange={handleInputChange} className="w-full text-xl font-bold rounded-lg border border-admin-border px-4 py-3 focus:ring-2 focus:ring-admin-primary outline-none" placeholder="Enter title..." />
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-admin-text-secondary mb-1">Slug</label>
                                        <div className="flex rounded-lg border border-admin-border overflow-hidden">
                                            <span className="px-3 py-2 text-sm bg-gray-50 text-gray-500 border-r border-admin-border">/blog/</span>
                                            <input type="text" name="slug" value={formData.slug} onChange={handleInputChange} className="flex-1 px-3 py-2 text-sm outline-none" placeholder="url-slug" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-admin-text-secondary mb-1">Excerpt</label>
                                        <textarea name="excerpt" value={formData.excerpt} onChange={handleInputChange} rows={2} className="w-full rounded-lg border border-admin-border px-3 py-2 text-sm outline-none" placeholder="Short summary..." />
                                    </div>
                                </div>

                                <RichTextEditor content={formData.content} onChange={handleContentChange} className="min-h-[500px]" />
                                
                                {/* Link Auditor */}
                                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                    <h3 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm">link</span> Link Auditor
                                    </h3>
                                    <div className="text-xs text-gray-500 mb-2">
                                        Internal: {stats.internalLinks} | External: {stats.externalLinks}
                                    </div>
                                    <div className="max-h-40 overflow-y-auto space-y-1">
                                        {(formData.content.match(/href="([^"]*)"/g) || []).map((link, i) => {
                                            const url = link.match(/href="([^"]*)"/)![1];
                                            const isExternal = !url.startsWith('/') && !url.includes('nepalvisuals.com');
                                            
                                            let isBroken = false;
                                            if (!isExternal) {
                                                let path = url;
                                                if (url.startsWith('http')) {
                                                    try {
                                                        path = new URL(url).pathname;
                                                    } catch(e) {}
                                                }
                                                
                                                if (path.startsWith('/blog/')) {
                                                    const slug = path.replace('/blog/', '').split('#')[0].split('?')[0];
                                                    // Only check if we have available posts loaded and it's not the current post
                                                    if (slug && availablePosts.length > 0 && slug !== formData.slug && !availablePosts.some(p => p.slug === slug)) {
                                                        isBroken = true;
                                                    }
                                                }
                                            }

                                            return (
                                                <div key={i} className="flex items-center justify-between text-xs p-1 bg-white border border-gray-200 rounded">
                                                    <span className={`truncate flex-1 ${isExternal ? 'text-orange-600' : 'text-green-600'}`}>
                                                        {url}
                                                    </span>
                                                    {isBroken ? (
                                                        <span className="ml-2 px-1.5 py-0.5 bg-red-100 text-red-700 rounded font-bold text-[10px] whitespace-nowrap flex items-center gap-1">
                                                            <span className="material-symbols-outlined text-[10px]">link_off</span>
                                                            Broken?
                                                        </span>
                                                    ) : (
                                                        <a href={url} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 hover:underline">Check</a>
                                                    )}
                                                </div>
                                            );
                                        })}
                                        {stats.internalLinks === 0 && stats.externalLinks === 0 && (
                                            <div className="text-xs text-gray-400 italic">No links found in content.</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- RELATIONSHIPS TAB --- */}
                        {activeTab === 'relationships' && (
                            <div className="space-y-8 animate-fadeIn">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <h3 className="font-bold text-admin-text-primary border-b pb-2">Topic Cluster (Pillar)</h3>
                                        <div>
                                            <label className="block text-sm font-medium text-admin-text-secondary mb-1">Parent Article (Pillar)</label>
                                            <select name="parent_id" value={formData.parent_id} onChange={handleInputChange} className="w-full rounded-lg border border-admin-border px-3 py-2 text-sm">
                                                <option value="">None (Top Level)</option>
                                                {availablePosts.filter(p => p.id !== (id || '')).map(p => (
                                                    <option key={p.id} value={p.id}>{p.title}</option>
                                                ))}
                                            </select>
                                            <p className="text-xs text-gray-500 mt-2 bg-blue-50 p-2 rounded border border-blue-100">
                                                <span className="font-bold">SEO Strategy:</span> Selecting a parent creates a <strong>Topic Cluster</strong>. This post will become a sub-topic (cluster content) of the selected Pillar Page, strengthening the authority of both.
                                            </p>
                                        </div>

                                        {/* Child Posts (if this is a Pillar) */}
                                        {isEditing && (
                                            <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg mt-4">
                                                <div className="flex justify-between items-center mb-3">
                                                    <h4 className="text-sm font-bold text-blue-800 flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-sm">hub</span>
                                                        Cluster Content (Children)
                                                    </h4>
                                                    <a 
                                                        href={`/admin/blog/create?parent_id=${id}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-[10px] bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 flex items-center gap-1 transition-colors"
                                                    >
                                                        <span className="material-symbols-outlined text-[10px]">add</span>
                                                        Add Child Post
                                                    </a>
                                                </div>
                                                
                                                {childPosts.length > 0 ? (
                                                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                                        {childPosts.map(child => (
                                                            <div key={child.id} className="flex items-center justify-between text-xs bg-white p-2.5 rounded border border-blue-100 shadow-sm">
                                                                <div className="flex flex-col">
                                                                    <span className="font-medium text-gray-800">{child.title}</span>
                                                                    <span className="text-[10px] text-gray-400">/{child.slug}</span>
                                                                </div>
                                                                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                                                                    child.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                                                }`}>
                                                                    {child.status}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-gray-500 italic">No child posts yet. Add a child post to create a topic cluster.</p>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between border-b pb-2">
                                            <h3 className="font-bold text-admin-text-primary">Related Posts</h3>
                                            <button 
                                                onClick={handleAutoSuggestRelated}
                                                type="button"
                                                className="text-xs bg-admin-primary text-white px-3 py-1.5 rounded-lg hover:bg-admin-primary-hover flex items-center gap-1 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                                                Auto Suggest
                                            </button>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-admin-text-secondary mb-1">Manual Selection</label>
                                            <div className="flex flex-col gap-2 p-3 border border-admin-border rounded-lg max-h-[400px] overflow-y-auto bg-white">
                                                {availablePosts.filter(p => p.id !== (id || '')).length === 0 ? (
                                                    <span className="text-xs text-gray-500">No other posts available.</span>
                                                ) : (
                                                    availablePosts.filter(p => p.id !== (id || '')).map(post => (
                                                        <label key={post.id} className={`flex items-start gap-3 p-2.5 rounded cursor-pointer transition-colors border ${
                                                            formData.related_post_ids.includes(post.id) 
                                                                ? 'bg-blue-50 border-blue-200' 
                                                                : 'hover:bg-gray-50 border-transparent'
                                                        }`}>
                                                            <input
                                                                type="checkbox"
                                                                checked={formData.related_post_ids.includes(post.id)}
                                                                onChange={() => handleRelatedPostToggle(post.id)}
                                                                className="mt-0.5 rounded border-gray-300 text-admin-primary focus:ring-admin-primary"
                                                            />
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-medium text-gray-800">{post.title}</span>
                                                                <span className="text-xs text-gray-500">{post.category?.name || 'Uncategorized'}</span>
                                                            </div>
                                                        </label>
                                                    ))
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-2">
                                                Selected posts will appear in the "Read More" section. Auto-suggest finds posts with similar tags and categories.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- SEO TAB --- */}
                        {activeTab === 'seo' && (
                            <div className="space-y-8 animate-fadeIn">
                                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                                    <h3 className="text-sm font-bold text-blue-800 mb-2 flex items-center gap-2">
                                        <span className="material-symbols-outlined">visibility</span> Google SERP Preview
                                    </h3>
                                    <div className="bg-white p-4 rounded border border-gray-200 max-w-2xl">
                                        <div className="text-xs text-gray-500 mb-1">nepalvisuals.com › blog › {formData.slug || 'url'}</div>
                                        <div className="text-xl text-[#1a0dab] font-medium hover:underline truncate cursor-pointer">{formData.seo_title || formData.title || 'Page Title'}</div>
                                        <div className="text-sm text-gray-600 line-clamp-2">{formData.meta_description || formData.excerpt || 'Meta description goes here...'}</div>
                                    </div>
                                </div>

                                <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="text-sm font-bold text-purple-800 flex items-center gap-2">
                                            <span className="material-symbols-outlined">link</span> Internal Link Suggestions & Health
                                        </h3>
                                        <button 
                                            type="button" 
                                            onClick={analyzeLinks} 
                                            disabled={analyzingLinks}
                                            className="px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded hover:bg-purple-700 transition-colors disabled:opacity-50"
                                        >
                                            {analyzingLinks ? 'Analyzing...' : 'Analyze Content'}
                                        </button>
                                    </div>
                                    
                                    {/* Suggestions */}
                                    {linkSuggestions.length > 0 && (
                                        <div className="mb-4">
                                            <h4 className="text-xs font-bold text-purple-700 uppercase mb-2">Link Opportunities</h4>
                                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                                {linkSuggestions.map((s, i) => (
                                                    <div key={i} className="text-sm bg-white p-2 rounded border border-purple-100 flex justify-between items-center">
                                                        <span>
                                                            Found <span className="font-bold">"{s.text}"</span>
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            Link to: <a href={`/blog/${s.post.slug}`} target="_blank" rel="noreferrer" className="text-purple-600 hover:underline">{s.post.title}</a>
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Broken Links */}
                                    {brokenLinks.length > 0 && (
                                        <div>
                                            <h4 className="text-xs font-bold text-red-700 uppercase mb-2">Potential Broken Links</h4>
                                            <div className="space-y-2">
                                                {brokenLinks.map((link, i) => (
                                                    <div key={i} className="text-sm bg-red-50 p-2 rounded border border-red-100 text-red-700 flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-sm">broken_image</span>
                                                        {link}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {linkSuggestions.length === 0 && brokenLinks.length === 0 && !analyzingLinks && (
                                        <p className="text-xs text-gray-500 italic">Click "Analyze Content" to find internal linking opportunities and check for broken internal links.</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h3 className="font-bold text-admin-text-primary border-b pb-2">On-Page SEO</h3>
                                        <div>
                                            <label className="block text-sm font-medium text-admin-text-secondary mb-1">Primary Keyword</label>
                                            <input type="text" name="primary_keyword" value={formData.primary_keyword} onChange={handleInputChange} className="w-full rounded-lg border border-admin-border px-3 py-2 text-sm" placeholder="Focus keyword" />
                                            {formData.primary_keyword && availablePosts.some(p => p.primary_keyword?.toLowerCase() === formData.primary_keyword.toLowerCase() && p.id !== (id || '')) && (
                                                <div className="text-xs text-red-600 mt-1 flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-xs">warning</span>
                                                    Keyword cannibalization detected: Used in another post.
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-admin-text-secondary mb-1">Secondary Keywords</label>
                                            <input type="text" name="secondary_keywords" value={formData.secondary_keywords} onChange={handleInputChange} className="w-full rounded-lg border border-admin-border px-3 py-2 text-sm" placeholder="Comma separated" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-admin-text-secondary mb-1">Search Intent</label>
                                            <select name="search_intent" value={formData.search_intent} onChange={handleInputChange} className="w-full rounded-lg border border-admin-border px-3 py-2 text-sm">
                                                <option value="informational">Informational (How-to, Guide)</option>
                                                <option value="commercial">Commercial (Review, Best of)</option>
                                                <option value="transactional">Transactional (Booking)</option>
                                                <option value="navigational">Navigational</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="font-bold text-admin-text-primary border-b pb-2">Meta Tags</h3>
                                        <div>
                                            <label className="block text-sm font-medium text-admin-text-secondary mb-1">SEO Title</label>
                                            <input type="text" name="seo_title" value={formData.seo_title} onChange={handleInputChange} className="w-full rounded-lg border border-admin-border px-3 py-2 text-sm" placeholder="Ideally 50-60 chars" />
                                            <p className="text-xs text-right mt-1 text-gray-500">{formData.seo_title.length}/60</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-admin-text-secondary mb-1">Meta Description</label>
                                            <textarea name="meta_description" value={formData.meta_description} onChange={handleInputChange} rows={3} className="w-full rounded-lg border border-admin-border px-3 py-2 text-sm" placeholder="Ideally 150-160 chars" />
                                            <p className="text-xs text-right mt-1 text-gray-500">{formData.meta_description.length}/160</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-admin-text-secondary mb-1">Canonical URL</label>
                                            <input type="text" name="canonical_url" value={formData.canonical_url} onChange={handleInputChange} className="w-full rounded-lg border border-admin-border px-3 py-2 text-sm" placeholder="Leave empty if self-referencing" />
                                        </div>
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-2 text-sm text-admin-text-secondary">
                                                <input type="checkbox" name="is_no_index" checked={formData.is_no_index} onChange={handleInputChange} /> No Index
                                            </label>
                                            <label className="flex items-center gap-2 text-sm text-admin-text-secondary">
                                                <input type="checkbox" name="is_no_follow" checked={formData.is_no_follow} onChange={handleInputChange} /> No Follow
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- SOCIAL TAB --- */}
                        {activeTab === 'social' && (
                            <div className="space-y-8 animate-fadeIn">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Left Column: Inputs */}
                                    <div className="space-y-6">
                                        <div className="space-y-4">
                                            <h3 className="font-bold text-admin-text-primary border-b pb-2">Open Graph (Facebook/LinkedIn)</h3>
                                            <div>
                                                <label className="block text-sm font-medium text-admin-text-secondary mb-1">OG Title</label>
                                                <input type="text" name="og_title" value={formData.og_title} onChange={handleInputChange} placeholder={formData.title} className="w-full rounded-lg border border-admin-border px-3 py-2 text-sm" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-admin-text-secondary mb-1">OG Description</label>
                                                <textarea name="og_description" value={formData.og_description} onChange={handleInputChange} placeholder={formData.excerpt} rows={3} className="w-full rounded-lg border border-admin-border px-3 py-2 text-sm" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-admin-text-secondary mb-1">OG Image</label>
                                                <ImageUpload 
                                                    label="OG Image"
                                                    image={formData.og_image} 
                                                    alt={formData.featured_image_alt}
                                                    onImageChange={(url) => setFormData(prev => ({ ...prev, og_image: url }))}
                                                    onAltChange={(alt) => setFormData(prev => ({ ...prev, featured_image_alt: alt }))}
                                                    className="h-40" 
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-4 pt-6">
                                            <h3 className="font-bold text-admin-text-primary border-b pb-2">Twitter Card</h3>
                                            <div>
                                                <label className="block text-sm font-medium text-admin-text-secondary mb-1">Card Type</label>
                                                <select name="twitter_card" value={formData.twitter_card} onChange={handleInputChange} className="w-full rounded-lg border border-admin-border px-3 py-2 text-sm">
                                                    <option value="summary_large_image">Summary Large Image</option>
                                                    <option value="summary">Summary</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column: Preview */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between border-b pb-2">
                                            <h3 className="font-bold text-admin-text-primary">Social Preview</h3>
                                            <div className="flex bg-gray-100 p-1 rounded-lg">
                                                <button
                                                    onClick={() => setSocialPreviewType('facebook')}
                                                    className={`px-3 py-1 text-xs font-bold rounded transition-all ${socialPreviewType === 'facebook' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                                >
                                                    Facebook
                                                </button>
                                                <button
                                                    onClick={() => setSocialPreviewType('twitter')}
                                                    className={`px-3 py-1 text-xs font-bold rounded transition-all ${socialPreviewType === 'twitter' ? 'bg-white text-sky-500 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                                >
                                                    Twitter
                                                </button>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 flex items-center justify-center min-h-[400px]">
                                            {socialPreviewType === 'facebook' ? (
                                                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden max-w-[500px] w-full shadow-sm">
                                                    <div className="relative bg-gray-100 aspect-[1.91/1] flex items-center justify-center overflow-hidden">
                                                        {formData.og_image || formData.featured_image ? (
                                                            <img src={formData.og_image || formData.featured_image} alt="OG" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="material-symbols-outlined text-4xl text-gray-300">image</span>
                                                        )}
                                                    </div>
                                                    <div className="p-3 bg-[#f0f2f5] border-t border-gray-200">
                                                        <div className="text-[10px] text-gray-500 uppercase truncate">NEPALVISUALS.COM</div>
                                                        <div className="font-bold text-[#050505] text-[16px] leading-5 mt-0.5 line-clamp-2">
                                                            {formData.og_title || formData.title || 'Your Post Title'}
                                                        </div>
                                                        <div className="text-[14px] text-[#65676b] mt-1 line-clamp-1">
                                                            {formData.og_description || formData.excerpt || 'Your post description will appear here...'}
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden max-w-[400px] w-full shadow-sm">
                                                    {formData.twitter_card === 'summary_large_image' ? (
                                                        <>
                                                            <div className="relative bg-gray-100 aspect-[2/1] flex items-center justify-center overflow-hidden">
                                                                {formData.og_image || formData.featured_image ? (
                                                                    <img src={formData.og_image || formData.featured_image} alt="Twitter" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <span className="material-symbols-outlined text-4xl text-gray-300">image</span>
                                                                )}
                                                            </div>
                                                            <div className="p-3 border-t border-gray-100">
                                                                <div className="text-[15px] font-bold text-gray-900 leading-5">
                                                                    {formData.og_title || formData.title || 'Your Post Title'}
                                                                </div>
                                                                <div className="text-[15px] text-gray-500 mt-1 line-clamp-2 leading-5">
                                                                    {formData.og_description || formData.excerpt || 'Your post description will appear here...'}
                                                                </div>
                                                                <div className="text-[15px] text-gray-500 mt-1 flex items-center gap-1">
                                                                    <span className="material-symbols-outlined text-[16px]">link</span>
                                                                    nepalvisuals.com
                                                                </div>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="flex">
                                                            <div className="w-[120px] h-[120px] bg-gray-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                                                {formData.og_image || formData.featured_image ? (
                                                                    <img src={formData.og_image || formData.featured_image} alt="Twitter" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <span className="material-symbols-outlined text-2xl text-gray-300">image</span>
                                                                )}
                                                            </div>
                                                            <div className="p-3 flex flex-col justify-center border-l border-gray-100">
                                                                <div className="text-[15px] font-bold text-gray-900 leading-tight line-clamp-2">
                                                                    {formData.og_title || formData.title || 'Your Post Title'}
                                                                </div>
                                                                <div className="text-[14px] text-gray-500 mt-1 line-clamp-2 leading-tight">
                                                                    {formData.og_description || formData.excerpt || 'Description...'}
                                                                </div>
                                                                <div className="text-[13px] text-gray-400 mt-1">nepalvisuals.com</div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- SETTINGS TAB --- */}
                        {activeTab === 'settings' && (
                            <div className="space-y-8 animate-fadeIn">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <h3 className="font-bold text-admin-text-primary border-b pb-2">Publishing</h3>
                                        <div>
                                            <label className="block text-sm font-medium text-admin-text-secondary mb-1">Author</label>
                                            <select name="author_id" value={formData.author_id} onChange={handleInputChange} className="w-full rounded-lg border border-admin-border px-3 py-2 text-sm">
                                                <option value="">Select Author...</option>
                                                {authors.map(a => <option key={a.id} value={a.id}>{a.full_name} ({a.email})</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-admin-text-secondary mb-1">Status</label>
                                            <select name="status" value={formData.status} onChange={handleInputChange} className="w-full rounded-lg border border-admin-border px-3 py-2 text-sm">
                                                <option value="draft">Draft</option>
                                                <option value="published">Published</option>
                                                <option value="scheduled">Scheduled</option>
                                                <option value="archived">Archived</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-admin-text-secondary mb-1">Published Date</label>
                                            <input type="date" name="published_at" value={formData.published_at} onChange={handleInputChange} className="w-full rounded-lg border border-admin-border px-3 py-2 text-sm" />
                                        </div>
                                        {formData.status === 'scheduled' && (
                                            <div>
                                                <label className="block text-sm font-medium text-admin-text-secondary mb-1">Scheduled For</label>
                                                <input type="datetime-local" name="scheduled_at" value={formData.scheduled_at} onChange={handleInputChange} className="w-full rounded-lg border border-admin-border px-3 py-2 text-sm" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="font-bold text-admin-text-primary border-b pb-2">Display Options</h3>
                                        <div className="space-y-3">
                                            <label className="flex items-center gap-3 p-3 border border-admin-border rounded-lg cursor-pointer hover:bg-gray-50">
                                                <input type="checkbox" name="is_featured" checked={formData.is_featured} onChange={handleInputChange} className="rounded border-gray-300 text-admin-primary focus:ring-admin-primary w-5 h-5" />
                                                <div>
                                                    <div className="font-medium text-admin-text-primary">Featured Post</div>
                                                    <div className="text-xs text-admin-text-secondary">Pin to homepage or featured sections</div>
                                                </div>
                                            </label>
                                            <label className="flex items-center gap-3 p-3 border border-admin-border rounded-lg cursor-pointer hover:bg-gray-50">
                                                <input type="checkbox" name="is_sticky" checked={formData.is_sticky} onChange={handleInputChange} className="rounded border-gray-300 text-admin-primary focus:ring-admin-primary w-5 h-5" />
                                                <div>
                                                    <div className="font-medium text-admin-text-primary">Sticky Post</div>
                                                    <div className="text-xs text-admin-text-secondary">Keep at top of lists</div>
                                                </div>
                                            </label>
                                            <label className="flex items-center gap-3 p-3 border border-admin-border rounded-lg cursor-pointer hover:bg-gray-50">
                                                <input type="checkbox" name="show_toc" checked={formData.show_toc} onChange={handleInputChange} className="rounded border-gray-300 text-admin-primary focus:ring-admin-primary w-5 h-5" />
                                                <div>
                                                    <div className="font-medium text-admin-text-primary">Table of Contents</div>
                                                    <div className="text-xs text-admin-text-secondary">Auto-generate from headings</div>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <h3 className="font-bold text-admin-text-primary border-b pb-2">Classification</h3>
                                        <div>
                                            <label className="block text-sm font-medium text-admin-text-secondary mb-1">Category (Primary)</label>
                                            <select name="category_id" value={formData.category_id} onChange={handleInputChange} className="w-full rounded-lg border border-admin-border px-3 py-2 text-sm">
                                                <option value="">Select Category...</option>
                                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-admin-text-secondary mb-1">Secondary Categories</label>
                                            <div className="flex flex-wrap gap-2 p-3 border border-admin-border rounded-lg max-h-40 overflow-y-auto">
                                                {categories.filter(c => c.id !== formData.category_id).map(cat => (
                                                    <button
                                                        key={cat.id}
                                                        onClick={() => handleSecondaryCategoryToggle(cat.id)}
                                                        className={`px-2 py-1 text-xs rounded-full border ${
                                                            selectedSecondaryCategories.includes(cat.id) 
                                                            ? 'bg-blue-100 text-blue-700 border-blue-200' 
                                                            : 'bg-white text-gray-600 border-gray-300 hover:border-blue-200'
                                                        }`}
                                                    >
                                                        {cat.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-admin-text-secondary mb-1">Tags</label>
                                            <div className="flex flex-wrap gap-2 p-3 border border-admin-border rounded-lg max-h-40 overflow-y-auto">
                                                {tags.map(tag => (
                                                    <button
                                                        key={tag.id}
                                                        onClick={() => handleTagToggle(tag.id)}
                                                        className={`px-2 py-1 text-xs rounded-full border ${
                                                            formData.tag_ids.includes(tag.id) 
                                                            ? 'bg-admin-primary text-white border-admin-primary' 
                                                            : 'bg-white text-gray-600 border-gray-300 hover:border-admin-primary'
                                                        }`}
                                                    >
                                                        {tag.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-admin-text-secondary mb-1">Content Type</label>
                                            <select name="content_type" value={formData.content_type} onChange={handleInputChange} className="w-full rounded-lg border border-admin-border px-3 py-2 text-sm">
                                                <option value="article">Article (Default)</option>
                                                <option value="guide">Guide</option>
                                                <option value="tutorial">Tutorial</option>
                                                <option value="news">News</option>
                                                <option value="comparison">Comparison</option>
                                            </select>
                                        </div>
                                    </div>

{/* Relationships section moved to dedicated tab */}

                                    <div className="space-y-4">
                                        <h3 className="font-bold text-admin-text-primary border-b pb-2">Schema & Structure</h3>
                                        <div>
                                            <label className="block text-sm font-medium text-admin-text-secondary mb-1">Schema Type</label>
                                            <select name="schema_type" value={formData.schema_type} onChange={handleInputChange} className="w-full rounded-lg border border-admin-border px-3 py-2 text-sm">
                                                <option value="BlogPosting">BlogPosting</option>
                                                <option value="Article">Article</option>
                                                <option value="NewsArticle">NewsArticle</option>
                                            </select>
                                        </div>
                                        
                                        {/* Dynamic Schema Fields based on template/type */}
                                        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium">FAQs</span>
                                                <button onClick={handleAddFAQ} className="text-xs text-admin-primary font-bold">+ Add FAQ</button>
                                            </div>
                                            {formData.faqs.map((faq, i) => (
                                                <div key={i} className="space-y-2 border-l-2 border-admin-primary pl-3">
                                                    <input type="text" placeholder="Question" value={faq.question} onChange={e => handleFAQChange(i, 'question', e.target.value)} className="w-full text-xs p-1 border rounded" />
                                                    <textarea placeholder="Answer" value={faq.answer} onChange={e => handleFAQChange(i, 'answer', e.target.value)} className="w-full text-xs p-1 border rounded" rows={2} />
                                                    <button onClick={() => handleDeleteFAQ(i)} className="text-xs text-red-500">Remove</button>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium">How-To Steps</span>
                                                <button onClick={handleAddStep} className="text-xs text-admin-primary font-bold">+ Add Step</button>
                                            </div>
                                            {formData.steps.map((step, i) => (
                                                <div key={i} className="flex gap-2">
                                                    <span className="text-xs font-bold pt-1">{i+1}.</span>
                                                    <textarea value={step} onChange={e => handleStepChange(i, e.target.value)} className="w-full text-xs p-1 border rounded" rows={2} />
                                                    <button onClick={() => handleDeleteStep(i)} className="text-xs text-red-500 self-start">x</button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Publish Box */}
                    <div className="bg-admin-surface rounded-xl border border-admin-border shadow-sm p-4">
                        <h3 className="font-bold text-admin-text-primary mb-3">Publish</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-admin-text-secondary mb-1">Status</label>
                                <select name="status" value={formData.status} onChange={handleInputChange} className="w-full rounded border border-admin-border px-2 py-1 text-sm">
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                    <option value="archived">Archived</option>
                                    <option value="scheduled">Scheduled</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-admin-text-secondary mb-1">Publish Date</label>
                                <input type="date" name="published_at" value={formData.published_at} onChange={handleInputChange} className="w-full rounded border border-admin-border px-2 py-1 text-sm" />
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" name="is_featured" checked={formData.is_featured} onChange={handleInputChange} />
                                <label className="text-sm text-admin-text-primary">Featured Post</label>
                            </div>
                        </div>
                    </div>

                    {/* Stats Box */}
                    <div className="bg-admin-surface rounded-xl border border-admin-border shadow-sm p-4">
                        <h3 className="font-bold text-admin-text-primary mb-3">Content Stats</h3>
                        
                        {/* Content Score */}
                        <div className="mb-4 text-center">
                            <div className="relative inline-flex items-center justify-center">
                                <svg className="w-20 h-20 transform -rotate-90">
                                    <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-200" />
                                    <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" 
                                        strokeDasharray={226} 
                                        strokeDashoffset={226 - (226 * stats.contentScore) / 100} 
                                        className={`${stats.contentScore >= 80 ? 'text-green-500' : stats.contentScore >= 50 ? 'text-yellow-500' : 'text-red-500'} transition-all duration-1000 ease-out`} 
                                    />
                                </svg>
                                <span className="absolute text-xl font-bold text-admin-text-primary">{stats.contentScore}</span>
                            </div>
                            <div className="text-xs font-medium mt-1 text-admin-text-secondary">SEO Score</div>
                        </div>

                        <ul className="space-y-2 text-sm">
                            <li className="flex justify-between text-admin-text-secondary">
                                <span>Word Count:</span>
                                <span className="font-mono text-admin-text-primary">{stats.wordCount}</span>
                            </li>
                            <li className="flex justify-between text-admin-text-secondary">
                                <span>Reading Time:</span>
                                <span className="font-mono text-admin-text-primary">{stats.readingTime} min</span>
                            </li>
                            <li className="flex justify-between text-admin-text-secondary">
                                <span>Internal Links:</span>
                                <span className="font-mono text-admin-text-primary">{stats.internalLinks}</span>
                            </li>
                            <li className="flex justify-between text-admin-text-secondary">
                                <span>External Links:</span>
                                <span className="font-mono text-admin-text-primary">{stats.externalLinks}</span>
                            </li>
                        </ul>
                    </div>

                    {/* Featured Image */}
                    <div className="bg-admin-surface rounded-xl border border-admin-border shadow-sm p-4">
                        <h3 className="font-bold text-admin-text-primary mb-3">Featured Image</h3>
                        <ImageUpload 
                            label="Featured Image"
                            image={formData.featured_image} 
                            alt={formData.featured_image_alt}
                            onImageChange={(url) => setFormData(prev => ({ ...prev, featured_image: url }))}
                            onAltChange={(alt) => setFormData(prev => ({ ...prev, featured_image_alt: alt }))}
                            className="h-32 mb-2" 
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminBlogCreatePage;
