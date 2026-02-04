-- Add new columns to booking_travelers table
ALTER TABLE booking_travelers 
ADD COLUMN IF NOT EXISTS dob DATE,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS dietary_requirements TEXT;
