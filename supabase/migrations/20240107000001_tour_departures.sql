-- Create tour_departures table
CREATE TABLE IF NOT EXISTS tour_departures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 12,
    spots_booked INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Available', -- Available, Full, Cancelled, Completed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE tour_departures ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access on tour_departures" ON tour_departures FOR SELECT USING (true);
CREATE POLICY "Allow admin write access on tour_departures" ON tour_departures FOR ALL USING (auth.role() = 'authenticated');

-- Add audit trigger
CREATE TRIGGER audit_tour_departures_changes
AFTER INSERT OR UPDATE OR DELETE ON tour_departures
FOR EACH ROW EXECUTE FUNCTION log_audit_event();
