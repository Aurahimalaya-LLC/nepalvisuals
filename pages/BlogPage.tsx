import React, { useEffect, useState } from 'react';
import { Link, useParams, useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import { BlogService, BlogPost, BlogCategory, BlogTag } from '../lib/services/blogService';
import Layout from '../components/layout/Layout';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const BlogPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const searchQuery = searchParams.get('q');
    
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [categories, setCategories] = useState<BlogCategory[]>([]);
    const [currentCategory, setCurrentCategory] = useState<BlogCategory | null>(null);
    const [currentTag, setCurrentTag] = useState<BlogTag | null>(null);
    const [searchInput, setSearchInput] = useState('');
    
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    const isCategoryPage = location.pathname.includes('/blog/category/');
    const isTagPage = location.pathname.includes('/blog/tag/');

    useEffect(() => {
        if (searchQuery) setSearchInput(searchQuery);
    }, [searchQuery]);

    useEffect(() => {
        loadData();
    }, [page, slug, location.pathname, searchQuery]);

    const loadData = async () => {
        try {
            setLoading(true);
            
            // Reset filters
            setCurrentCategory(null);
            setCurrentTag(null);

            // Load Categories for sidebar
            const cats = await BlogService.getAllCategories();
            setCategories(cats);

            if (searchQuery) {
                const postsData = await BlogService.searchPublicPosts(searchQuery, page, 12);
                setPosts(postsData.posts);
                setTotal(postsData.total);
            } else if (isCategoryPage && slug) {
                const { category, posts } = await BlogService.getPostsByCategory(slug);
                setCurrentCategory(category);
                setPosts(posts);
                setTotal(posts.length); // Pagination for categories not fully implemented yet
            } else if (isTagPage && slug) {
                const { tag, posts } = await BlogService.getPostsByTag(slug);
                setCurrentTag(tag);
                setPosts(posts);
                setTotal(posts.length);
            } else {
                const postsData = await BlogService.getPublishedPosts(page, 12);
                setPosts(postsData.posts);
                setTotal(postsData.total);
            }
        } catch (error) {
            console.error('Failed to load blog data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchInput.trim()) {
            navigate(`/blog?q=${encodeURIComponent(searchInput.trim())}`);
        } else {
            navigate('/blog');
        }
    };

    const featuredPost = posts.find(p => p.is_featured) || posts[0];
    const otherPosts = searchQuery ? posts : posts.filter(p => p.id !== featuredPost?.id);

    return (
        <Layout>
            <div className="bg-gray-50 min-h-screen pb-20">
                {/* Hero Section */}
                <div className="bg-primary-900 text-white py-20 px-4">
                    <div className="max-w-7xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            {searchQuery ? `Search Results: "${searchQuery}"` :
                             currentCategory ? `Category: ${currentCategory.name}` : 
                             currentTag ? `Tag: #${currentTag.name}` : 
                             'Nepal Visuals Blog'}
                        </h1>
                        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                            {searchQuery ? `Found ${total} articles matching your search.` :
                             currentCategory ? `Explore all articles in ${currentCategory.name}` :
                             currentTag ? `Articles tagged with #${currentTag.name}` :
                             'Discover stories, guides, and news about trekking and traveling in Nepal.'}
                        </p>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 mt-12">
                    {loading ? (
                        <div className="flex justify-center py-20"><LoadingSpinner /></div>
                    ) : (
                        <>
                            {/* Featured Post - Only show on main blog page (not search/category/tag) */}
                            {!searchQuery && !currentCategory && !currentTag && featuredPost && (
                                <Link to={`/blog/${featuredPost.slug}`} className="group block mb-16 relative rounded-2xl overflow-hidden shadow-xl aspect-[21/9]">
                                    <img 
                                        src={featuredPost.featured_image || 'https://placehold.co/1200x600'} 
                                        alt={featuredPost.featured_image_alt || featuredPost.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-8 md:p-12">
                                        {featuredPost.category && (
                                            <span className="bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full w-fit mb-4">
                                                {featuredPost.category.name}
                                            </span>
                                        )}
                                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 group-hover:text-primary-300 transition-colors">
                                            {featuredPost.title}
                                        </h2>
                                        <div className="flex items-center gap-4 text-gray-300 text-sm">
                                            <span>{featuredPost.author?.full_name}</span>
                                            <span>•</span>
                                            <span>{new Date(featuredPost.published_at!).toLocaleDateString()}</span>
                                            <span>•</span>
                                            <span>{featuredPost.reading_time_minutes} min read</span>
                                        </div>
                                    </div>
                                </Link>
                            )}

                            <div className="flex flex-col lg:flex-row gap-12">
                                {/* Main Content */}
                                <div className="flex-1">
                                    {otherPosts.length === 0 ? (
                                        <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
                                            <span className="material-symbols-outlined text-4xl text-gray-300 mb-4">search_off</span>
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">No articles found</h3>
                                            <p className="text-gray-500">Try adjusting your search terms or browse by category.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {otherPosts.map(post => (
                                                <Link key={post.id} to={`/blog/${post.slug}`} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col h-full">
                                                    <div className="aspect-video overflow-hidden">
                                                        <img 
                                                            src={post.featured_image || 'https://placehold.co/600x400'} 
                                                            alt={post.featured_image_alt || post.title}
                                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                        />
                                                    </div>
                                                    <div className="p-6 flex-1 flex flex-col">
                                                        {post.category && (
                                                            <span className="text-primary-600 text-xs font-bold uppercase mb-2 block">
                                                                {post.category.name}
                                                            </span>
                                                        )}
                                                        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                                                            {post.title}
                                                        </h3>
                                                        <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-1">
                                                            {post.excerpt}
                                                        </p>
                                                        <div className="flex items-center justify-between text-xs text-gray-500 mt-auto">
                                                            <span>{new Date(post.published_at!).toLocaleDateString()}</span>
                                                            <span>{post.reading_time_minutes} min read</span>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    )}

                                    {/* Pagination */}
                                    {total > 12 && (
                                        <div className="mt-12 flex justify-center gap-2">
                                            <button 
                                                disabled={page === 1}
                                                onClick={() => setPage(p => p - 1)}
                                                className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-100"
                                            >
                                                Previous
                                            </button>
                                            <span className="px-4 py-2">Page {page}</span>
                                            <button 
                                                disabled={page * 12 >= total}
                                                onClick={() => setPage(p => p + 1)}
                                                className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-100"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Sidebar */}
                                <div className="w-full lg:w-80 space-y-8">
                                    {/* Search Box */}
                                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                        <h3 className="font-bold text-gray-900 mb-4 text-lg">Search</h3>
                                        <form onSubmit={handleSearch}>
                                            <div className="relative">
                                                <input 
                                                    type="text" 
                                                    placeholder="Search articles..." 
                                                    value={searchInput}
                                                    onChange={(e) => setSearchInput(e.target.value)}
                                                    className="w-full pl-4 pr-10 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
                                                />
                                                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-600">
                                                    <span className="material-symbols-outlined">search</span>
                                                </button>
                                            </div>
                                        </form>
                                    </div>

                                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                        <h3 className="font-bold text-gray-900 mb-4 text-lg">Categories</h3>
                                        <ul className="space-y-2">
                                            {categories.map(cat => (
                                                <li key={cat.id}>
                                                    <Link to={`/blog/category/${cat.slug}`} className="text-gray-600 hover:text-primary-600 flex justify-between items-center group">
                                                        <span>{cat.name}</span>
                                                        <span className="text-gray-400 text-xs group-hover:text-primary-600">→</span>
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="bg-primary-50 p-6 rounded-xl border border-primary-100">
                                        <h3 className="font-bold text-primary-900 mb-2">Subscribe</h3>
                                        <p className="text-sm text-primary-700 mb-4">Get the latest trekking guides and news delivered to your inbox.</p>
                                        <input type="email" placeholder="Your email address" className="w-full px-4 py-2 rounded-lg border border-primary-200 mb-2 text-sm" />
                                        <button className="w-full bg-primary-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-primary-700">Subscribe</button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </Layout>
    );
};
