import React, { useState, useEffect } from 'react';
import { BlogService, BlogPost } from '../lib/services/blogService';
import { supabase } from '../lib/supabaseClient';

const AdminSeoToolsPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [sitemapXml, setSitemapXml] = useState('');
    const [rssXml, setRssXml] = useState('');
    const [lastGenerated, setLastGenerated] = useState<Date | null>(null);

    const generateSitemap = (posts: BlogPost[]) => {
        const baseUrl = 'https://nepalvisuals.com';
        const today = new Date().toISOString().split('T')[0];

        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>${baseUrl}/</loc>
        <lastmod>${today}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>${baseUrl}/blog</loc>
        <lastmod>${today}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
    </url>`;

        posts.forEach(post => {
            const lastMod = post.updated_at ? post.updated_at.split('T')[0] : today;
            xml += `
    <url>
        <loc>${baseUrl}/blog/${post.slug}</loc>
        <lastmod>${lastMod}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>`;
        });

        xml += `
</urlset>`;
        return xml;
    };

    const generateRss = (posts: BlogPost[]) => {
        const baseUrl = 'https://nepalvisuals.com';
        const today = new Date().toUTCString();

        let xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
    <title>Nepal Visuals Blog</title>
    <link>${baseUrl}</link>
    <description>Trekking and Traveling in Nepal</description>
    <language>en-us</language>
    <lastBuildDate>${today}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />`;

        posts.forEach(post => {
            const pubDate = post.published_at ? new Date(post.published_at).toUTCString() : new Date().toUTCString();
            xml += `
    <item>
        <title><![CDATA[${post.title}]]></title>
        <link>${baseUrl}/blog/${post.slug}</link>
        <guid isPermaLink="true">${baseUrl}/blog/${post.slug}</guid>
        <pubDate>${pubDate}</pubDate>
        <description><![CDATA[${post.excerpt || ''}]]></description>
    </item>`;
        });

        xml += `
</channel>
</rss>`;
        return xml;
    };

    const handleGenerate = async () => {
        try {
            setLoading(true);
            const { posts } = await BlogService.getPublishedPosts(1, 1000); // Fetch all published posts
            
            const sitemap = generateSitemap(posts);
            const rss = generateRss(posts);

            setSitemapXml(sitemap);
            setRssXml(rss);
            setLastGenerated(new Date());
        } catch (error) {
            console.error('Error generating SEO files:', error);
            alert('Failed to generate SEO files');
        } finally {
            setLoading(false);
        }
    };

    const downloadFile = (content: string, filename: string, type: string) => {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-admin-text-primary">SEO Tools</h1>
                <p className="mt-1 text-sm text-admin-text-secondary">Generate Sitemap and RSS feeds for your blog.</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-admin-border shadow-sm mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">XML Generators</h2>
                        <p className="text-sm text-gray-500">Generate sitemap.xml and rss.xml based on currently published posts.</p>
                    </div>
                    <button 
                        onClick={handleGenerate} 
                        disabled={loading}
                        className="px-4 py-2 bg-admin-primary text-white rounded-lg font-bold shadow-sm hover:bg-admin-primary-hover disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? <span className="material-symbols-outlined animate-spin">refresh</span> : <span className="material-symbols-outlined">autorenew</span>}
                        {loading ? 'Generating...' : 'Generate Now'}
                    </button>
                </div>

                {lastGenerated && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn">
                        {/* Sitemap */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-gray-700">Sitemap.xml</h3>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => navigator.clipboard.writeText(sitemapXml)}
                                        className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-600 font-medium"
                                    >
                                        Copy
                                    </button>
                                    <button 
                                        onClick={() => downloadFile(sitemapXml, 'sitemap.xml', 'text/xml')}
                                        className="text-xs px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium"
                                    >
                                        Download
                                    </button>
                                </div>
                            </div>
                            <textarea 
                                readOnly 
                                value={sitemapXml} 
                                className="w-full h-64 p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono focus:outline-none resize-none"
                            />
                        </div>

                        {/* RSS */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-gray-700">RSS Feed (rss.xml)</h3>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => navigator.clipboard.writeText(rssXml)}
                                        className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-600 font-medium"
                                    >
                                        Copy
                                    </button>
                                    <button 
                                        onClick={() => downloadFile(rssXml, 'rss.xml', 'text/xml')}
                                        className="text-xs px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium"
                                    >
                                        Download
                                    </button>
                                </div>
                            </div>
                            <textarea 
                                readOnly 
                                value={rssXml} 
                                className="w-full h-64 p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono focus:outline-none resize-none"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminSeoToolsPage;
