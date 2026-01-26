-- Team Types Table
create table if not exists public.team_types (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Team Members Table
create table if not exists public.team_members (
  id uuid default uuid_generate_v4() primary key,
  full_name text not null,
  role text,
  image_url text,
  status text check (status in ('Active', 'Inactive')) default 'Active',
  team_type_id uuid references public.team_types(id) on delete restrict,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.team_types enable row level security;
alter table public.team_members enable row level security;

-- Policies
create policy "Enable read access for all users" on public.team_types for select using (true);
create policy "Enable insert for all users" on public.team_types for insert with check (true);
create policy "Enable update for all users" on public.team_types for update using (true);
create policy "Enable delete for all users" on public.team_types for delete using (true);

create policy "Enable read access for all users" on public.team_members for select using (true);
create policy "Enable insert for all users" on public.team_members for insert with check (true);
create policy "Enable update for all users" on public.team_members for update using (true);
create policy "Enable delete for all users" on public.team_members for delete using (true);

-- Mock Data
insert into public.team_types (name, description) values
('Guides', 'Experienced trekking guides'),
('Management', 'Core management team'),
('Support Staff', 'Office and logistical support')
on conflict (name) do nothing;
