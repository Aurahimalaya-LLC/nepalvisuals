-- Add missing fields to tours table for enhanced functionality
-- This migration adds fields that the application expects but don't exist in the database

begin;

-- Add missing fields that the application code expects
alter table public.tours 
  add column if not exists currency text default 'USD',
  add column if not exists focus_keywords text,
  add column if not exists canonical_url text,
  add column if not exists image_captions text;

-- Add constraints for new fields
alter table public.tours 
  add constraint valid_currency check (currency is null or currency in ('USD', 'EUR', 'GBP', 'AUD', 'CAD', 'JPY', 'CNY', 'INR'));

-- Create indexes for better query performance on new fields
create index if not exists idx_tours_currency on public.tours(currency);
create index if not exists idx_tours_canonical_url on public.tours(canonical_url);

-- Update existing tours to have default currency if not set
update public.tours 
set currency = 'USD' 
where currency is null;

commit;