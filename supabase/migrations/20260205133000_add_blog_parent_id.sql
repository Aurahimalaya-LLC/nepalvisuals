-- Add parent_id to blog_posts for hierarchical articles
ALTER TABLE public.blog_posts
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.blog_posts(id) ON DELETE SET NULL;
