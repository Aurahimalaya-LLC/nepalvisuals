import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { BlogService, BlogPost } from '../lib/services/blogService';
import Layout from '../components/layout/Layout';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

interface AuthorProfile {
    id: string;
    full_name: string;
    bio?: string;
    job_title?: string;
    website_url?: string;
    twitter_handle?: string;
    linkedin_url?: string;
    avatar_url?: string;
}

export const AuthorProfilePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [author, setAuthor] = useState<AuthorProfile | null>(null);
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadAuthorData(id);
        }
    }, [id]);

    const loadAuthorData = async (authorId: string) => {
        try {
            setLoading(true);
            const { author: authorData, posts: postsData } = await BlogService.getPostsByAuthor(authorId);
            setAuthor(authorData as AuthorProfile);
            setPosts(postsData);
        } catch (error) {
            console.error('Failed to load author data', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Layout><div className="flex justify-center py-20"><LoadingSpinner /></div></Layout>;
    if (!author) return <Layout><div className="text-center py-20">Author not found</div></Layout>;

    return (
        <Layout>
            <Helmet>
                <title>{author.full_name} - Author Profile | Nepal Visuals</title>
                <meta name="description" content={`Articles written by ${author.full_name} at Nepal Visuals. ${author.bio || ''}`} />
                <meta name="robots" content="noindex, follow" /> {/* Typically author pages are noindexed to prevent thin content, but follow links */}
                
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Person",
                        "name": author.full_name,
                        "jobTitle": author.job_title,
                        "description": author.bio,
                        "url": window.location.href,
                        "image": author.avatar_url,
                        "sameAs": [
                            author.twitter_handle ? `https://twitter.com/${author.twitter_handle}` : null,
                            author.linkedin_url,
                            author.website_url
                        ].filter(Boolean)
                    })}
                </script>
            </Helmet>

            <div className="bg-gray-50 min-h-screen py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Author Header */}
                    <div className="bg-white rounded-2xl shadow-sm p-8 mb-12 flex flex-col md:flex-row items-center md:items-start gap-8 text-center md:text-left">
                        {author.avatar_url ? (
                            <img 
                                src={author.avatar_url} 
                                alt={author.full_name} 
                                className="w-32 h-32 rounded-full object-cover border-4 border-primary-50"
                            />
                        ) : (
                            <div className="w-32 h-32 rounded-full bg-primary-100 flex-shrink-0 flex items-center justify-center text-4xl font-bold text-primary-700">
                                {author.full_name.charAt(0)}
                            </div>
                        )}
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{author.full_name}</h1>
                            {author.job_title && <p className="text-primary-600 font-medium mb-4">{author.job_title}</p>}
                            {author.bio && <p className="text-gray-600 mb-6 max-w-2xl">{author.bio}</p>}
                            
                            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                                {author.twitter_handle && (
                                    <a href={`https://twitter.com/${author.twitter_handle}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-gray-500 hover:text-blue-400 transition-colors">
                                        <span className="material-symbols-outlined">alternate_email</span>
                                        Twitter
                                    </a>
                                )}
                                {author.linkedin_url && (
                                    <a href={author.linkedin_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-gray-500 hover:text-blue-700 transition-colors">
                                        <span className="material-symbols-outlined">business_center</span>
                                        LinkedIn
                                    </a>
                                )}
                                {author.website_url && (
                                    <a href={author.website_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-gray-500 hover:text-green-600 transition-colors">
                                        <span className="material-symbols-outlined">language</span>
                                        Website
                                    </a>
                                )}
                            </div>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-6 text-center min-w-[200px]">
                            <p className="text-3xl font-bold text-gray-900 mb-1">{posts.length}</p>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Articles Published</p>
                        </div>
                    </div>

                    {/* Articles Grid */}
                    <h2 className="text-2xl font-bold text-gray-900 mb-8">Latest Articles</h2>
                    
                    {posts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {posts.map(post => (
                                <Link key={post.id} to={`/blog/${post.slug}`} className="group bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                    <div className="aspect-video bg-gray-200 overflow-hidden">
                                        <img 
                                            src={post.featured_image || 'https://placehold.co/600x400'} 
                                            alt={post.featured_image_alt || post.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                    <div className="p-6">
                                        {post.category && (
                                            <span className="inline-block px-3 py-1 bg-primary-50 text-primary-700 text-xs font-bold rounded-full mb-3">
                                                {post.category.name}
                                            </span>
                                        )}
                                        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-primary-600 transition-colors">
                                            {post.title}
                                        </h3>
                                        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                                            {post.excerpt}
                                        </p>
                                        <div className="flex items-center justify-between text-xs text-gray-500 mt-auto pt-4 border-t border-gray-100">
                                            <span>{new Date(post.published_at!).toLocaleDateString()}</span>
                                            <span>{post.reading_time_minutes} min read</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-xl shadow-sm">
                            <p className="text-gray-500">No articles published yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};
