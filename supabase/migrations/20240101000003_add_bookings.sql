-- Customers Table
create table if not exists public.customers (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  email text not null,
  phone text,
  address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Bookings Table
create table if not exists public.bookings (
  id uuid default uuid_generate_v4() primary key,
  customer_id uuid references public.customers(id) on delete restrict,
  tour_id uuid references public.tours(id) on delete restrict,
  dates text, -- Simplified for MVP, ideally a range or start_date/end_date
  total_price numeric(10, 2) default 0,
  status text check (status in ('Pending', 'Confirmed', 'Cancelled')) default 'Pending',
  payment_status text check (payment_status in ('Not Paid', 'Deposit Paid', 'Paid in Full', 'Refunded')) default 'Not Paid',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Booking Travelers (Many-to-Many / Detail table)
create table if not exists public.booking_travelers (
  id uuid default uuid_generate_v4() primary key,
  booking_id uuid references public.bookings(id) on delete cascade,
  name text,
  email text,
  phone text,
  is_primary boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.customers enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_travelers enable row level security;

-- Policies
create policy "Enable read access for all users" on public.customers for select using (true);
create policy "Enable insert for all users" on public.customers for insert with check (true);
create policy "Enable update for all users" on public.customers for update using (true);
create policy "Enable delete for all users" on public.customers for delete using (true);

create policy "Enable read access for all users" on public.bookings for select using (true);
create policy "Enable insert for all users" on public.bookings for insert with check (true);
create policy "Enable update for all users" on public.bookings for update using (true);
create policy "Enable delete for all users" on public.bookings for delete using (true);

create policy "Enable read access for all users" on public.booking_travelers for select using (true);
create policy "Enable insert for all users" on public.booking_travelers for insert with check (true);
create policy "Enable update for all users" on public.booking_travelers for update using (true);
create policy "Enable delete for all users" on public.booking_travelers for delete using (true);

-- Mock Data
insert into public.customers (name, email, phone) values
('Alex Johnson', 'alex.j@example.com', '+1 555-123-4567'),
('Samantha Lee', 'sam.lee@example.com', '+44 20 7946 0958');
