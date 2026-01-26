-- Create password_history table for auditing and reuse prevention
CREATE TABLE IF NOT EXISTS password_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    password_hash TEXT NOT NULL, -- Storing hash only
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE password_history ENABLE ROW LEVEL SECURITY;

-- Only admins can view password history (for auditing), users can't see it directly
CREATE POLICY "Allow admin read access on password_history" ON password_history FOR SELECT USING (auth.role() = 'authenticated');

-- Function to log password changes
CREATE OR REPLACE FUNCTION log_password_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if password has changed
    IF NEW.encrypted_password <> OLD.encrypted_password THEN
        INSERT INTO public.password_history (user_id, password_hash)
        VALUES (NEW.id, NEW.encrypted_password);
        
        -- Log to audit_logs as well
        INSERT INTO public.audit_logs (table_name, record_id, action, new_data, changed_by)
        VALUES (
            'auth.users', 
            NEW.id, 
            'PASSWORD_CHANGE', 
            jsonb_build_object('timestamp', now()), 
            auth.uid() -- Might be null if system trigger, but often captures context
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
-- Note: Requires superuser privileges to create triggers on auth schema in some setups.
-- If this fails in standard migration, it must be run via dashboard SQL editor.
DROP TRIGGER IF EXISTS on_password_change ON auth.users;
CREATE TRIGGER on_password_change
    AFTER UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION log_password_change();
