-- Ensure bookings table has user_id and nullable customer_id
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.bookings 
ALTER COLUMN customer_id DROP NOT NULL;

-- Update RLS Policies for Bookings
DROP POLICY IF EXISTS "Enable read access for all users" ON public.bookings;
DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can view all bookings" ON public.bookings;

-- Re-create policies
CREATE POLICY "Users can view own bookings" ON public.bookings
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all bookings" ON public.bookings
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('Admin', 'Super Admin')
  )
);

CREATE POLICY "Users can create bookings" ON public.bookings
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Ensure booking_travelers has new columns (idempotent)
ALTER TABLE booking_travelers 
ADD COLUMN IF NOT EXISTS dob DATE,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS dietary_requirements TEXT;
