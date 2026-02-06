import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { BlogService, BlogPost } from '../lib/services/blogService';
import { RedirectService } from '../lib/services/redirectService';
import { AnalyticsService } from '../lib/services/analyticsService';
import Layout from '../components/layout/Layout';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import DOMPurify from 'dompurify';

interface TOCItem {
    id: string;
    text: string;
    level: number;
}

export const BlogPostPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [post, setPost] = useState<BlogPost | null>(null);
    const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [toc, setToc] = useState<TOCItem[]>([]);
    const [processedContent, setProcessedContent] = useState('');
    const [startTime, setStartTime] = useState<number>(Date.now());
    const [maxScroll, setMaxScroll] = useState(0);
    const [activeId, setActiveId] = useState<string>('');
    const [showBackToTop, setShowBackToTop] = useState(false);

    useEffect(() => {
        if (slug) {
            loadPost(slug);
            setStartTime(Date.now());
            setMaxScroll(0);
        }
    }, [slug]);

    // Scroll Spy for TOC
    useEffect(() => {
        if (toc.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            { rootMargin: '-100px 0px -66% 0px' }
        );

        toc.forEach((item) => {
            const element = document.getElementById(item.id);
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, [toc, processedContent]);

    // Analytics: Page View & Time on Page & Scroll Depth
    useEffect(() => {
        if (!post) return;

        // Track Page View
        AnalyticsService.trackPageView(
            window.location.pathname, 
            post.title,
            post.category?.name
        );

        const handleScroll = () => {
            const scrollTop = window.scrollY;
            setShowBackToTop(scrollTop > 500);

            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = Math.round((scrollTop / docHeight) * 100);
            
            if (scrollPercent > maxScroll) {
                setMaxScroll(scrollPercent);
                if (scrollPercent === 25 || scrollPercent === 50 || scrollPercent === 75 || scrollPercent === 100) {
                    AnalyticsService.trackScrollDepth(scrollPercent, window.location.pathname);
                }
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            const timeSpent = Math.round((Date.now() - startTime) / 1000);
            AnalyticsService.trackTimeOnPage(timeSpent, window.location.pathname);
        };
    }, [post]); // Run when post is loaded

    // Handle internal link clicks in content
    const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement;
        const link = target.closest('a');
        if (link) {
            const href = link.getAttribute('href');
            if (href && (href.startsWith('/') || href.includes(window.location.hostname))) {
                AnalyticsService.trackInternalLinkClick(link.innerText, href);
            } else if (href) {
                AnalyticsService.track('external_link_click', { destination: href });
            }
        }
    };

    const loadPost = async (slug: string) => {
        try {
            setLoading(true);
            const postData = await BlogService.getPostBySlug(slug);
            setPost(postData);

            // Fetch related posts
            if (postData.id) {
                const related = await BlogService.getPublicRelatedPosts(postData);
                setRelatedPosts(related);
            }

            // Process Content for TOC
            if (postData.content) {
                const { html, items } = processContent(postData.content);
                setProcessedContent(html);
                setToc(items);
            }
        } catch (error) {
            console.error('Failed to load post', error);
            // Check for redirect
            try {
                const redirect = await RedirectService.getRedirect(`/blog/${slug}`);
                if (redirect) {
                    console.log(`Redirecting to ${redirect.target_path}`);
                    if (redirect.target_path.startsWith('http')) {
                        window.location.replace(redirect.target_path);
                    } else {
                        navigate(redirect.target_path, { replace: true });
                    }
                    return;
                }
            } catch (redirectError) {
                console.error('Error checking redirect:', redirectError);
            }
        } finally {
            setLoading(false);
        }
    };

    const processContent = (html: string) => {
        const items: TOCItem[] = [];
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const usedIds = new Set<string>();
        
        const headers = doc.querySelectorAll('h2, h3');
        headers.forEach((header) => {
            const text = header.textContent || '';
            // Generate slugified ID
            let baseId = text
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
            
            if (!baseId) baseId = 'section';
            
            let id = baseId;
            let count = 1;
            while (usedIds.has(id)) {
                id = `${baseId}-${count}`;
                count++;
            }
            usedIds.add(id);
            
            header.id = id;
            items.push({
                id,
                text,
                level: parseInt(header.tagName.substring(1))
            });
        });

        return {
            html: doc.body.innerHTML,
            items
        };
    };

    if (loading) return <Layout><div className="flex justify-center py-20"><LoadingSpinner /></div></Layout>;
    
    if (!post) return (
        <Layout>
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
                <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">article</span>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Article Not Found</h1>
                <p className="text-gray-600 mb-8 max-w-md">
                    The article you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </p>
                <div className="flex gap-4">
                    <Link to="/blog" className="px-6 py-3 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 transition-colors">
                        Browse All Articles
                    </Link>
                    <Link to="/" className="px-6 py-3 border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors">
                        Go Home
                    </Link>
                </div>
            </div>
        </Layout>
    );

    return (
        <Layout>
            <Helmet>
                <title>{post.seo_title || post.title} | Nepal Visuals</title>
                <meta name="description" content={post.meta_description || post.excerpt} />
                <link rel="canonical" href={post.canonical_url || `https://nepalvisuals.com/blog/${post.slug}`} />
                
                {/* Open Graph */}
                <meta property="og:title" content={post.og_title || post.title} />
                <meta property="og:description" content={post.og_description || post.excerpt} />
                <meta property="og:image" content={post.og_image || post.featured_image} />
                <meta property="og:type" content="article" />
                <meta property="og:url" content={window.location.href} />
                <meta property="article:published_time" content={post.published_at} />
                <meta property="article:modified_time" content={post.updated_at} />
                {post.category && <meta property="article:section" content={post.category.name} />}
                {post.tags && post.tags.map(tag => (
                    <meta key={tag.id} property="article:tag" content={tag.name} />
                ))}
                {post.author && <meta property="article:author" content={post.author.full_name} />}

                {/* Twitter Card */}
                <meta name="twitter:card" content={post.twitter_card || "summary_large_image"} />
                <meta name="twitter:title" content={post.seo_title || post.title} />
                <meta name="twitter:description" content={post.meta_description || post.excerpt} />
                <meta name="twitter:image" content={post.og_image || post.featured_image} />
                {post.author?.twitter_handle && <meta name="twitter:creator" content={post.author.twitter_handle} />}
                
                {/* Robots */}
                <meta name="robots" content={`${post.is_no_index ? 'noindex' : 'index'}, ${post.is_no_follow ? 'nofollow' : 'follow'}`} />

                {/* Schema JSON-LD */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": post.schema_type || "BlogPosting",
                        "headline": post.title,
                        "image": post.featured_image ? [post.featured_image] : [],
                        "datePublished": post.published_at,
                        "dateModified": post.updated_at,
                        "author": [{
                            "@type": "Person",
                            "name": post.author?.full_name,
                            "url": post.author?.website_url
                        }]
                    })}
                </script>
            </Helmet>

            <article className="bg-white min-h-screen pb-20">
                {/* Header */}
                <header className="relative h-[60vh] min-h-[400px]">
                    <img 
                        src={post.featured_image || 'https://placehold.co/1200x600'} 
                        alt={post.featured_image_alt || post.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end pb-12 px-4">
                        <div className="max-w-4xl mx-auto w-full">
                            {post.category && (
                                <Link to={`/blog/category/${post.category.slug}`} className="bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full w-fit mb-6 inline-block hover:bg-primary-700 transition-colors">
                                    {post.category.name}
                                </Link>
                            )}
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                                {post.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-6 text-gray-200 text-sm md:text-base">
                                <Link to={`/blog/author/${post.author_id}`} className="flex items-center gap-2 group">
                                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold overflow-hidden border-2 border-transparent group-hover:border-white transition-colors">
                                        {post.author?.full_name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-white group-hover:underline">{post.author?.full_name}</p>
                                        <p className="text-xs text-gray-300">{post.author?.job_title || 'Author'}</p>
                                    </div>
                                </Link>
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-lg">calendar_today</span>
                                    <div className="flex flex-col text-xs md:text-sm leading-tight">
                                        <span>Published: {new Date(post.published_at!).toLocaleDateString()}</span>
                                        {post.updated_at && new Date(post.updated_at).getTime() > new Date(post.published_at!).getTime() + 86400000 && (
                                            <span className="text-gray-400">Updated: {new Date(post.updated_at).toLocaleDateString()}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-lg">schedule</span>
                                    <span>{post.reading_time_minutes} min read</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="max-w-7xl mx-auto px-4 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Sidebar (Share) */}
                    <div className="hidden lg:block lg:col-span-1">
                        <div className="sticky top-24 space-y-4">
                            <p className="text-xs font-bold text-gray-500 uppercase text-center mb-2">Share</p>
                            <button className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors mx-auto">
                                <span className="material-symbols-outlined">share</span>
                            </button>
                            {/* Add real share buttons here */}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-8">
                        <div 
                            onClick={handleContentClick}
                            className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-700 prose-img:rounded-xl prose-a:text-primary-600 hover:prose-a:text-primary-700"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(processedContent) }}
                        />
                        
                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                            <div className="mt-12 pt-8 border-t border-gray-100">
                                <h4 className="text-sm font-bold text-gray-500 uppercase mb-4">Tags</h4>
                                <div className="flex flex-wrap gap-2">
                                    {post.tags.map(tag => (
                                        <Link key={tag.id} to={`/blog/tag/${tag.slug}`} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors">
                                            #{tag.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Author Bio */}
                        {post.author && (post.author.bio || post.author.full_name) && (
                            <div className="mt-12 p-8 bg-gray-50 rounded-xl flex flex-col md:flex-row gap-6 items-start">
                                <div className="w-16 h-16 rounded-full bg-primary-100 flex-shrink-0 flex items-center justify-center text-xl font-bold text-primary-700">
                                    {post.author.full_name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-2">About {post.author.full_name}</h3>
                                    <p className="text-gray-600 mb-4">{post.author.bio || 'Content creator at Nepal Visuals.'}</p>
                                    <div className="flex gap-3">
                                        {post.author.twitter_handle && (
                                            <a href={`https://twitter.com/${post.author.twitter_handle}`} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-blue-400">
                                                Twitter
                                            </a>
                                        )}
                                        {post.author.linkedin_url && (
                                            <a href={post.author.linkedin_url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-blue-700">
                                                LinkedIn
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Related Posts */}
                        {relatedPosts.length > 0 && (
                            <div className="mt-12 border-t border-gray-100 pt-12">
                                <h3 className="text-2xl font-bold text-gray-900 mb-8">Read Next</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {relatedPosts.map(related => (
                                        <Link key={related.id} to={`/blog/${related.slug}`} className="group block">
                                            <div className="aspect-video rounded-xl overflow-hidden mb-4">
                                                <img 
                                                    src={related.featured_image || 'https://placehold.co/600x400'} 
                                                    alt={related.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                                                {related.category && <span className="font-bold text-primary-600">{related.category.name}</span>}
                                                <span>•</span>
                                                <span>{new Date(related.published_at!).toLocaleDateString()}</span>
                                            </div>
                                            <h4 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-2">
                                                {related.title}
                                            </h4>
                                            <p className="text-gray-600 line-clamp-2 text-sm">
                                                {related.excerpt}
                                            </p>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Sidebar (TOC & Related) */}
                    <div className="lg:col-span-3 space-y-8">
                        {/* Table of Contents */}
                        {post.show_toc && toc.length > 0 && (
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
                                <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase">Table of Contents</h3>
                                <nav className="max-h-[60vh] overflow-y-auto">
                                    <ul className="space-y-2 text-sm">
                                        {toc.map(item => (
                                            <li key={item.id} style={{ paddingLeft: `${(item.level - 2) * 12}px` }}>
                                                <a 
                                                    href={`#${item.id}`} 
                                                    className={`block py-1 border-l-2 pl-3 transition-colors ${
                                                        activeId === item.id 
                                                            ? 'border-primary-600 text-primary-600 font-medium' 
                                                            : 'border-transparent text-gray-600 hover:text-primary-600 hover:border-primary-600'
                                                    }`}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                                                        setActiveId(item.id);
                                                    }}
                                                >
                                                    {item.text}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </nav>
                            </div>
                        )}

                        {/* Related Posts moved to main content */}
                    </div>
                </div>
            </article>

            {/* Back to Top Button */}
            <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className={`fixed bottom-8 right-8 w-12 h-12 bg-primary-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-700 transition-all duration-300 z-50 ${
                    showBackToTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
                }`}
                aria-label="Back to top"
            >
                <span className="material-symbols-outlined">arrow_upward</span>
            </button>
        </Layout>
    );
};
