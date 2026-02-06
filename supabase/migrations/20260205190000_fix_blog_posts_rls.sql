-- Fix RLS policies for blog_posts to ensure admins can create/edit posts

-- 1. Ensure RLS is enabled
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- 2. Drop potential conflicting policies
DROP POLICY IF EXISTS "Admin all posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Public read published posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can view all posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can insert posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can update posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can delete posts" ON public.blog_posts;

-- 3. Re-create Public Read Policy
-- Allow public to read published/scheduled posts
CREATE POLICY "Public read published posts" 
ON public.blog_posts FOR SELECT 
USING (status IN ('published', 'scheduled'));

-- 4. Admin Policies
-- Admins can view ALL posts (drafts, archived, etc.)
CREATE POLICY "Admins can view all posts" 
ON public.blog_posts FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('Admin', 'Super Admin')
  )
);

-- Admins can INSERT posts
CREATE POLICY "Admins can insert posts" 
ON public.blog_posts FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('Admin', 'Super Admin')
  )
);

-- Admins can UPDATE posts
CREATE POLICY "Admins can update posts" 
ON public.blog_posts FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('Admin', 'Super Admin')
  )
);

-- Admins can DELETE posts
CREATE POLICY "Admins can delete posts" 
ON public.blog_posts FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('Admin', 'Super Admin')
  )
);
