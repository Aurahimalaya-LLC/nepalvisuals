-- Create storage bucket for media
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- Media Metadata Table
create table if not exists public.media_files (
  id uuid default uuid_generate_v4() primary key,
  filename text not null,
  file_path text not null unique,
  mime_type text,
  size_bytes bigint,
  width int,
  height int,
  alt_text text,
  caption text,
  title text,
  tags text[],
  uploaded_by uuid, -- Could reference auth.users if we had auth setup
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.media_files enable row level security;

-- Policies
create policy "Enable read access for all users" on public.media_files for select using (true);
create policy "Enable insert for all users" on public.media_files for insert with check (true);
create policy "Enable update for all users" on public.media_files for update using (true);
create policy "Enable delete for all users" on public.media_files for delete using (true);

-- Storage Policies
create policy "Give public access to media" on storage.objects for select using ( bucket_id = 'media' );
create policy "Allow public upload to media" on storage.objects for insert with check ( bucket_id = 'media' );
create policy "Allow public update to media" on storage.objects for update using ( bucket_id = 'media' );
create policy "Allow public delete to media" on storage.objects for delete using ( bucket_id = 'media' );
