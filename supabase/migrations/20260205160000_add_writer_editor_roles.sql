-- Add Writer and Editor roles to profiles
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('Super Admin', 'Admin', 'Customer', 'Guide', 'Writer', 'Editor'));
