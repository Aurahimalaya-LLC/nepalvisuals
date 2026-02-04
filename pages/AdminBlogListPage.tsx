import React from 'react';
import { Link } from 'react-router-dom';

const AdminBlogListPage: React.FC = () => {
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-admin-text-primary">Blog Posts</h1>
                    <p className="mt-1 text-sm text-admin-text-secondary">Manage your blog content.</p>
                </div>
                <Link
                    to="/admin/blog/new"
                    className="flex items-center gap-2 px-4 py-2 bg-admin-primary text-white rounded-lg text-sm font-bold shadow-sm hover:bg-admin-primary-hover transition-colors"
                >
                    <span className="material-symbols-outlined text-sm">add</span>
                    CREATE NEW POST
                </Link>
            </div>

            <div className="bg-admin-surface rounded-xl border border-admin-border shadow-sm p-12 text-center">
                <div className="w-16 h-16 bg-admin-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-3xl text-admin-primary">article</span>
                </div>
                <h3 className="text-lg font-semibold text-admin-text-primary mb-2">No blog posts yet</h3>
                <p className="text-admin-text-secondary max-w-sm mx-auto mb-6">
                    Get started by creating your first blog post to share updates and stories with your audience.
                </p>
                <Link
                    to="/admin/blog/new"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-admin-primary text-white rounded-lg text-sm font-bold shadow-sm hover:bg-admin-primary-hover transition-colors"
                >
                    Create Post
                </Link>
            </div>
        </div>
    );
};

export default AdminBlogListPage;
