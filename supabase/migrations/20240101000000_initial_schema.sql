-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Tours Table
create table if not exists public.tours (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  url_slug text unique not null,
  destination text,
  region text,
  country text default 'Nepal',
  category text,
  status text check (status in ('Published', 'Draft')) default 'Draft',
  price numeric(10, 2) default 0,
  duration text,
  difficulty text check (difficulty in ('Easy', 'Moderate', 'Challenging', 'Strenuous')),
  guide_language text,
  tour_type text check (tour_type in ('Group', 'Private')),
  description text,
  meta_title text,
  meta_description text,
  featured_image text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tour Highlights
create table if not exists public.tour_highlights (
  id uuid default uuid_generate_v4() primary key,
  tour_id uuid references public.tours(id) on delete cascade not null,
  icon text not null,
  text text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Seasonal Prices
create table if not exists public.seasonal_prices (
  id uuid default uuid_generate_v4() primary key,
  tour_id uuid references public.tours(id) on delete cascade not null,
  start_date date not null,
  end_date date not null,
  price numeric(10, 2) not null,
  label text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Group Discounts
create table if not exists public.group_discounts (
  id uuid default uuid_generate_v4() primary key,
  tour_id uuid references public.tours(id) on delete cascade not null,
  min_guests int not null,
  max_guests int not null,
  discount_percentage numeric(5, 2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tour Gallery Images
create table if not exists public.tour_gallery_images (
  id uuid default uuid_generate_v4() primary key,
  tour_id uuid references public.tours(id) on delete cascade not null,
  image_url text not null,
  caption text,
  display_order int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Itineraries
create table if not exists public.itineraries (
  id uuid default uuid_generate_v4() primary key,
  tour_id uuid references public.tours(id) on delete cascade not null,
  day_number int not null,
  title text not null,
  description text,
  accommodation text,
  meals text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Inclusions/Exclusions
create table if not exists public.tour_inclusions (
  id uuid default uuid_generate_v4() primary key,
  tour_id uuid references public.tours(id) on delete cascade not null,
  item text not null,
  is_excluded boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- FAQs
create table if not exists public.tour_faqs (
  id uuid default uuid_generate_v4() primary key,
  tour_id uuid references public.tours(id) on delete cascade not null,
  question text not null,
  answer text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.tours enable row level security;
alter table public.tour_highlights enable row level security;
alter table public.seasonal_prices enable row level security;
alter table public.group_discounts enable row level security;
alter table public.tour_gallery_images enable row level security;
alter table public.itineraries enable row level security;
alter table public.tour_inclusions enable row level security;
alter table public.tour_faqs enable row level security;

-- Policies (Public Read, Admin Write)
-- For simplicity in this dev environment, we will allow anon read, and anon write (since we don't have full auth setup yet and want to test from the frontend immediately).
-- ideally, write policies should be: create policy "Enable insert for authenticated users only" on ...

create policy "Enable read access for all users" on public.tours for select using (true);
create policy "Enable insert for all users" on public.tours for insert with check (true);
create policy "Enable update for all users" on public.tours for update using (true);
create policy "Enable delete for all users" on public.tours for delete using (true);

create policy "Enable read access for all users" on public.tour_highlights for select using (true);
create policy "Enable insert for all users" on public.tour_highlights for insert with check (true);
create policy "Enable update for all users" on public.tour_highlights for update using (true);
create policy "Enable delete for all users" on public.tour_highlights for delete using (true);

create policy "Enable read access for all users" on public.seasonal_prices for select using (true);
create policy "Enable insert for all users" on public.seasonal_prices for insert with check (true);
create policy "Enable update for all users" on public.seasonal_prices for update using (true);
create policy "Enable delete for all users" on public.seasonal_prices for delete using (true);

create policy "Enable read access for all users" on public.group_discounts for select using (true);
create policy "Enable insert for all users" on public.group_discounts for insert with check (true);
create policy "Enable update for all users" on public.group_discounts for update using (true);
create policy "Enable delete for all users" on public.group_discounts for delete using (true);

create policy "Enable read access for all users" on public.tour_gallery_images for select using (true);
create policy "Enable insert for all users" on public.tour_gallery_images for insert with check (true);
create policy "Enable update for all users" on public.tour_gallery_images for update using (true);
create policy "Enable delete for all users" on public.tour_gallery_images for delete using (true);

create policy "Enable read access for all users" on public.itineraries for select using (true);
create policy "Enable insert for all users" on public.itineraries for insert with check (true);
create policy "Enable update for all users" on public.itineraries for update using (true);
create policy "Enable delete for all users" on public.itineraries for delete using (true);

create policy "Enable read access for all users" on public.tour_inclusions for select using (true);
create policy "Enable insert for all users" on public.tour_inclusions for insert with check (true);
create policy "Enable update for all users" on public.tour_inclusions for update using (true);
create policy "Enable delete for all users" on public.tour_inclusions for delete using (true);

create policy "Enable read access for all users" on public.tour_faqs for select using (true);
create policy "Enable insert for all users" on public.tour_faqs for insert with check (true);
create policy "Enable update for all users" on public.tour_faqs for update using (true);
create policy "Enable delete for all users" on public.tour_faqs for delete using (true);

-- Insert some mock data
insert into public.tours (name, url_slug, destination, category, status, price, difficulty, featured_image)
values 
('European Escape', 'european-escape', 'France, Italy', 'Cultural', 'Published', 2450, 'Moderate', 'https://placehold.co/1200x800?text=Tour+Image'),
('Alpine Adventure', 'alpine-adventure', 'Switzerland', 'Adventure', 'Draft', 1890, 'Challenging', 'https://placehold.co/1200x800?text=Tour+Image');
