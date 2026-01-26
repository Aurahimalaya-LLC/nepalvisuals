-- Customers Table Update (if needed)
-- Note: 'customers' table was already created in a previous step (20240101000003_add_bookings.sql)
-- We will just ensure it has all fields we need for this comprehensive view or add them if missing.

-- Check existing schema:
-- id, name, email, phone, address, created_at, updated_at

-- We might want to add 'avatar_url' if it's not there, but for MVP we can assume 'address' stores the full JSON or text.
-- Let's add 'avatar_url' column if it doesn't exist.

do $$ 
begin 
  if not exists (select 1 from information_schema.columns where table_name = 'customers' and column_name = 'avatar_url') then
    alter table public.customers add column avatar_url text;
  end if;
end $$;

-- Policies (already set in previous migration, but good to double check or refine)
-- We assume RLS is enabled and policies allow public read/write for this admin demo.

-- No new table creation needed as 'customers' exists.
