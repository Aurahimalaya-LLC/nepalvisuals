import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BlogService, BlogPost } from '../lib/services/blogService';
import { RedirectService, Redirect } from '../lib/services/redirectService';

const AdminBlogListPage: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'posts' | 'redirects'>('posts');
    
    // Posts State
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPostIds, setSelectedPostIds] = useState<Set<string>>(new Set());

    // Redirects State
    const [redirects, setRedirects] = useState<Redirect[]>([]);
    const [loadingRedirects, setLoadingRedirects] = useState(false);
    const [editingRedirectId, setEditingRedirectId] = useState<string | null>(null);
    const [redirectForm, setRedirectForm] = useState({ source: '', target: '', code: 301 });

    useEffect(() => {
        if (activeTab === 'posts') {
            loadPosts();
        } else {
            loadRedirects();
        }
    }, [activeTab]);

    // --- Posts Logic ---

    const toggleSelectAll = () => {
        if (selectedPostIds.size === filteredPosts.length) {
            setSelectedPostIds(new Set());
        } else {
            setSelectedPostIds(new Set(filteredPosts.map((p: BlogPost) => p.id)));
        }
    };

    const toggleSelectPost = (id: string) => {
        const newSelected = new Set(selectedPostIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedPostIds(newSelected);
    };

    const handleBulkDelete = async () => {
        if (window.confirm(`Are you sure you want to delete ${selectedPostIds.size} posts?`)) {
            try {
                await Promise.all((Array.from(selectedPostIds) as string[]).map(id => BlogService.deletePost(id)));
                setPosts(posts.filter(p => !selectedPostIds.has(p.id)));
                setSelectedPostIds(new Set());
                alert('Posts deleted successfully');
            } catch (error) {
                console.error('Bulk delete failed:', error);
                alert('Failed to delete some posts');
            }
        }
    };

    const handleBulkStatusChange = async (status: 'published' | 'draft' | 'archived') => {
        if (window.confirm(`Change status of ${selectedPostIds.size} posts to ${status}?`)) {
            try {
                await Promise.all((Array.from(selectedPostIds) as string[]).map(id => 
                    BlogService.updatePost(id, { status, updated_at: new Date().toISOString() })
                ));
                loadPosts();
                setSelectedPostIds(new Set());
            } catch (error) {
                console.error('Bulk update failed:', error);
                alert('Failed to update posts');
            }
        }
    };

    const loadPosts = async () => {
        try {
            setLoading(true);
            const data = await BlogService.getAllPosts();
            setPosts(data);
        } catch (error) {
            console.error('Error loading posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        const post = posts.find(p => p.id === id);
        if (!post) return;

        if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
            try {
                // Offer to create redirect for published posts
                if (post.status === 'published' && window.confirm(`Create a redirect for /blog/${post.slug} before deleting?`)) {
                    const target = window.prompt('Enter target URL (e.g. /blog or /blog/another-post):', '/blog');
                    if (target) {
                         await RedirectService.createRedirect(`/blog/${post.slug}`, target, 301);
                         alert(`Redirect created from /blog/${post.slug} to ${target}`);
                    }
                }

                await BlogService.deletePost(id);
                setPosts(posts.filter(post => post.id !== id));
            } catch (error) {
                console.error('Error deleting post:', error);
                alert('Failed to delete post');
            }
        }
    };

    const handleDuplicate = async (post: BlogPost) => {
        if (window.confirm(`Duplicate "${post.title}"?`)) {
            try {
                const { id, created_at, updated_at, ...postData } = post;
                const newTitle = `${postData.title} (Copy)`;
                const newSlug = `${postData.slug}-copy-${Date.now()}`;
                
                const fullPost = await BlogService.getPostById(post.id);
                const tagIds = fullPost.tags?.map(t => t.id) || [];
                const relatedPostIds = fullPost.related_posts?.map(p => p.id) || [];
                const secondaryCategoryIds = fullPost.secondary_categories?.map(c => c.id) || [];
                
                const { id: _id, created_at: _c, updated_at: _u, tags: _t, related_posts: _rp, related_posts_join: _rpj, category: _cat, author: _au, secondary_categories: _sc, ...cleanPostData } = fullPost as any;
                
                await BlogService.createPost({
                    ...cleanPostData,
                    title: newTitle,
                    slug: newSlug,
                    status: 'draft'
                }, tagIds, relatedPostIds, secondaryCategoryIds);
                
                loadPosts();
                alert('Post duplicated successfully!');
            } catch (error) {
                console.error('Error duplicating post:', error);
                alert('Failed to duplicate post');
            }
        }
    };

    const filteredPosts = posts.filter(post => {
        const matchesStatus = filterStatus === 'all' || post.status === filterStatus;
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              post.slug.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'published': return 'bg-green-100 text-green-800';
            case 'draft': return 'bg-gray-100 text-gray-800';
            case 'scheduled': return 'bg-blue-100 text-blue-800';
            case 'archived': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // --- Redirects Logic ---

    const loadRedirects = async () => {
        try {
            setLoadingRedirects(true);
            const data = await RedirectService.getAllRedirects();
            setRedirects(data);
        } catch (error) {
            console.error('Error loading redirects:', error);
        } finally {
            setLoadingRedirects(false);
        }
    };

    const handleSaveRedirect = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingRedirectId) {
                await RedirectService.updateRedirect(editingRedirectId, {
                    source_path: redirectForm.source,
                    target_path: redirectForm.target,
                    status_code: redirectForm.code
                });
                alert('Redirect updated successfully');
            } else {
                await RedirectService.createRedirect(redirectForm.source, redirectForm.target, redirectForm.code);
                alert('Redirect created successfully');
            }
            setRedirectForm({ source: '', target: '', code: 301 });
            setEditingRedirectId(null);
            loadRedirects();
        } catch (error) {
            console.error('Error saving redirect:', error);
            alert('Failed to save redirect');
        }
    };

    const handleEditRedirect = (redirect: Redirect) => {
        setEditingRedirectId(redirect.id);
        setRedirectForm({
            source: redirect.source_path,
            target: redirect.target_path,
            code: redirect.status_code
        });
    };

    const handleCancelEdit = () => {
        setEditingRedirectId(null);
        setRedirectForm({ source: '', target: '', code: 301 });
    };

    const handleDeleteRedirect = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this redirect?')) {
            try {
                await RedirectService.deleteRedirect(id);
                loadRedirects();
            } catch (error) {
                console.error('Error deleting redirect:', error);
                alert('Failed to delete redirect');
            }
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-admin-text-primary">Blog Management</h1>
                    <p className="mt-1 text-sm text-admin-text-secondary">Manage posts, redirects, and SEO settings.</p>
                </div>
                <div className="flex gap-2">
                    <Link
                        to="/admin/blog/seo"
                        className="flex items-center gap-2 px-4 py-2 border border-admin-border bg-white text-admin-text-secondary rounded-lg text-sm font-bold shadow-sm hover:bg-gray-50 transition-colors"
                    >
                        <span className="material-symbols-outlined text-sm">settings_suggest</span>
                        SEO Tools
                    </Link>
                    {activeTab === 'posts' && (
                        <Link
                            to="/admin/blog/new"
                            className="flex items-center gap-2 px-4 py-2 bg-admin-primary text-white rounded-lg text-sm font-bold shadow-sm hover:bg-admin-primary-hover transition-colors"
                        >
                            <span className="material-symbols-outlined text-sm">add</span>
                            Create New Post
                        </Link>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="mb-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('posts')}
                        className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'posts'
                                ? 'border-admin-primary text-admin-primary'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Blog Posts
                    </button>
                    <button
                        onClick={() => setActiveTab('redirects')}
                        className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'redirects'
                                ? 'border-admin-primary text-admin-primary'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Redirect Manager
                    </button>
                </nav>
            </div>

            {activeTab === 'posts' ? (
                <>
                    {/* Filters & Bulk Actions */}
                    <div className="bg-white p-4 rounded-xl border border-admin-border shadow-sm mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <div className="flex gap-4 w-full sm:w-auto">
                            <div className="relative flex-1 sm:flex-initial">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                                <input 
                                    type="text" 
                                    placeholder="Search posts..." 
                                    value={searchQuery}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                                    className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-admin-primary"
                                />
                            </div>
                            <select 
                                value={filterStatus} 
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterStatus(e.target.value)}
                                className="px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-admin-primary bg-white"
                            >
                                <option value="all">All Status</option>
                                <option value="published">Published</option>
                                <option value="draft">Draft</option>
                                <option value="scheduled">Scheduled</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>

                        {selectedPostIds.size > 0 && (
                            <div className="flex items-center gap-2 animate-fadeIn bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                                <span className="text-sm font-bold text-blue-800">{selectedPostIds.size} selected</span>
                                <div className="h-4 w-px bg-blue-200 mx-2"></div>
                                <button onClick={() => handleBulkStatusChange('published')} className="text-xs font-semibold text-green-700 hover:bg-green-100 px-2 py-1 rounded">Publish</button>
                                <button onClick={() => handleBulkStatusChange('draft')} className="text-xs font-semibold text-gray-700 hover:bg-gray-200 px-2 py-1 rounded">Draft</button>
                                <button onClick={() => handleBulkDelete()} className="text-xs font-semibold text-red-700 hover:bg-red-100 px-2 py-1 rounded">Delete</button>
                            </div>
                        )}
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-xl border border-admin-border shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="px-6 py-4 w-4">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedPostIds.size > 0 && selectedPostIds.size === filteredPosts.length}
                                                onChange={toggleSelectAll}
                                                className="rounded border-gray-300 text-admin-primary focus:ring-admin-primary"
                                            />
                                        </th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Post</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Author</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Categories</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Structure</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Stats</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                                                Loading posts...
                                            </td>
                                        </tr>
                                    ) : filteredPosts.length === 0 ? (
                                        <tr>
                                            <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                                                No posts found matching your criteria.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredPosts.map((post) => (
                                            <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={selectedPostIds.has(post.id)}
                                                        onChange={() => toggleSelectPost(post.id)}
                                                        className="rounded border-gray-300 text-admin-primary focus:ring-admin-primary"
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {post.featured_image && (
                                                            <img 
                                                                src={post.featured_image} 
                                                                alt="" 
                                                                className="w-10 h-10 rounded object-cover border border-gray-200"
                                                            />
                                                        )}
                                                        <div>
                                                            <Link to={`/admin/blog/edit/${post.id}`} className="font-semibold text-gray-900 hover:text-admin-primary block">
                                                                {post.title}
                                                            </Link>
                                                            <span className="text-xs text-gray-500 truncate max-w-[200px] block">
                                                                /{post.slug}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {post.author?.full_name || 'Unknown'}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    <div className="flex flex-col gap-1.5">
                                                        {post.category ? (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 w-fit">
                                                                {post.category.name}
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs text-gray-400 italic">Uncategorized</span>
                                                        )}
                                                        
                                                        {post.secondary_categories && post.secondary_categories.length > 0 && (
                                                            <div className="flex flex-wrap gap-1">
                                                                {post.secondary_categories.map((cat: { slug: string; name: string }) => (
                                                                    <span key={cat.slug} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-gray-100 text-gray-600 border border-gray-200">
                                                                        {cat.name}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {post.parent ? (
                                                        <div className="flex flex-col">
                                                            <span className="text-xs text-gray-400">Child of:</span>
                                                            <span className="font-medium truncate max-w-[150px]" title={post.parent.title}>
                                                                {post.parent.title}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-400 italic">Top Level</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
                                                        {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-xs text-gray-500">
                                                    <div className="flex flex-col gap-1">
                                                        <span title="Word Count">{post.word_count || 0} words</span>
                                                        {post.content_score > 0 && (
                                                            <span className={`font-bold ${
                                                                post.content_score >= 80 ? 'text-green-600' : 
                                                                post.content_score >= 50 ? 'text-yellow-600' : 'text-red-600'
                                                            }`}>
                                                                Score: {post.content_score}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    <div className="flex flex-col">
                                                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                                                        <span className="text-xs text-gray-400">Created</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button 
                                                            onClick={() => handleDuplicate(post)}
                                                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                            title="Duplicate"
                                                        >
                                                            <span className="material-symbols-outlined text-lg">content_copy</span>
                                                        </button>
                                                        <Link 
                                                            to={`/admin/blog/edit/${post.id}`}
                                                            className="p-1.5 text-gray-400 hover:text-admin-primary hover:bg-admin-primary/5 rounded transition-colors"
                                                            title="Edit"
                                                        >
                                                            <span className="material-symbols-outlined text-lg">edit</span>
                                                        </Link>
                                                        <button 
                                                            onClick={() => handleDelete(post.id)}
                                                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                            title="Delete"
                                                        >
                                                            <span className="material-symbols-outlined text-lg">delete</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Pagination (Simple Implementation) */}
                        <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center text-sm text-gray-500">
                            <span>Showing {filteredPosts.length} posts</span>
                        </div>
                    </div>
                </>
            ) : (
                <div className="space-y-6">
                    {/* Create/Edit Redirect Form */}
                    <div className="bg-white p-6 rounded-xl border border-admin-border shadow-sm">
                        <h3 className="font-bold text-lg mb-4 text-admin-text-primary">
                            {editingRedirectId ? 'Edit Redirect' : 'Add New Redirect'}
                        </h3>
                        <form onSubmit={handleSaveRedirect} className="flex flex-col md:flex-row gap-4 items-end">
                            <div className="flex-1 w-full">
                                <label className="block text-xs font-medium text-gray-500 mb-1">Source Path (e.g. /old-url)</label>
                                <input 
                                    type="text" 
                                    required
                                    value={redirectForm.source}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRedirectForm({...redirectForm, source: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-admin-primary"
                                    placeholder="/blog/old-slug"
                                />
                            </div>
                            <div className="flex-1 w-full">
                                <label className="block text-xs font-medium text-gray-500 mb-1">Target Path (e.g. /new-url)</label>
                                <input 
                                    type="text" 
                                    required
                                    value={redirectForm.target}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRedirectForm({...redirectForm, target: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-admin-primary"
                                    placeholder="/blog/new-slug"
                                />
                            </div>
                            <div className="w-full md:w-32">
                                <label className="block text-xs font-medium text-gray-500 mb-1">Status Code</label>
                                <select 
                                    value={redirectForm.code}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRedirectForm({...redirectForm, code: Number(e.target.value)})}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-admin-primary bg-white"
                                >
                                    <option value={301}>301 (Perm)</option>
                                    <option value={302}>302 (Temp)</option>
                                    <option value={307}>307 (Temp)</option>
                                    <option value={308}>308 (Perm)</option>
                                </select>
                            </div>
                            <div className="flex gap-2">
                                {editingRedirectId && (
                                    <button 
                                        type="button"
                                        onClick={handleCancelEdit}
                                        className="px-6 py-2 border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                )}
                                <button 
                                    type="submit"
                                    className="px-6 py-2 bg-admin-primary text-white font-bold rounded-lg hover:bg-admin-primary-hover transition-colors shadow-sm"
                                >
                                    {editingRedirectId ? 'Update' : 'Add Redirect'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Redirects List */}
                    <div className="bg-white rounded-xl border border-admin-border shadow-sm overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Source Path</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Target Path</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Code</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Date Created</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loadingRedirects ? (
                                    <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">Loading redirects...</td></tr>
                                ) : redirects.length === 0 ? (
                                    <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">No redirects found.</td></tr>
                                ) : (
                                    redirects.map((redirect: Redirect) => (
                                        <tr key={redirect.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{redirect.source_path}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                <span className="material-symbols-outlined text-xs align-middle mr-1 text-gray-400">arrow_forward</span>
                                                {redirect.target_path}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                    redirect.status_code >= 300 && redirect.status_code < 400 
                                                    ? 'bg-blue-100 text-blue-700' 
                                                    : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                    {redirect.status_code}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-gray-500">
                                                {new Date(redirect.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button 
                                                        onClick={() => handleEditRedirect(redirect)}
                                                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                                        title="Edit"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">edit</span>
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteRedirect(redirect.id)}
                                                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                        title="Delete"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminBlogListPage;
