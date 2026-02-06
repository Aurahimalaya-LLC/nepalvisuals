-- Add guest_count to bookings table
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS guest_count INTEGER DEFAULT 0;

-- Backfill guest_count based on existing travelers
UPDATE public.bookings 
SET guest_count = (
    SELECT count(*) 
    FROM public.booking_travelers 
    WHERE booking_travelers.booking_id = bookings.id
);

-- Force guest_count to 1 if it is 0 (orphaned records fix)
UPDATE public.bookings 
SET guest_count = 1 
WHERE guest_count = 0;
