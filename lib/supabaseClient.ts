import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
  console.error(`VITE_SUPABASE_URL: ${supabaseUrl ? 'Defined' : 'Missing'}`);
  console.error(`VITE_SUPABASE_ANON_KEY: ${supabaseAnonKey ? 'Defined' : 'Missing'}`);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Checks the connection to Supabase by making a simple request.
 * Returns true if connected, false otherwise.
 */
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from('countries').select('count', { count: 'exact', head: true });
    if (error) {
        // If table doesn't exist, it might return a specific error code (e.g. 42P01), 
        // but it still means we reached Supabase.
        // However, usually we want to know if we can query. 
        // Let's try a health check or auth check if we don't know the schema.
        // A simple auth.getSession() is also a good check.
        console.warn('Supabase connection check warning:', error.message);
        // If it's a network error, it will likely throw or return a specific error.
        return true; // We connected, but maybe table is missing.
    }
    return true;
  } catch (err) {
    console.error('Supabase connection check failed:', err);
    return false;
  }
};

/**
 * Enhanced health check with detailed error reporting
 */
export const healthCheck = async (): Promise<{
  status: 'healthy' | 'degraded' | 'unavailable';
  details: {
    database: boolean;
    auth: boolean;
    network: boolean;
    timestamp: string;
    error?: string;
  };
}> => {
  const startTime = Date.now();
  const results = {
    database: false,
    auth: false,
    network: true,
    timestamp: new Date().toISOString(),
    error: undefined as string | undefined
  };

  try {
    // Test database connection
    const { data: dbData, error: dbError } = await supabase
      .from('tours')
      .select('id')
      .limit(1);
    
    results.database = !dbError;
    if (dbError) {
      console.error('Database health check failed:', dbError.message);
    }

    // Test auth service
    const { data: authData, error: authError } = await supabase.auth.getSession();
    results.auth = !authError;
    if (authError) {
      console.error('Auth health check failed:', authError.message);
    }

    const responseTime = Date.now() - startTime;
    
    // Determine overall status
    let status: 'healthy' | 'degraded' | 'unavailable' = 'healthy';
    if (!results.database || !results.auth) {
      status = 'degraded';
    }
    if (!results.database && !results.auth) {
      status = 'unavailable';
      results.error = 'Both database and auth services are unavailable';
    }

    return {
      status,
      details: results
    };

  } catch (error) {
    results.network = false;
    const errorMessage = error instanceof Error ? error.message : 'Unknown network error';
    const lowerMessage = errorMessage.toLowerCase();
    
    // Add hint for common local development issues
    if (lowerMessage.includes('failed to fetch') || lowerMessage.includes('network') || lowerMessage.includes('err_aborted')) {
      const isDev = import.meta.env.DEV;
      const hint = isDev 
        ? ' (Hint: Check your internet connection, CORS settings, or disable ad-blockers)'
        : '';
      results.error = `${errorMessage}${hint}`;
    } else {
      results.error = errorMessage;
    }
    
    return {
      status: 'unavailable',
      details: results
    };
  }
};

/**
 * Service monitoring and alerting configuration
 */
export const serviceMonitor = {
  // Check interval in milliseconds
  checkInterval: 30000, // 30 seconds
  
  // Alert thresholds
  thresholds: {
    responseTime: 5000, // 5 seconds
    consecutiveFailures: 3,
    availability: 0.95 // 95% uptime requirement
  },

  // Alert channels (can be extended)
  alerts: {
    email: true,
    webhook: false,
    console: true
  }
};

/**
 * Automated service recovery attempts
 */
export const attemptRecovery = async (): Promise<boolean> => {
  console.log('Attempting service recovery...');
  
  try {
    // Clear any cached connections
    if (supabase.removeAllChannels) {
      supabase.removeAllChannels();
    }
    
    // Force reconnection
    const { error } = await supabase.auth.getSession();
    
    if (!error) {
      console.log('Service recovery successful');
      return true;
    }
    
    console.log('Service recovery failed, manual intervention required');
    return false;
    
  } catch (error) {
    console.error('Service recovery error:', error);
    return false;
  }
};