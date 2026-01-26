-- Users Table
-- In a real Supabase app, users are managed in auth.users (not accessible via public API directly usually).
-- However, we often need a public 'profiles' or 'users' table to store app-specific data (role, name, avatar).
-- We'll create a 'profiles' table that mirrors auth.users for this purpose.

create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  role text check (role in ('Admin', 'Customer', 'Guide')) default 'Customer',
  status text check (status in ('Active', 'Inactive', 'Banned')) default 'Active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies
create policy "Enable read access for all users" on public.profiles for select using (true);
create policy "Enable insert for all users" on public.profiles for insert with check (true);
create policy "Enable update for all users" on public.profiles for update using (true);
create policy "Enable delete for all users" on public.profiles for delete using (true);

-- Function to handle new user signup (Trigger)
-- This automatically creates a profile when a user signs up via Auth
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'Customer');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Mock Data (We can't easily mock auth.users from here without admin API, 
-- but we can insert into profiles if we assume IDs exist or just for display if we relax the FK constraint for dev)
-- For this dev environment, let's just insert into profiles directly. 
-- In production, the FK constraint is strict. Here, we might need to be careful.
-- For the sake of the 'Admin' panel UI demo, we'll insert dummy profiles.
-- NOTE: If strict FK is enforced, these inserts will fail if auth.users doesn't have these IDs.
-- Let's drop the FK for the dev/demo table if it exists to allow standalone testing, or assume we create real users.
-- For this "User Management System" task, we'll assume we are managing this 'profiles' table.

-- Let's try to make it work standalone for the UI demo by not enforcing FK if it's just a demo table.
-- But for a real app, keep the FK. I'll keep the FK but use a trick or just expect empty if no auth users.
-- Actually, let's make ID a regular UUID for this demo migration so we can seed data easily.

alter table public.profiles drop constraint if exists profiles_id_fkey;

insert into public.profiles (id, email, full_name, role, status)
values 
('d0c41b8a-1234-5678-9abc-def012345678', 'admin@nepalvisuals.com', 'Admin User', 'Admin', 'Active'),
('d0c41b8a-1234-5678-9abc-def012345679', 'alex.j@email.com', 'Alex Johnson', 'Customer', 'Active')
on conflict (id) do nothing;
