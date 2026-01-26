-- Regions Table
create table if not exists public.regions (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  tagline text,
  description text,
  status text check (status in ('Published', 'Draft')) default 'Draft',
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for regions
alter table public.regions enable row level security;

-- Policies
create policy "Enable read access for all users" on public.regions for select using (true);
create policy "Enable insert for all users" on public.regions for insert with check (true);
create policy "Enable update for all users" on public.regions for update using (true);
create policy "Enable delete for all users" on public.regions for delete using (true);

-- Mock Data
insert into public.regions (name, tagline, description, status, image_url)
values
('Everest Region', 'The Roof of the World', 'Home to the world''s highest peaks, including Mt. Everest.', 'Published', 'https://placehold.co/1200x800?text=Region+Image'),
('Annapurna Region', 'A Trekker''s Paradise', 'Diverse landscapes ranging from lush subtropical forests to alpine peaks.', 'Published', 'https://placehold.co/1200x800?text=Region+Image'),
('Langtang Region', 'Valley of Glaciers', 'Nearest Himalayan region from Kathmandu, rich in Tamang culture.', 'Draft', 'https://placehold.co/1200x800?text=Region+Image');
