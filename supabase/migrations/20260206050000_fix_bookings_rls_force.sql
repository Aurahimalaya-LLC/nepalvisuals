-- Fix Bookings RLS to ensure Admins can definitely view all bookings
-- This is a "Hammer" fix to ensure no ambiguity

-- 1. Enable RLS (just in case)
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- 2. Drop potential conflicting policies
DROP POLICY IF EXISTS "Admins can view all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.bookings;
DROP POLICY IF EXISTS "Allow admin write access on bookings" ON public.bookings;

-- 3. Re-create "Users can view own bookings"
CREATE POLICY "Users can view own bookings" 
ON public.bookings FOR SELECT 
USING (auth.uid() = user_id);

-- 4. Re-create "Admins can view all bookings"
-- Using a simpler join existence check
CREATE POLICY "Admins can view all bookings" 
ON public.bookings FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('Admin', 'Super Admin')
  )
);

-- 5. Allow Admins to UPDATE/DELETE bookings
CREATE POLICY "Admins can update bookings" 
ON public.bookings FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('Admin', 'Super Admin')
  )
);

CREATE POLICY "Admins can delete bookings" 
ON public.bookings FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('Admin', 'Super Admin')
  )
);

-- 6. Allow Admins to INSERT bookings (if needed)
CREATE POLICY "Admins can insert bookings" 
ON public.bookings FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('Admin', 'Super Admin')
  )
);
