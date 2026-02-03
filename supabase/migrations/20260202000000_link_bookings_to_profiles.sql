-- Link Bookings to Profiles (Authenticated Users)
-- Currently bookings references 'customers' table, but we use 'profiles' for auth users.

-- 1. Add user_id to bookings
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 2. Make customer_id nullable (since we are using user_id now)
ALTER TABLE public.bookings 
ALTER COLUMN customer_id DROP NOT NULL;

-- 3. Update RLS Policies for Bookings
-- Allow users to view their own bookings
DROP POLICY IF EXISTS "Enable read access for all users" ON public.bookings;
CREATE POLICY "Users can view own bookings" ON public.bookings
FOR SELECT USING (auth.uid() = user_id);

-- Allow admins to view all bookings
CREATE POLICY "Admins can view all bookings" ON public.bookings
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('Admin', 'Super Admin')
  )
);

-- Allow authenticated users to insert their own bookings
CREATE POLICY "Users can create bookings" ON public.bookings
FOR INSERT WITH CHECK (auth.uid() = user_id);
