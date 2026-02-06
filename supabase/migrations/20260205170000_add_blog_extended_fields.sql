-- Add missing columns for extended blog functionality
-- Content Classification
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS content_type text DEFAULT 'article'; -- guide, news, comparison, tutorial, article

-- Advanced SEO & Schema
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS schema_type text DEFAULT 'BlogPosting';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS schema_data jsonb DEFAULT '{}'::jsonb; -- Store steps, reviews, faqs here
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS content_score integer DEFAULT 0;

-- Content Freshness / Metrics (Optional but requested)
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS reading_time_minutes integer DEFAULT 0;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS internal_link_count integer DEFAULT 0;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS external_link_count integer DEFAULT 0;

-- Ensure content_type is one of the allowed values (optional constraint)
-- ALTER TABLE public.blog_posts ADD CONSTRAINT blog_posts_content_type_check CHECK (content_type IN ('article', 'guide', 'news', 'comparison', 'tutorial'));
