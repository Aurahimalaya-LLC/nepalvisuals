-- Fix profiles id to auto-generate if not provided
-- This is useful for creating 'mock' users or users managed outside of Supabase Auth for the admin panel demo.

alter table public.profiles 
alter column id set default uuid_generate_v4();

-- Ensure the foreign key doesn't block us if we are creating standalone profiles
-- We already tried to drop it in the previous migration, but let's ensure it's handled or we accept that these users can't "login" via Supabase Auth unless we sync them back.
-- For the purpose of the UI CRUD task, allowing standalone profiles is best.

alter table public.profiles drop constraint if exists profiles_id_fkey;
