-- Fix RLS Policies for Profiles and Blog Posts (Final Robust Version)

-- 1. Ensure Profiles are readable by everyone (needed for permission checks)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (true);

-- 2. Fix Blog Posts RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Admins can insert posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can update posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can delete posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Public can view published posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can view all posts" ON public.blog_posts;

-- Allow public to view published posts
CREATE POLICY "Public can view published posts" 
ON public.blog_posts FOR SELECT 
USING (status = 'Published');

-- Allow Admins to View ALL posts (Drafts, etc.)
CREATE POLICY "Admins can view all posts" 
ON public.blog_posts FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE (profiles.id = auth.uid() OR profiles.email = auth.jwt() ->> 'email')
    AND profiles.role IN ('Admin', 'Super Admin')
  )
);

-- Allow Admins to Insert
CREATE POLICY "Admins can insert posts" 
ON public.blog_posts FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE (profiles.id = auth.uid() OR profiles.email = auth.jwt() ->> 'email')
    AND profiles.role IN ('Admin', 'Super Admin')
  )
);

-- Allow Admins to Update
CREATE POLICY "Admins can update posts" 
ON public.blog_posts FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE (profiles.id = auth.uid() OR profiles.email = auth.jwt() ->> 'email')
    AND profiles.role IN ('Admin', 'Super Admin')
  )
);

-- Allow Admins to Delete
CREATE POLICY "Admins can delete posts" 
ON public.blog_posts FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE (profiles.id = auth.uid() OR profiles.email = auth.jwt() ->> 'email')
    AND profiles.role IN ('Admin', 'Super Admin')
  )
);
