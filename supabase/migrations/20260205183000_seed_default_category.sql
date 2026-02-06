INSERT INTO public.blog_categories (name, slug, description)
VALUES ('General', 'general', 'Default category for blog posts')
ON CONFLICT (slug) DO NOTHING;
