import { supabase } from '../supabaseClient';
import { RedirectService } from './redirectService';

export interface BlogCategory {
    id: string;
    name: string;
    slug: string;
    description?: string;
    parent_id?: string;
}

export interface BlogTag {
    id: string;
    name: string;
    slug: string;
}

export interface BlogPost {
    id: string;
    
    // Core
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    featured_image: string;
    featured_image_alt: string;
    author_id: string;
    category_id: string;
    parent_id?: string;
    
    // Status
    status: 'draft' | 'published' | 'archived' | 'scheduled';
    published_at?: string;
    scheduled_at?: string;
    updated_at: string;
    created_at: string;
    
    // Settings
    is_featured: boolean;
    is_sticky: boolean;
    show_toc: boolean;
    template: string;
    content_type: string;
    
    // SEO
    seo_title: string;
    meta_description: string;
    canonical_url: string;
    is_no_index: boolean;
    is_no_follow: boolean;
    
    // On-page SEO
    primary_keyword: string;
    secondary_keywords: string[];
    search_intent: string;
    
    // Stats
    reading_time_minutes: number;
    word_count: number;
    internal_link_count: number;
    external_link_count: number;
    content_score: number;
    
    // Social
    og_title: string;
    og_description: string;
    og_image: string;
    twitter_card: string;
    
    // Schema
    schema_type: string;
    schema_data: any;

    // Relations
    tags?: BlogTag[];
    category?: BlogCategory;
    secondary_categories?: BlogCategory[];
    related_posts?: BlogPost[];
    parent?: { title: string };
    author?: { 
        full_name: string; 
        email: string;
        bio?: string;
        job_title?: string;
        twitter_handle?: string;
        linkedin_url?: string;
        website_url?: string;
    };
}

export const BlogService = {
    // Posts
    async getAllPosts() {
        const { data, error } = await supabase
            .from('blog_posts')
            .select(`
                *,
                category:blog_categories!blog_posts_category_id_fkey(name, slug),
                secondary_categories:blog_post_categories(category:blog_categories(name, slug)),
                author:profiles(full_name, email),
                parent:blog_posts!parent_id(title)
            `)
            .order('created_at', { ascending: false });
        
        if (error) throw error;

        // Flatten secondary categories
        const posts = data.map((post: any) => ({
            ...post,
            secondary_categories: post.secondary_categories 
                ? post.secondary_categories.map((c: any) => c.category) 
                : []
        }));
        
        return posts as BlogPost[];
    },

    async getPostById(id: string) {
        const { data, error } = await supabase
            .from('blog_posts')
            .select(`
                *,
                tags:blog_post_tags(tag:blog_tags(*)),
                secondary_categories:blog_post_categories(category:blog_categories(*)),
                related_posts_join:blog_related_posts!post_id(related_post:blog_posts!related_post_id(id, title, slug, status))
            `)
            .eq('id', id)
            .single();
        
        if (error) throw error;
        
        // Flatten tags structure
        if (data.tags) {
            data.tags = data.tags.map((t: any) => t.tag);
        }

        // Flatten secondary categories structure
        if (data.secondary_categories) {
            data.secondary_categories = data.secondary_categories.map((c: any) => c.category);
        }

        // Flatten related posts structure
        // We'll attach it as 'related_posts' property (which doesn't exist on BlogPost interface yet properly, wait)
        // BlogPost interface has related_posts? No.
        // I should add it to the interface if I want to return it.
        // Or just return it and let the consumer handle it.
        
        const relatedPosts = data.related_posts_join 
            ? data.related_posts_join.map((r: any) => r.related_post) 
            : [];
        
        return { ...data, related_posts: relatedPosts } as BlogPost & { related_posts: BlogPost[] };
    },

    async createPost(post: Partial<BlogPost>, tagIds: string[] = [], relatedPostIds: string[] = [], secondaryCategoryIds: string[] = []) {
        // 1. Create Post
        const { data, error } = await supabase
            .from('blog_posts')
            .insert(post)
            .select()
            .single();
        
        if (error) throw error;

        // 2. Add Tags
        if (tagIds.length > 0) {
            const tagInserts = tagIds.map(tagId => ({
                post_id: data.id,
                tag_id: tagId
            }));
            const { error: tagError } = await supabase
                .from('blog_post_tags')
                .insert(tagInserts);
            
            if (tagError) console.error("Error adding tags:", tagError);
        }

        // 3. Add Secondary Categories
        if (secondaryCategoryIds.length > 0) {
            const catInserts = secondaryCategoryIds.map(catId => ({
                post_id: data.id,
                category_id: catId
            }));
            const { error: catError } = await supabase
                .from('blog_post_categories')
                .insert(catInserts);
            
            if (catError) console.error("Error adding secondary categories:", catError);
        }

        // 4. Add Related Posts
        if (relatedPostIds.length > 0) {
            await this.updateRelatedPosts(data.id, relatedPostIds);
        }

        return data as BlogPost;
    },

    async updatePost(id: string, updates: Partial<BlogPost>, tagIds?: string[], relatedPostIds?: string[], secondaryCategoryIds?: string[]) {
        // Check for slug change to create redirect
        if (updates.slug) {
            const { data: currentPost } = await supabase
                .from('blog_posts')
                .select('slug')
                .eq('id', id)
                .single();
            
            if (currentPost && currentPost.slug !== updates.slug) {
                try {
                    await RedirectService.createRedirect(
                        `/blog/${currentPost.slug}`, 
                        `/blog/${updates.slug}`
                    );
                } catch (e) {
                    console.error('Failed to create auto-redirect', e);
                }
            }
        }

        // 1. Update Post
        const { data, error } = await supabase
            .from('blog_posts')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();
        
        if (error) throw error;

        // 2. Update Tags (if provided)
        if (tagIds) {
            // Delete existing
            await supabase.from('blog_post_tags').delete().eq('post_id', id);
            
            // Insert new
            if (tagIds.length > 0) {
                const tagInserts = tagIds.map(tagId => ({
                    post_id: id,
                    tag_id: tagId
                }));
                await supabase.from('blog_post_tags').insert(tagInserts);
            }
        }

        // 3. Update Secondary Categories (if provided)
        if (secondaryCategoryIds) {
            // Delete existing
            await supabase.from('blog_post_categories').delete().eq('post_id', id);
            
            // Insert new
            if (secondaryCategoryIds.length > 0) {
                const catInserts = secondaryCategoryIds.map(catId => ({
                    post_id: id,
                    category_id: catId
                }));
                await supabase.from('blog_post_categories').insert(catInserts);
            }
        }

        // 4. Update Related Posts (if provided)
        if (relatedPostIds) {
            await this.updateRelatedPosts(id, relatedPostIds);
        }

        return data as BlogPost;
    },

    async deletePost(id: string) {
        const { error } = await supabase.from('blog_posts').delete().eq('id', id);
        if (error) throw error;
    },

    // Public Methods
    async getPublishedPosts(page = 1, limit = 10) {
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const { data, error, count } = await supabase
            .from('blog_posts')
            .select(`
                *,
                category:blog_categories!blog_posts_category_id_fkey(name, slug),
                author:profiles(full_name, email)
            `, { count: 'exact' })
            .eq('status', 'published')
            .lte('published_at', new Date().toISOString())
            .order('published_at', { ascending: false })
            .range(from, to);

        if (error) throw error;
        return { posts: data as BlogPost[], total: count || 0 };
    },

    async getPostBySlug(slug: string) {
        const { data, error } = await supabase
            .from('blog_posts')
            .select(`
                *,
                category:blog_categories!blog_posts_category_id_fkey(name, slug),
                author:profiles(full_name, email, bio, twitter_handle, linkedin_url, website_url, job_title),
                tags:blog_post_tags(tag:blog_tags(id, name, slug))
            `)
            .eq('slug', slug)
            .single();
        
        if (error) throw error;

        // Flatten tags structure
        if (data.tags) {
            data.tags = data.tags.map((t: any) => t.tag);
        }

        return data as BlogPost;
    },

    async getPostsByCategory(categorySlug: string) {
        // First get category ID
        const { data: category, error: catError } = await supabase
            .from('blog_categories')
            .select('id, name')
            .eq('slug', categorySlug)
            .single();
        
        if (catError) throw catError;

        const { data, error } = await supabase
            .from('blog_posts')
            .select(`
                *,
                category:blog_categories!blog_posts_category_id_fkey(name, slug),
                author:profiles(full_name)
            `)
            .eq('category_id', category.id)
            .eq('status', 'published')
            .lte('published_at', new Date().toISOString())
            .order('published_at', { ascending: false });

        if (error) throw error;
        return { category, posts: data as BlogPost[] };
    },

    async getPostsByTag(tagSlug: string) {
        // First get tag ID
        const { data: tag, error: tagError } = await supabase
            .from('blog_tags')
            .select('id, name')
            .eq('slug', tagSlug)
            .single();
        
        if (tagError) throw tagError;

        const { data, error } = await supabase
            .from('blog_post_tags')
            .select(`
                post:blog_posts!post_id(
                    *,
                    category:blog_categories!blog_posts_category_id_fkey(name, slug),
                    author:profiles(full_name)
                )
            `)
            .eq('tag_id', tag.id);

        if (error) throw error;
        
        const posts = data
            .map((d: any) => d.post)
            .filter((p: any) => 
                p.status === 'published' && 
                (!p.published_at || new Date(p.published_at) <= new Date())
            )
            .sort((a: any, b: any) => {
                return new Date(b.published_at || 0).getTime() - new Date(a.published_at || 0).getTime();
            });

        return { tag, posts: posts as BlogPost[] };
    },

    async getPostsByAuthor(authorId: string) {
        const { data: author, error: authorError } = await supabase
            .from('profiles')
            .select('id, full_name, bio, job_title, website_url, twitter_handle, linkedin_url, avatar_url')
            .eq('id', authorId)
            .single();
        
        if (authorError) throw authorError;

        const { data, error } = await supabase
            .from('blog_posts')
            .select(`
                *,
                category:blog_categories(name, slug),
                author:profiles(full_name, avatar_url)
            `)
            .eq('author_id', authorId)
            .eq('status', 'published')
            .lte('published_at', new Date().toISOString())
            .order('published_at', { ascending: false });

        if (error) throw error;
        return { author, posts: data as BlogPost[] };
    },

    async getAllCategories() {
        const { data, error } = await supabase
            .from('blog_categories')
            .select('*')
            .order('name');
        if (error) throw error;
        return data as BlogCategory[];
    },

    async createCategory(category: Partial<BlogCategory>) {
        const { data, error } = await supabase
            .from('blog_categories')
            .insert(category)
            .select()
            .single();
        if (error) throw error;
        return data as BlogCategory;
    },

    async getAllAuthors() {
        const { data, error } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .order('full_name');
        if (error) throw error;
        return data;
    },

    // Tags
    async getAllTags() {
        const { data, error } = await supabase
            .from('blog_tags')
            .select('*')
            .order('name');
        if (error) throw error;
        return data as BlogTag[];
    },

    async createTag(tag: Partial<BlogTag>) {
        const { data, error } = await supabase
            .from('blog_tags')
            .insert(tag)
            .select()
            .single();
        if (error) throw error;
        return data as BlogTag;
    },

    // Related Posts & Search
    async searchPosts(query: string) {
        const { data, error } = await supabase
            .from('blog_posts')
            .select('id, title, slug, status')
            .ilike('title', `%${query}%`)
            .limit(10);
        if (error) throw error;
        return data as BlogPost[];
    },

    async searchPublicPosts(query: string, page = 1, limit = 10) {
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const { data, error, count } = await supabase
            .from('blog_posts')
            .select(`
                *,
                category:blog_categories!blog_posts_category_id_fkey(name, slug),
                author:profiles(full_name, email)
            `, { count: 'exact' })
            .eq('status', 'published')
            .lte('published_at', new Date().toISOString())
            .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%,content.ilike.%${query}%`)
            .order('published_at', { ascending: false })
            .range(from, to);

        if (error) throw error;
        return { posts: data as BlogPost[], total: count || 0 };
    },

    async getRelatedPosts(postId: string) {
        const { data, error } = await supabase
            .from('blog_related_posts')
            .select(`
                related_post:blog_posts!related_post_id(id, title, slug, status, featured_image)
            `)
            .eq('post_id', postId);
        
        if (error) throw error;
        return data.map((d: any) => d.related_post) as BlogPost[];
    },

    async getChildPosts(parentId: string) {
        const { data, error } = await supabase
            .from('blog_posts')
            .select('id, title, slug, status, published_at')
            .eq('parent_id', parentId)
            .order('published_at', { ascending: false });
        
        if (error) throw error;
        return data as BlogPost[];
    },

    async getPublicRelatedPosts(post: BlogPost, limit = 3) {
        // 1. Get manual related posts
        const manual = await this.getRelatedPosts(post.id);
        
        if (manual.length >= limit) return manual.slice(0, limit);

        // 2. Get auto related posts (same category)
        const excludeIds = [post.id, ...manual.map(p => p.id)];
        
        let auto: BlogPost[] = [];
        if (post.category_id) {
            const { data } = await supabase
                .from('blog_posts')
                .select('id, title, slug, status, featured_image')
                .eq('category_id', post.category_id)
                .eq('status', 'published')
                .lte('published_at', new Date().toISOString())
                .not('id', 'in', `(${excludeIds.join(',')})`)
                .limit(limit - manual.length);
            
            if (data) auto = data as BlogPost[];
        }

        return [...manual, ...auto];
    },

    async updateRelatedPosts(postId: string, relatedPostIds: string[]) {
        // Delete all existing
        await supabase.from('blog_related_posts').delete().eq('post_id', postId);
        
        // Insert new
        if (relatedPostIds.length > 0) {
            const inserts = relatedPostIds.map(rid => ({
                post_id: postId,
                related_post_id: rid
            }));
            const { error } = await supabase.from('blog_related_posts').insert(inserts);
            if (error) throw error;
        }
    }
};
