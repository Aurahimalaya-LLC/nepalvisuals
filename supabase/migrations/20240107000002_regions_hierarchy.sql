-- Update regions table for hierarchy and geo-data
ALTER TABLE regions ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES regions(id);
ALTER TABLE regions ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
ALTER TABLE regions ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);
ALTER TABLE regions ADD COLUMN IF NOT EXISTS zoom_level INTEGER DEFAULT 10;
ALTER TABLE regions ADD COLUMN IF NOT EXISTS bounds JSONB; -- { northeast: { lat, lng }, southwest: { lat, lng } }

-- Index for faster hierarchy queries
CREATE INDEX IF NOT EXISTS idx_regions_parent_id ON regions(parent_id);

-- Trigger audit log for regions update (already covered by generic trigger, but ensures columns are tracked)
-- No extra action needed as the log_audit_event trigger handles all columns dynamically.
