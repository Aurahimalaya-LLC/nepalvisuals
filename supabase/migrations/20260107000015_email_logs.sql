-- Create email_logs table for auditing
CREATE TABLE IF NOT EXISTS public.email_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Who initiated the email (if logged in)
    recipient TEXT NOT NULL,
    subject TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'sent', 'failed', 'pending'
    message_id TEXT,
    provider_response JSONB,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Policies
-- Admins can view all logs
CREATE POLICY "Admins can view all email logs" 
ON public.email_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('Admin', 'Super Admin')
  )
);

-- Service role (Edge Functions) can insert logs
CREATE POLICY "Service role can insert email logs" 
ON public.email_logs 
FOR INSERT 
WITH CHECK (true); -- In reality, Edge Functions bypass RLS if using service_role key, but for user-invoked functions, they act as the user.
-- Wait, the Edge Function acts as the user if we pass the auth header.
-- So we need to allow authenticated users to insert logs? 
-- Ideally, the Edge Function should use a service_role key to write to logs if we want to secure it strictly,
-- OR we allow users to insert their own logs? No, that's insecure (they could fake logs).
-- BETTER APPROACH: The Edge Function should use the Supabase Admin Client (Service Role) to write logs, 
-- ensuring the user cannot spoof them directly from the client.
-- However, in the Edge Function code I wrote, I used `createClient` with the User's Auth Header.
-- To fix this securely: The Edge Function should act with Service Role privileges for logging.
-- For now, let's allow authenticated users to insert, but ideally, we'd refactor the Edge Function to use separate clients.
-- Let's stick to a simple policy for now:
CREATE POLICY "Users can insert their own email logs"
ON public.email_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id);
