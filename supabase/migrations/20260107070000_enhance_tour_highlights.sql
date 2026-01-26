-- Add new columns to tour_highlights
ALTER TABLE public.tour_highlights
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;
