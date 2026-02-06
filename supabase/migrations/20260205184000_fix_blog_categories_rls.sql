-- Enable RLS for Blog Categories and Tags
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_tags ENABLE ROW LEVEL SECURITY;

-- Categories Policies
DROP POLICY IF EXISTS "Public categories are viewable by everyone" ON public.blog_categories;
CREATE POLICY "Public categories are viewable by everyone" 
ON public.blog_categories FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Admins can insert categories" ON public.blog_categories;
CREATE POLICY "Admins can insert categories" 
ON public.blog_categories FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('Admin', 'Super Admin')
  )
);

DROP POLICY IF EXISTS "Admins can update categories" ON public.blog_categories;
CREATE POLICY "Admins can update categories" 
ON public.blog_categories FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('Admin', 'Super Admin')
  )
);

DROP POLICY IF EXISTS "Admins can delete categories" ON public.blog_categories;
CREATE POLICY "Admins can delete categories" 
ON public.blog_categories FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('Admin', 'Super Admin')
  )
);

-- Tags Policies
DROP POLICY IF EXISTS "Public tags are viewable by everyone" ON public.blog_tags;
CREATE POLICY "Public tags are viewable by everyone" 
ON public.blog_tags FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Admins can insert tags" ON public.blog_tags;
CREATE POLICY "Admins can insert tags" 
ON public.blog_tags FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('Admin', 'Super Admin')
  )
);

DROP POLICY IF EXISTS "Admins can update tags" ON public.blog_tags;
CREATE POLICY "Admins can update tags" 
ON public.blog_tags FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('Admin', 'Super Admin')
  )
);

DROP POLICY IF EXISTS "Admins can delete tags" ON public.blog_tags;
CREATE POLICY "Admins can delete tags" 
ON public.blog_tags FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('Admin', 'Super Admin')
  )
);
