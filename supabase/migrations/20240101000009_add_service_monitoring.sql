-- Create error_logs table for tracking service errors
CREATE TABLE IF NOT EXISTS error_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message TEXT NOT NULL,
  stack_trace TEXT,
  component_stack TEXT,
  url TEXT,
  user_agent TEXT,
  severity TEXT CHECK (severity IN ('error', 'warning', 'info')) DEFAULT 'error',
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON error_logs(severity);
CREATE INDEX IF NOT EXISTS idx_error_logs_resolved ON error_logs(resolved);
CREATE INDEX IF NOT EXISTS idx_error_logs_severity_resolved ON error_logs(severity, resolved);

-- Create service_health table for tracking service availability
CREATE TABLE IF NOT EXISTS service_health (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_name TEXT NOT NULL,
  status TEXT CHECK (status IN ('healthy', 'degraded', 'unavailable')) NOT NULL,
  response_time_ms INTEGER,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for service health queries
CREATE INDEX IF NOT EXISTS idx_service_health_service_name ON service_health(service_name);
CREATE INDEX IF NOT EXISTS idx_service_health_created_at ON service_health(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_service_health_status ON service_health(status);

-- Create RLS policies for security
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_health ENABLE ROW LEVEL SECURITY;

-- Allow admins to read error logs
CREATE POLICY "Admins can view error logs" ON error_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Allow admins to update error logs (mark as resolved)
CREATE POLICY "Admins can update error logs" ON error_logs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Allow admins to read service health data
CREATE POLICY "Admins can view service health" ON service_health
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Allow service to insert health check data (for automated monitoring)
CREATE POLICY "Service can insert health data" ON service_health
  FOR INSERT WITH CHECK (true);

-- Create function to clean up old error logs (keep last 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_error_logs()
RETURNS INTEGER AS $$
BEGIN
  DELETE FROM error_logs 
  WHERE created_at < NOW() - INTERVAL '90 days' 
  AND resolved = true;
  
  RETURN SQL%ROWCOUNT;
END;
$$ LANGUAGE plpgsql;

-- Create function to get error statistics
CREATE OR REPLACE FUNCTION get_error_stats(
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '7 days',
  end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TABLE (
  total_errors BIGINT,
  unresolved_errors BIGINT,
  errors_last_24h BIGINT,
  errors_last_7d BIGINT,
  most_common_error TEXT,
  recent_errors JSON
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) AS total_errors,
    COUNT(*) FILTER (WHERE resolved = false) AS unresolved_errors,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') AS errors_last_24h,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') AS errors_last_7d,
    (SELECT message FROM error_logs 
     WHERE created_at >= start_date AND created_at <= end_date
     GROUP BY message 
     ORDER BY COUNT(*) DESC 
     LIMIT 1) AS most_common_error,
    (SELECT json_agg(row_to_json(error_logs.*)) 
     FROM error_logs 
     WHERE created_at >= NOW() - INTERVAL '24 hours'
     ORDER BY created_at DESC 
     LIMIT 10) AS recent_errors
  FROM error_logs
  WHERE created_at >= start_date AND created_at <= end_date;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically log service health issues
CREATE OR REPLACE FUNCTION log_service_health_issue()
RETURNS TRIGGER AS $$
BEGIN
  -- Log when service becomes unavailable
  IF NEW.status = 'unavailable' AND OLD.status != 'unavailable' THEN
    INSERT INTO error_logs (message, severity, metadata)
    VALUES (
      'Service ' || NEW.service_name || ' became unavailable',
      'error',
      jsonb_build_object(
        'service_name', NEW.service_name,
        'previous_status', OLD.status,
        'response_time_ms', NEW.response_time_ms,
        'error_message', NEW.error_message
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_service_health_issue
  AFTER UPDATE ON service_health
  FOR EACH ROW
  EXECUTE FUNCTION log_service_health_issue();