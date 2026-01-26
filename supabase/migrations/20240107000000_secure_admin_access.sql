-- Enable Row Level Security
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasonal_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_discounts ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Allow public read access on tours" ON tours FOR SELECT USING (true);
CREATE POLICY "Allow public read access on regions" ON regions FOR SELECT USING (true);
CREATE POLICY "Allow public read access on tour_images" ON tour_images FOR SELECT USING (true);
CREATE POLICY "Allow public read access on tour_itineraries" ON tour_itineraries FOR SELECT USING (true);
CREATE POLICY "Allow public read access on seasonal_prices" ON seasonal_prices FOR SELECT USING (true);
CREATE POLICY "Allow public read access on group_discounts" ON group_discounts FOR SELECT USING (true);

-- Create policy for authenticated admin write access
CREATE POLICY "Allow admin write access on tours" ON tours FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admin write access on regions" ON regions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admin write access on bookings" ON bookings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admin write access on customers" ON customers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admin write access on tour_images" ON tour_images FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admin write access on tour_itineraries" ON tour_itineraries FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admin write access on seasonal_prices" ON seasonal_prices FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admin write access on group_discounts" ON group_discounts FOR ALL USING (auth.role() = 'authenticated');

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name TEXT NOT NULL,
    record_id UUID,
    action TEXT NOT NULL, -- INSERT, UPDATE, DELETE
    old_data JSONB,
    new_data JSONB,
    changed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow admins to view audit logs
CREATE POLICY "Allow admin read access on audit_logs" ON audit_logs FOR SELECT USING (auth.role() = 'authenticated');

-- Trigger function for audit logging
CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (table_name, record_id, action, old_data, new_data, changed_by)
    VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        CASE WHEN TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END,
        auth.uid()
    );
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply triggers to key tables
CREATE TRIGGER audit_tours_changes
AFTER INSERT OR UPDATE OR DELETE ON tours
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_regions_changes
AFTER INSERT OR UPDATE OR DELETE ON regions
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_bookings_changes
AFTER INSERT OR UPDATE OR DELETE ON bookings
FOR EACH ROW EXECUTE FUNCTION log_audit_event();
