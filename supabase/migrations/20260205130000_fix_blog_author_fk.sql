-- Change blog_posts author_id to reference profiles instead of auth.users
-- This allows us to join profiles table in queries to get author names

ALTER TABLE public.blog_posts
DROP CONSTRAINT IF EXISTS blog_posts_author_id_fkey;

ALTER TABLE public.blog_posts
ADD CONSTRAINT blog_posts_author_id_fkey
FOREIGN KEY (author_id)
REFERENCES public.profiles(id)
ON DELETE SET NULL;
