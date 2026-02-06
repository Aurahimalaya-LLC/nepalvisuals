-- Robust Fix for Blog Permissions
-- Addresses potential ID mismatch between auth.users and public.profiles by checking Email as well.

-- 1. Ensure RLS is enabled
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing Admin policies to replace them
DROP POLICY IF EXISTS "Admins can insert posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can update posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can delete posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can view all posts" ON public.blog_posts;

-- 3. Create Robust Admin Policies (Check ID OR Email)

-- VIEW (Select)
CREATE POLICY "Admins can view all posts" 
ON public.blog_posts FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE (
      profiles.id = auth.uid() 
      OR profiles.email = (select auth.jwt() ->> 'email')
    )
    AND profiles.role IN ('Admin', 'Super Admin')
  )
);

-- INSERT
CREATE POLICY "Admins can insert posts" 
ON public.blog_posts FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE (
      profiles.id = auth.uid() 
      OR profiles.email = (select auth.jwt() ->> 'email')
    )
    AND profiles.role IN ('Admin', 'Super Admin')
  )
);

-- UPDATE
CREATE POLICY "Admins can update posts" 
ON public.blog_posts FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE (
      profiles.id = auth.uid() 
      OR profiles.email = (select auth.jwt() ->> 'email')
    )
    AND profiles.role IN ('Admin', 'Super Admin')
  )
);

-- DELETE
CREATE POLICY "Admins can delete posts" 
ON public.blog_posts FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE (
      profiles.id = auth.uid() 
      OR profiles.email = (select auth.jwt() ->> 'email')
    )
    AND profiles.role IN ('Admin', 'Super Admin')
  )
);

-- 4. Also fix Blog Post Categories (Junction Table) just in case
DROP POLICY IF EXISTS "Admin all post categories" ON public.blog_post_categories;
CREATE POLICY "Admin all post categories" ON public.blog_post_categories FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE (
      profiles.id = auth.uid() 
      OR profiles.email = (select auth.jwt() ->> 'email')
    )
    AND profiles.role IN ('Admin', 'Super Admin')
  )
);
