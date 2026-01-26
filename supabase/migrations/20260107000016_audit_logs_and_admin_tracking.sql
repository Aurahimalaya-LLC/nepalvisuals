-- Create audit_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL, -- e.g., 'LOGIN', 'LOGOUT', 'UPDATE_TOUR'
    table_name TEXT, -- e.g., 'auth.users', 'tours'
    record_id UUID, -- ID of the record affected
    old_data JSONB,
    new_data JSONB,
    changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    details JSONB, -- Extra info like IP, User Agent, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view all logs
CREATE POLICY "Admins can view all audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('Admin', 'Super Admin')
  )
);

-- Policy: Authenticated users (Admins) can insert logs
CREATE POLICY "Admins can insert audit logs" 
ON public.audit_logs 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('Admin', 'Super Admin')
  )
);
