import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

interface ErrorLog {
  id: string;
  message: string;
  stack_trace?: string;
  component_stack?: string;
  url: string;
  user_agent: string;
  severity: 'error' | 'warning' | 'info';
  created_at: string;
  resolved: boolean;
  resolved_at?: string;
  resolved_by?: string;
}

interface ServiceHealthDashboardProps {
  className?: string;
}

/**
 * Service Health Dashboard Component
 * 
 * Provides comprehensive monitoring and management of service health,
 * error tracking, and performance metrics for the application.
 */
export const ServiceHealthDashboard: React.FC<ServiceHealthDashboardProps> = ({
  className = ''
}) => {
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalErrors: 0,
    unresolvedErrors: 0,
    last24Hours: 0,
    last7Days: 0
  });
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

  const fetchErrorLogs = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('error_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (fetchError) {
        throw fetchError;
      }

      setErrorLogs(data || []);
      calculateStats(data || []);
    } catch (err) {
      console.error('Failed to fetch error logs:', err);
      setError('Failed to load error logs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (logs: ErrorLog[]) => {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const stats = {
      totalErrors: logs.length,
      unresolvedErrors: logs.filter(log => !log.resolved).length,
      last24Hours: logs.filter(log => new Date(log.created_at) >= last24Hours).length,
      last7Days: logs.filter(log => new Date(log.created_at) >= last7Days).length
    };

    setStats(stats);
  };

  const markAsResolved = async (logId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('error_logs')
        .update({
          resolved: true,
          resolved_at: new Date().toISOString(),
          resolved_by: 'admin' // This should be the current user in production
        })
        .eq('id', logId);

      if (updateError) {
        throw updateError;
      }

      // Update local state
      setErrorLogs(prev => 
        prev.map(log => 
          log.id === logId 
            ? { ...log, resolved: true, resolved_at: new Date().toISOString(), resolved_by: 'admin' }
            : log
        )
      );

      // Recalculate stats
      calculateStats(errorLogs.map(log => 
        log.id === logId 
          ? { ...log, resolved: true, resolved_at: new Date().toISOString(), resolved_by: 'admin' }
          : log
      ));
    } catch (err) {
      console.error('Failed to mark error as resolved:', err);
      alert('Failed to mark error as resolved. Please try again.');
    }
  };

  const clearAllErrors = async () => {
    if (!confirm('Are you sure you want to clear all error logs? This action cannot be undone.')) {
      return;
    }

    try {
      const { error: deleteError } = await supabase
        .from('error_logs')
        .delete()
        .eq('resolved', true); // Only delete resolved errors

      if (deleteError) {
        throw deleteError;
      }

      // Refresh the logs
      fetchErrorLogs();
    } catch (err) {
      console.error('Failed to clear error logs:', err);
      alert('Failed to clear error logs. Please try again.');
    }
  };

  useEffect(() => {
    fetchErrorLogs();

    if (autoRefresh) {
      const interval = setInterval(fetchErrorLogs, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading health dashboard...</span>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Service Health Dashboard</h2>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-gray-300"
              />
              Auto-refresh
            </label>
            <button
              onClick={fetchErrorLogs}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Refresh
            </button>
            <button
              onClick={clearAllErrors}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              disabled={stats.unresolvedErrors === 0}
            >
              Clear Resolved
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6">
        <div className="bg-red-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-red-600">{stats.totalErrors}</div>
          <div className="text-sm text-red-800">Total Errors</div>
        </div>
        <div className="bg-orange-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-orange-600">{stats.unresolvedErrors}</div>
          <div className="text-sm text-orange-800">Unresolved</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">{stats.last24Hours}</div>
          <div className="text-sm text-blue-800">Last 24 Hours</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-600">{stats.last7Days}</div>
          <div className="text-sm text-purple-800">Last 7 Days</div>
        </div>
      </div>

      {/* Error Logs */}
      <div className="px-6 pb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Error Logs</h3>
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {errorLogs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <span className="material-symbols-outlined text-4xl mb-2">check_circle</span>
            <p>No error logs found. All systems are running smoothly!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {errorLogs.map((log) => (
              <div key={log.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(log.severity)}`}>
                        {log.severity.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDate(log.created_at)}
                      </span>
                      {log.resolved && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                          RESOLVED
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-900 mb-2">{log.message}</p>
                    
                    {log.stack_trace && (
                      <details className="mb-2">
                        <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">
                          Stack Trace
                        </summary>
                        <pre className="mt-2 text-xs text-gray-700 bg-gray-50 p-2 rounded overflow-x-auto">
                          {log.stack_trace}
                        </pre>
                      </details>
                    )}
                    
                    {log.component_stack && (
                      <details className="mb-2">
                        <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">
                          Component Stack
                        </summary>
                        <pre className="mt-2 text-xs text-gray-700 bg-gray-50 p-2 rounded overflow-x-auto">
                          {log.component_stack}
                        </pre>
                      </details>
                    )}
                    
                    <div className="text-xs text-gray-500">
                      <p>URL: {truncateText(log.url, 60)}</p>
                      <p>User Agent: {truncateText(log.user_agent, 60)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    {!log.resolved && (
                      <button
                        onClick={() => markAsResolved(log.id)}
                        className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceHealthDashboard;