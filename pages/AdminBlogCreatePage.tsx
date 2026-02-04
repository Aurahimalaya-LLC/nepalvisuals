import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { RichTextEditor } from '../components/common/RichTextEditor';
import { ImageUpload } from '../components/admin/ImageUpload';

interface FAQ {
    question: string;
    answer: string;
}

interface BlogFormData {
    // Core Content
    title: string;
    slug: string;
    breadcrumbTitle: string;
    content: string;
    excerpt: string;
    category: string;
    
    // Media
    featuredImage: string;
    featuredImageAlt: string;
    ogImage: string;
    twitterImage: string;
    
    // SEO
    seoTitle: string;
    metaDescription: string;
    canonicalUrl: string;
    isNoIndex: boolean;
    isNoFollow: boolean;
    
    // Settings
    author: string;
    publishDate: string;
    lastUpdatedDate: string;
    template: string;
    schemaType: 'Article' | 'BlogPosting' | 'NewsArticle';
    
    // Structured Data
    faqs: FAQ[];
    reviewRating: string;
    reviewCount: string;
    steps: string[]; // For HowTo
    speakableSelector: string; // For Speakable
}

const AdminBlogCreatePage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'content' | 'seo' | 'media' | 'settings'>('content');
    
    const [formData, setFormData] = useState<BlogFormData>({
        title: '',
        slug: '',
        breadcrumbTitle: '',
        content: '',
        excerpt: '',
        category: '',
        
        featuredImage: '',
        featuredImageAlt: '',
        ogImage: '',
        twitterImage: '',
        
        seoTitle: '',
        metaDescription: '',
        canonicalUrl: '',
        isNoIndex: false,
        isNoFollow: false,
        
        author: '',
        publishDate: new Date().toISOString().split('T')[0],
        lastUpdatedDate: new Date().toISOString().split('T')[0],
        template: 'standard',
        schemaType: 'BlogPosting',
        
        faqs: [],
        reviewRating: '5',
        reviewCount: '1',
        steps: [],
        speakableSelector: '#content'
    });

    const [generatedSchema, setGeneratedSchema] = useState('');

    React.useEffect(() => {
        const categoryPath = formData.category ? `${formData.category}/` : '';
        const postUrl = formData.canonicalUrl || `https://nepalvisuals.com/blog/${categoryPath}${formData.slug}`;

        const schema: any = {
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": formData.schemaType,
                    "headline": formData.seoTitle || formData.title,
                    "description": formData.metaDescription || formData.excerpt,
                    "image": formData.featuredImage ? [formData.featuredImage] : [],
                    "datePublished": formData.publishDate,
                    "dateModified": formData.lastUpdatedDate,
                    "speakable": formData.speakableSelector ? {
                        "@type": "SpeakableSpecification",
                        "cssSelector": [formData.speakableSelector]
                    } : undefined,
                    "author": {
                        "@type": "Person",
                        "name": formData.author || "Nepal Visuals"
                    },
                    "publisher": {
                        "@type": "Organization",
                        "name": "Nepal Visuals",
                        "logo": {
                            "@type": "ImageObject",
                            "url": "https://nepalvisuals.com/logo.png"
                        }
                    },
                    "mainEntityOfPage": {
                        "@type": "WebPage",
                        "@id": postUrl
                    }
                }
            ]
        };

        if (formData.faqs.length > 0) {
            schema["@graph"].push({
                "@type": "FAQPage",
                "mainEntity": formData.faqs.map(faq => ({
                    "@type": "Question",
                    "name": faq.question,
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": faq.answer
                    }
                }))
            });
        }

        if (formData.steps.length > 0) {
            schema["@graph"].push({
                "@type": "HowTo",
                "name": formData.seoTitle || formData.title,
                "step": formData.steps.map((step, index) => ({
                    "@type": "HowToStep",
                    "position": index + 1,
                    "text": step
                }))
            });
        }

        if (formData.template === 'review') {
            schema["@graph"].push({
                "@type": "Review",
                "reviewRating": {
                    "@type": "Rating",
                    "ratingValue": formData.reviewRating,
                    "bestRating": "5",
                    "worstRating": "1"
                },
                "author": {
                    "@type": "Person",
                    "name": formData.author || "Nepal Visuals"
                }
            });
        }

        // Add BreadcrumbList explicitly
        schema["@graph"].push({
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Home",
                    "item": "https://nepalvisuals.com"
                },
                {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "Blog",
                    "item": "https://nepalvisuals.com/blog"
                },
                {
                    "@type": "ListItem",
                    "position": 3,
                    "name": formData.breadcrumbTitle || formData.title,
                    "item": postUrl
                }
            ]
        });

        setGeneratedSchema(JSON.stringify(schema, null, 2));
    }, [formData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleContentChange = (html: string) => {
        setFormData(prev => ({ ...prev, content: html }));
    };

    const handleAddFAQ = () => {
        setFormData(prev => ({
            ...prev,
            faqs: [...prev.faqs, { question: '', answer: '' }]
        }));
    };

    const handleFAQChange = (index: number, field: 'question' | 'answer', value: string) => {
        const newFAQs = [...formData.faqs];
        newFAQs[index][field] = value;
        setFormData(prev => ({ ...prev, faqs: newFAQs }));
    };

    const handleDeleteFAQ = (index: number) => {
        setFormData(prev => ({
            ...prev,
            faqs: prev.faqs.filter((_, i) => i !== index)
        }));
    };

    const handleAddStep = () => {
        setFormData(prev => ({
            ...prev,
            steps: [...prev.steps, '']
        }));
    };

    const handleStepChange = (index: number, value: string) => {
        const newSteps = [...formData.steps];
        newSteps[index] = value;
        setFormData(prev => ({ ...prev, steps: newSteps }));
    };

    const handleDeleteStep = (index: number) => {
        setFormData(prev => ({
            ...prev,
            steps: prev.steps.filter((_, i) => i !== index)
        }));
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            <div className="mb-8 flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-admin-text-primary">Create Blog Post</h1>
                    <p className="mt-1 text-sm text-admin-text-secondary">Create a new blog post with full SEO and schema support.</p>
                </div>
                <div className="flex gap-3">
                    <Link
                        to="/admin/blog"
                        className="px-4 py-2 border border-admin-border rounded-lg text-sm font-semibold text-admin-text-secondary hover:bg-white transition-colors bg-white"
                    >
                        Cancel
                    </Link>
                    <button
                        className="px-4 py-2 bg-admin-primary text-white rounded-lg text-sm font-bold shadow-sm hover:bg-admin-primary-hover transition-colors flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-sm">save</span>
                        Save Post
                    </button>
                </div>
            </div>

            <div className="bg-admin-surface rounded-xl border border-admin-border shadow-sm overflow-hidden flex flex-col lg:flex-row">
                {/* Vertical Tabs for Desktop */}
                <div className="lg:w-64 border-b lg:border-b-0 lg:border-r border-admin-border bg-gray-50/50">
                    <div className="flex lg:flex-col overflow-x-auto lg:overflow-visible">
                        <button
                            className={`flex items-center gap-3 px-6 py-4 text-sm font-semibold transition-colors whitespace-nowrap lg:whitespace-normal border-b-2 lg:border-b-0 lg:border-l-2 text-left w-full ${activeTab === 'content' ? 'border-admin-primary text-admin-primary bg-admin-primary/5' : 'border-transparent text-admin-text-secondary hover:text-admin-text-primary hover:bg-gray-100'}`}
                            onClick={() => setActiveTab('content')}
                        >
                            <span className="material-symbols-outlined">edit_document</span>
                            Core Content
                        </button>
                        <button
                            className={`flex items-center gap-3 px-6 py-4 text-sm font-semibold transition-colors whitespace-nowrap lg:whitespace-normal border-b-2 lg:border-b-0 lg:border-l-2 text-left w-full ${activeTab === 'seo' ? 'border-admin-primary text-admin-primary bg-admin-primary/5' : 'border-transparent text-admin-text-secondary hover:text-admin-text-primary hover:bg-gray-100'}`}
                            onClick={() => setActiveTab('seo')}
                        >
                            <span className="material-symbols-outlined">search</span>
                            SEO & Metadata
                        </button>
                        <button
                            className={`flex items-center gap-3 px-6 py-4 text-sm font-semibold transition-colors whitespace-nowrap lg:whitespace-normal border-b-2 lg:border-b-0 lg:border-l-2 text-left w-full ${activeTab === 'media' ? 'border-admin-primary text-admin-primary bg-admin-primary/5' : 'border-transparent text-admin-text-secondary hover:text-admin-text-primary hover:bg-gray-100'}`}
                            onClick={() => setActiveTab('media')}
                        >
                            <span className="material-symbols-outlined">image</span>
                            Media & Images
                        </button>
                        <button
                            className={`flex items-center gap-3 px-6 py-4 text-sm font-semibold transition-colors whitespace-nowrap lg:whitespace-normal border-b-2 lg:border-b-0 lg:border-l-2 text-left w-full ${activeTab === 'settings' ? 'border-admin-primary text-admin-primary bg-admin-primary/5' : 'border-transparent text-admin-text-secondary hover:text-admin-text-primary hover:bg-gray-100'}`}
                            onClick={() => setActiveTab('settings')}
                        >
                            <span className="material-symbols-outlined">settings</span>
                            Settings & Schema
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-6 lg:p-8 min-h-[600px]">
                    
                    {/* --- CONTENT TAB --- */}
                    {activeTab === 'content' && (
                        <div className="space-y-6 max-w-4xl animate-fadeIn">
                            <div>
                                <label className="block text-sm font-medium text-admin-text-secondary mb-1">Blog Title (H1) *</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="Enter the main title of the blog post..."
                                    className="w-full rounded-lg border border-admin-border px-4 py-3 text-lg font-semibold bg-admin-background focus:ring-2 focus:ring-admin-primary focus:border-transparent outline-none transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-admin-text-secondary mb-1">Slug / URL *</label>
                                    <div className="flex rounded-lg border border-admin-border overflow-hidden bg-admin-background">
                                        <span className="px-3 py-2 text-sm text-gray-500 bg-gray-50 border-r border-admin-border">
                                            /blog/{formData.category ? `${formData.category}/` : ''}
                                        </span>
                                        <input
                                            type="text"
                                            name="slug"
                                            value={formData.slug}
                                            onChange={handleInputChange}
                                            placeholder="my-awesome-post"
                                            className="flex-1 px-3 py-2 text-sm bg-transparent focus:outline-none"
                                        />
                                    </div>
                                    <div className="mt-2">
                                        <label className="block text-xs font-medium text-admin-text-secondary mb-1">Breadcrumb Title (Optional)</label>
                                        <input
                                            type="text"
                                            name="breadcrumbTitle"
                                            value={formData.breadcrumbTitle}
                                            onChange={handleInputChange}
                                            placeholder={formData.title || "Short title for breadcrumbs"}
                                            className="w-full rounded-lg border border-admin-border px-3 py-2 text-sm bg-admin-background focus:ring-2 focus:ring-admin-primary outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-admin-text-secondary mb-1">Category</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="w-full rounded-lg border border-admin-border px-3 py-2 text-sm bg-admin-background focus:ring-2 focus:ring-admin-primary outline-none"
                                    >
                                        <option value="">Select a category...</option>
                                        <option value="trekking">Trekking</option>
                                        <option value="culture">Culture</option>
                                        <option value="guides">Guides</option>
                                        <option value="news">News</option>
                                    </select>
                                    <p className="mt-1 text-xs text-admin-text-secondary">Determines URL structure: /blog/category/slug</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-admin-text-secondary mb-1">Excerpt / Summary</label>
                                <textarea
                                    name="excerpt"
                                    value={formData.excerpt}
                                    onChange={handleInputChange}
                                    rows={3}
                                    placeholder="A brief summary for listing pages and search results..."
                                    className="w-full rounded-lg border border-admin-border px-3 py-2 text-sm bg-admin-background focus:ring-2 focus:ring-admin-primary outline-none resize-none"
                                />
                                <p className="mt-1 text-xs text-admin-text-secondary">Recommended: 150-160 characters.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-admin-text-secondary mb-2">Main Content</label>
                                <RichTextEditor
                                    content={formData.content}
                                    onChange={handleContentChange}
                                    placeholder="Write your blog post here..."
                                    className="min-h-[500px]"
                                />
                                <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">info</span>
                                    Supports headings, lists, images, tables, and more. Use the toolbar above.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* --- SEO TAB --- */}
                    {activeTab === 'seo' && (
                        <div className="space-y-8 max-w-4xl animate-fadeIn">
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
                                <span className="material-symbols-outlined text-blue-600">travel_explore</span>
                                <div>
                                    <h3 className="text-sm font-bold text-blue-800">Search Engine Preview</h3>
                                    <div className="mt-2 bg-white p-3 rounded border border-gray-200 shadow-sm max-w-xl">
                                        <div className="text-xs text-gray-500 mb-1">
                                            example.com › blog › {formData.category ? `${formData.category} › ` : ''}{formData.slug || 'your-url'}
                                        </div>
                                        <div className="text-lg text-[#1a0dab] hover:underline cursor-pointer truncate font-medium">
                                            {formData.seoTitle || formData.title || 'Your Blog Title'}
                                        </div>
                                        <div className="text-sm text-gray-600 line-clamp-2">
                                            {formData.metaDescription || formData.excerpt || 'Your meta description will appear here...'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-admin-text-secondary mb-1">SEO Title</label>
                                    <input
                                        type="text"
                                        name="seoTitle"
                                        value={formData.seoTitle}
                                        onChange={handleInputChange}
                                        placeholder="Title for search engines (if different from H1)"
                                        className="w-full rounded-lg border border-admin-border px-3 py-2 text-sm bg-admin-background focus:ring-2 focus:ring-admin-primary outline-none"
                                    />
                                    <div className="flex justify-between mt-1">
                                        <p className="text-xs text-admin-text-secondary">Leave blank to use Blog Title.</p>
                                        <span className={`text-xs font-medium ${formData.seoTitle.length > 60 ? 'text-red-500' : 'text-green-600'}`}>
                                            {formData.seoTitle.length}/60
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-admin-text-secondary mb-1">Meta Description</label>
                                    <textarea
                                        name="metaDescription"
                                        value={formData.metaDescription}
                                        onChange={handleInputChange}
                                        rows={3}
                                        placeholder="Description for search results..."
                                        className="w-full rounded-lg border border-admin-border px-3 py-2 text-sm bg-admin-background focus:ring-2 focus:ring-admin-primary outline-none resize-none"
                                    />
                                    <div className="flex justify-between mt-1">
                                        <p className="text-xs text-admin-text-secondary">Summarize the page content.</p>
                                        <span className={`text-xs font-medium ${formData.metaDescription.length > 160 ? 'text-red-500' : 'text-green-600'}`}>
                                            {formData.metaDescription.length}/160
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-admin-text-secondary mb-1">Canonical URL</label>
                                    <input
                                        type="text"
                                        name="canonicalUrl"
                                        value={formData.canonicalUrl}
                                        onChange={handleInputChange}
                                        placeholder="https://..."
                                        className="w-full rounded-lg border border-admin-border px-3 py-2 text-sm bg-admin-background focus:ring-2 focus:ring-admin-primary outline-none"
                                    />
                                    <p className="mt-1 text-xs text-admin-text-secondary">Only set if this content is a duplicate of another URL.</p>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-lg border border-admin-border space-y-4">
                                    <h4 className="font-semibold text-sm text-admin-text-primary">Robots Meta Settings</h4>
                                    <div className="flex flex-col gap-3">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="isNoIndex"
                                                checked={formData.isNoIndex}
                                                onChange={handleInputChange}
                                                className="w-4 h-4 text-admin-primary rounded border-gray-300 focus:ring-admin-primary"
                                            />
                                            <span className="text-sm text-admin-text-primary">No Index (Do not show in search results)</span>
                                        </label>
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="isNoFollow"
                                                checked={formData.isNoFollow}
                                                onChange={handleInputChange}
                                                className="w-4 h-4 text-admin-primary rounded border-gray-300 focus:ring-admin-primary"
                                            />
                                            <span className="text-sm text-admin-text-primary">No Follow (Do not follow links on this page)</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- MEDIA TAB --- */}
                    {activeTab === 'media' && (
                        <div className="space-y-8 max-w-4xl animate-fadeIn">
                            <div className="p-6 bg-white border border-admin-border rounded-xl shadow-sm">
                                <h3 className="text-lg font-semibold text-admin-text-primary mb-4">Featured Image</h3>
                                <ImageUpload
                                    label="Featured Image (Primary)"
                                    image={formData.featuredImage}
                                    alt={formData.featuredImageAlt}
                                    onImageChange={(img) => setFormData(prev => ({ ...prev, featuredImage: img }))}
                                    onAltChange={(alt) => setFormData(prev => ({ ...prev, featuredImageAlt: alt }))}
                                    helpText="This image will be used as the main post image and for social sharing cards if specific ones aren't provided."
                                />
                            </div>

                            <div className="p-6 bg-white border border-admin-border rounded-xl shadow-sm">
                                <h3 className="text-lg font-semibold text-admin-text-primary mb-4">Social Media Images</h3>
                                <div className="space-y-8">
                                    <ImageUpload
                                        label="Open Graph Image (Facebook/LinkedIn)"
                                        image={formData.ogImage}
                                        alt="" 
                                        onImageChange={(img) => setFormData(prev => ({ ...prev, ogImage: img }))}
                                        onAltChange={() => {}} // Alt not usually needed for OG meta tag itself but good for preview
                                        aspectRatio="wide"
                                        helpText="Recommended size: 1200x630px"
                                    />
                                    <ImageUpload
                                        label="Twitter Card Image"
                                        image={formData.twitterImage}
                                        alt=""
                                        onImageChange={(img) => setFormData(prev => ({ ...prev, twitterImage: img }))}
                                        onAltChange={() => {}}
                                        aspectRatio="wide"
                                        helpText="Recommended size: 1200x600px"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- SETTINGS TAB --- */}
                    {activeTab === 'settings' && (
                        <div className="space-y-8 max-w-4xl animate-fadeIn">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-admin-text-secondary mb-1">Author *</label>
                                    <select
                                        name="author"
                                        value={formData.author}
                                        onChange={handleInputChange}
                                        className="w-full rounded-lg border border-admin-border px-3 py-2 text-sm bg-admin-background focus:ring-2 focus:ring-admin-primary outline-none"
                                    >
                                        <option value="">Select author...</option>
                                        <option value="admin">Current User (Admin)</option>
                                        {/* Dynamic authors would be loaded here */}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-admin-text-secondary mb-1">Page Template</label>
                                    <select
                                        name="template"
                                        value={formData.template}
                                        onChange={handleInputChange}
                                        className="w-full rounded-lg border border-admin-border px-3 py-2 text-sm bg-admin-background focus:ring-2 focus:ring-admin-primary outline-none"
                                    >
                                        <option value="standard">Standard Post</option>
                                        <option value="video">Video Post</option>
                                        <option value="gallery">Gallery Post</option>
                                        <option value="review">Review / Guide</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-admin-text-secondary mb-1">Publish Date</label>
                                    <input
                                        type="date"
                                        name="publishDate"
                                        value={formData.publishDate}
                                        onChange={handleInputChange}
                                        className="w-full rounded-lg border border-admin-border px-3 py-2 text-sm bg-admin-background focus:ring-2 focus:ring-admin-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-admin-text-secondary mb-1">Last Updated Date</label>
                                    <input
                                        type="date"
                                        name="lastUpdatedDate"
                                        value={formData.lastUpdatedDate}
                                        onChange={handleInputChange}
                                        className="w-full rounded-lg border border-admin-border px-3 py-2 text-sm bg-admin-background focus:ring-2 focus:ring-admin-primary outline-none"
                                    />
                                </div>
                            </div>

                            <div className="border-t border-admin-border pt-6">
                                <h3 className="text-lg font-semibold text-admin-text-primary mb-4">Structured Data (Schema.org)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <label className="block text-sm font-medium text-admin-text-secondary mb-1">Primary Schema Type</label>
                                        <select
                                            name="schemaType"
                                            value={formData.schemaType}
                                            onChange={handleInputChange}
                                            className="w-full rounded-lg border border-admin-border px-3 py-2 text-sm bg-admin-background focus:ring-2 focus:ring-admin-primary outline-none"
                                        >
                                            <option value="BlogPosting">BlogPosting (Default)</option>
                                            <option value="Article">Article (General)</option>
                                            <option value="NewsArticle">NewsArticle</option>
                                        </select>
                                        <p className="mt-1 text-xs text-admin-text-secondary">Used for generating JSON-LD structured data.</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-admin-text-secondary mb-1">Speakable Selector</label>
                                        <input
                                            type="text"
                                            name="speakableSelector"
                                            value={formData.speakableSelector}
                                            onChange={handleInputChange}
                                            placeholder="#content (CSS Selector)"
                                            className="w-full rounded-lg border border-admin-border px-3 py-2 text-sm bg-admin-background focus:ring-2 focus:ring-admin-primary outline-none"
                                        />
                                        <p className="mt-1 text-xs text-admin-text-secondary">CSS selector for content that can be read aloud by Google Assistant.</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="block text-sm font-medium text-admin-text-secondary">FAQ Schema</label>
                                        <button
                                            type="button"
                                            onClick={handleAddFAQ}
                                            className="text-xs font-bold text-admin-primary hover:text-admin-primary-hover flex items-center gap-1 border border-admin-primary/30 px-2 py-1 rounded bg-admin-primary/5"
                                        >
                                            <span className="material-symbols-outlined text-sm">add</span>
                                            Add Question
                                        </button>
                                    </div>
                                    
                                    {formData.faqs.length === 0 ? (
                                        <div className="border border-dashed border-admin-border rounded-lg p-6 text-center bg-gray-50">
                                            <p className="text-sm text-admin-text-secondary">Add FAQs to automatically generate FAQPage schema.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {formData.faqs.map((faq, index) => (
                                                <div key={index} className="border border-admin-border rounded-lg p-4 bg-white relative group shadow-sm">
                                                    <button
                                                        onClick={() => handleDeleteFAQ(index)}
                                                        className="absolute top-2 right-2 text-admin-text-secondary hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        title="Remove FAQ"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">close</span>
                                                    </button>
                                                    <div className="space-y-3">
                                                        <input
                                                            type="text"
                                                            placeholder="Question"
                                                            value={faq.question}
                                                            onChange={(e) => handleFAQChange(index, 'question', e.target.value)}
                                                            className="w-full font-medium text-admin-text-primary border-b border-transparent focus:border-admin-border focus:outline-none bg-transparent placeholder-gray-400"
                                                        />
                                                        <textarea
                                                            placeholder="Answer"
                                                            value={faq.answer}
                                                            onChange={(e) => handleFAQChange(index, 'answer', e.target.value)}
                                                            rows={2}
                                                            className="w-full text-sm text-admin-text-secondary border-none focus:ring-0 bg-transparent resize-none placeholder-gray-300"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4 pt-4 border-t border-admin-border">
                                    <div className="flex justify-between items-center">
                                        <label className="block text-sm font-medium text-admin-text-secondary">HowTo Schema (Steps)</label>
                                        <button
                                            type="button"
                                            onClick={handleAddStep}
                                            className="text-xs font-bold text-admin-primary hover:text-admin-primary-hover flex items-center gap-1 border border-admin-primary/30 px-2 py-1 rounded bg-admin-primary/5"
                                        >
                                            <span className="material-symbols-outlined text-sm">add</span>
                                            Add Step
                                        </button>
                                    </div>
                                    {formData.steps.length > 0 && (
                                        <div className="space-y-2">
                                            {formData.steps.map((step, index) => (
                                                <div key={index} className="flex gap-2">
                                                    <span className="flex-none w-6 h-6 rounded-full bg-gray-100 text-xs flex items-center justify-center font-bold text-gray-500 mt-2">{index + 1}</span>
                                                    <textarea
                                                        value={step}
                                                        onChange={(e) => handleStepChange(index, e.target.value)}
                                                        placeholder={`Step ${index + 1} description...`}
                                                        rows={2}
                                                        className="flex-1 rounded-lg border border-admin-border px-3 py-2 text-sm bg-admin-background focus:ring-2 focus:ring-admin-primary outline-none resize-none"
                                                    />
                                                    <button
                                                        onClick={() => handleDeleteStep(index)}
                                                        className="text-admin-text-secondary hover:text-red-600 self-start mt-2"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">close</span>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4 pt-4 border-t border-admin-border">
                                    <label className="block text-sm font-medium text-admin-text-secondary">Review Schema (Optional)</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Rating (0-5)</label>
                                            <input
                                                type="number"
                                                name="reviewRating"
                                                min="0"
                                                max="5"
                                                step="0.1"
                                                value={formData.reviewRating}
                                                onChange={handleInputChange}
                                                className="w-full rounded-lg border border-admin-border px-3 py-2 text-sm bg-admin-background focus:ring-2 focus:ring-admin-primary outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Review Count</label>
                                            <input
                                                type="number"
                                                name="reviewCount"
                                                min="0"
                                                value={formData.reviewCount}
                                                onChange={handleInputChange}
                                                className="w-full rounded-lg border border-admin-border px-3 py-2 text-sm bg-admin-background focus:ring-2 focus:ring-admin-primary outline-none"
                                            />
                                        </div>
                                    </div>
                                    <p className="text-xs text-admin-text-secondary">Only fill if this post is a review.</p>
                                </div>
                            </div>

                            <div className="border-t border-admin-border pt-6">
                                <h3 className="text-lg font-semibold text-admin-text-primary mb-4">Schema Preview (Auto-Generated)</h3>
                                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                                    <pre className="text-xs text-green-400 font-mono whitespace-pre">
                                        {generatedSchema}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminBlogCreatePage;
