-- Create junction table for multiple categories (1 primary is already in blog_posts.category_id)
-- This table can be used for "Secondary" or "Optional" categories
CREATE TABLE IF NOT EXISTS public.blog_post_categories (
  post_id uuid REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  category_id uuid REFERENCES public.blog_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, category_id)
);

-- Enable RLS
ALTER TABLE public.blog_post_categories ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Public read post categories" ON public.blog_post_categories;
CREATE POLICY "Public read post categories" ON public.blog_post_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin all post categories" ON public.blog_post_categories;
CREATE POLICY "Admin all post categories" ON public.blog_post_categories FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('Admin', 'Super Admin')
  )
);
