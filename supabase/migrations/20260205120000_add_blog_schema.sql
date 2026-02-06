-- Blog Categories
CREATE TABLE IF NOT EXISTS public.blog_categories (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  parent_id uuid REFERENCES public.blog_categories(id),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Blog Tags
CREATE TABLE IF NOT EXISTS public.blog_tags (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Blog Posts
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Core Content
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text,
  excerpt text,
  featured_image text,
  featured_image_alt text,
  author_id uuid REFERENCES auth.users(id), -- Or profiles(id) if preferred
  category_id uuid REFERENCES public.blog_categories(id),
  
  -- Status & Scheduling
  status text CHECK (status IN ('draft', 'published', 'archived', 'scheduled')) DEFAULT 'draft',
  published_at timestamp with time zone,
  scheduled_at timestamp with time zone,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Settings
  is_featured boolean DEFAULT false,
  is_sticky boolean DEFAULT false,
  template text DEFAULT 'standard', -- standard, review, how-to, etc.
  content_type text DEFAULT 'article', -- guide, news, comparison, tutorial
  
  -- SEO
  seo_title text,
  meta_description text,
  canonical_url text,
  is_no_index boolean DEFAULT false,
  is_no_follow boolean DEFAULT false,
  
  -- On-page SEO Controls
  primary_keyword text,
  secondary_keywords text[],
  search_intent text, -- informational, commercial, transactional, navigational
  
  -- Stats (Auto-calculated)
  reading_time_minutes integer DEFAULT 0,
  word_count integer DEFAULT 0,
  internal_link_count integer DEFAULT 0,
  external_link_count integer DEFAULT 0,
  content_score integer DEFAULT 0,
  
  -- Social & Distribution
  og_title text,
  og_description text,
  og_image text,
  twitter_card text DEFAULT 'summary_large_image',
  
  -- Schema Data (JSONB for flexibility)
  schema_type text DEFAULT 'BlogPosting',
  schema_data jsonb DEFAULT '{}'::jsonb -- Stores FAQs, Steps, Review data, etc.
);

-- Blog Post Tags (Many-to-Many)
CREATE TABLE IF NOT EXISTS public.blog_post_tags (
  post_id uuid REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES public.blog_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- Blog Related Posts (Manual relationships)
CREATE TABLE IF NOT EXISTS public.blog_related_posts (
  post_id uuid REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  related_post_id uuid REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, related_post_id),
  CHECK (post_id != related_post_id)
);

-- RLS Policies
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_related_posts ENABLE ROW LEVEL SECURITY;

-- Public Read Policies
CREATE POLICY "Public read categories" ON public.blog_categories FOR SELECT USING (true);
CREATE POLICY "Public read tags" ON public.blog_tags FOR SELECT USING (true);
CREATE POLICY "Public read published posts" ON public.blog_posts FOR SELECT USING (status = 'published' OR status = 'scheduled'); -- Admin needs to see all, handled by service role or specific admin policy
CREATE POLICY "Public read post tags" ON public.blog_post_tags FOR SELECT USING (true);
CREATE POLICY "Public read related posts" ON public.blog_related_posts FOR SELECT USING (true);

-- Admin Write Policies (Assuming authenticated users with specific roles, but for now generic auth write)
CREATE POLICY "Admin all categories" ON public.blog_categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin all tags" ON public.blog_tags FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin all posts" ON public.blog_posts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin all post tags" ON public.blog_post_tags FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin all related posts" ON public.blog_related_posts FOR ALL USING (auth.role() = 'authenticated');

-- Indexes for Performance
CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX idx_blog_posts_category ON public.blog_posts(category_id);
CREATE INDEX idx_blog_posts_author ON public.blog_posts(author_id);
