-- Settings Table (Key-Value Store for Application Config)
create table if not exists public.settings (
  key text primary key,
  value jsonb,
  description text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.settings enable row level security;

-- Policies
create policy "Enable read access for all users" on public.settings for select using (true);
create policy "Enable update for admins" on public.settings for update using (true); -- Simplified for demo
create policy "Enable insert for admins" on public.settings for insert with check (true);

-- Seed Initial Settings
insert into public.settings (key, value, description) values
('site_config', '{"title": "Nepal Visuals", "email": "hello@nepalvisuals.com"}', 'General site configuration'),
('branding', '{"logo_url": "https://i.imgur.com/3Cn1g28.png", "favicon_url": "/vite.svg"}', 'Logo and favicon URLs'),
('notifications', '{"email_bookings": true, "email_contact": true}', 'Notification preferences'),
('appearance', '{"theme": "light", "primary_color": "#0F172A"}', 'Theme settings')
on conflict (key) do nothing;
