CREATE TABLE IF NOT EXISTS redirects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_path TEXT NOT NULL UNIQUE,
    target_path TEXT NOT NULL,
    status_code INTEGER DEFAULT 301,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_redirects_source_path ON redirects(source_path);

-- RLS
ALTER TABLE redirects ENABLE ROW LEVEL SECURITY;

-- Allow public read (for handling 404s)
CREATE POLICY "Public redirects are viewable by everyone" 
ON redirects FOR SELECT 
USING (true);

-- Allow admins to manage
CREATE POLICY "Admins can manage redirects" 
ON redirects FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'super_admin')
    )
);
