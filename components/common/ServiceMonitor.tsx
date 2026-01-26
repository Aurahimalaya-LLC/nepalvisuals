import React, { useState, useEffect } from 'react';
import { healthCheck, serviceMonitor, attemptRecovery } from '../../lib/supabaseClient';

interface ServiceStatus {
  status: 'healthy' | 'degraded' | 'unavailable';
  details: {
    database: boolean;
    auth: boolean;
    network: boolean;
    timestamp: string;
    error?: string;
  };
}

interface ServiceMonitorProps {
  onStatusChange?: (status: ServiceStatus) => void;
  showAlerts?: boolean;
}

export const ServiceMonitor: React.FC<ServiceMonitorProps> = ({ 
  onStatusChange, 
  showAlerts = true 
}) => {
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);
  const [isRecovering, setIsRecovering] = useState(false);

  const performHealthCheck = async () => {
    setIsChecking(true);
    try {
      const result = await healthCheck();
      setServiceStatus(result);
      
      // Track consecutive failures
      if (result.status === 'unavailable') {
        setConsecutiveFailures(prev => prev + 1);
      } else {
        setConsecutiveFailures(0);
      }

      // Notify parent component
      if (onStatusChange) {
        onStatusChange(result);
      }

      // Trigger recovery if thresholds are exceeded
      if (consecutiveFailures >= serviceMonitor.thresholds.consecutiveFailures && 
          result.status === 'unavailable' && 
          !isRecovering) {
        await attemptServiceRecovery();
      }

    } catch (error) {
      console.error('Health check failed:', error);
      setConsecutiveFailures(prev => prev + 1);
    } finally {
      setIsChecking(false);
    }
  };

  const attemptServiceRecovery = async () => {
    setIsRecovering(true);
    console.log('Attempting automated service recovery...');
    
    try {
      const recoverySuccess = await attemptRecovery();
      if (recoverySuccess) {
        console.log('Service recovery successful');
        setConsecutiveFailures(0);
        // Re-check status after recovery
        setTimeout(performHealthCheck, 2000);
      } else {
        console.error('Service recovery failed - manual intervention required');
      }
    } catch (error) {
      console.error('Recovery attempt failed:', error);
    } finally {
      setIsRecovering(false);
    }
  };

  useEffect(() => {
    // Initial health check
    performHealthCheck();

    // Set up periodic monitoring
    const interval = setInterval(performHealthCheck, serviceMonitor.checkInterval);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50';
      case 'degraded': return 'text-yellow-600 bg-yellow-50';
      case 'unavailable': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return 'check_circle';
      case 'degraded': return 'warning';
      case 'unavailable': return 'error';
      default: return 'help';
    }
  };

  if (!serviceStatus) {
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <span className="material-symbols-outlined text-sm">pending</span>
        <span className="text-sm">Checking service status...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">Service Status</h3>
        <button
          onClick={performHealthCheck}
          disabled={isChecking || isRecovering}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md disabled:opacity-50"
        >
          {isChecking ? 'Checking...' : 'Refresh'}
        </button>
      </div>

      {/* Overall Status */}
      <div className={`flex items-center gap-2 p-3 rounded-lg mb-4 ${getStatusColor(serviceStatus.status)}`}>
        <span className="material-symbols-outlined">{getStatusIcon(serviceStatus.status)}</span>
        <span className="font-medium capitalize">{serviceStatus.status}</span>
        {isRecovering && (
          <span className="ml-auto text-sm">Recovering...</span>
        )}
      </div>

      {/* Service Details */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Database</span>
          <span className={`text-sm ${serviceStatus.details.database ? 'text-green-600' : 'text-red-600'}`}>
            {serviceStatus.details.database ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Authentication</span>
          <span className={`text-sm ${serviceStatus.details.auth ? 'text-green-600' : 'text-red-600'}`}>
            {serviceStatus.details.auth ? 'Available' : 'Unavailable'}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Network</span>
          <span className={`text-sm ${serviceStatus.details.network ? 'text-green-600' : 'text-red-600'}`}>
            {serviceStatus.details.network ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Last Check</span>
          <span className="text-sm text-gray-500">
            {new Date(serviceStatus.details.timestamp).toLocaleTimeString()}
          </span>
        </div>

        {serviceStatus.details.error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">
              <strong>Error:</strong> {serviceStatus.details.error}
            </p>
          </div>
        )}

        {consecutiveFailures > 0 && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              <strong>Warning:</strong> {consecutiveFailures} consecutive failures detected
            </p>
          </div>
        )}
      </div>

      {/* Recovery Actions */}
      {serviceStatus.status === 'unavailable' && !isRecovering && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={attemptServiceRecovery}
            disabled={isRecovering}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isRecovering ? 'Recovering...' : 'Attempt Recovery'}
          </button>
        </div>
      )}

      {/* Alerts */}
      {showAlerts && consecutiveFailures >= serviceMonitor.thresholds.consecutiveFailures && (
        <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-md">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-red-600">warning</span>
            <span className="text-sm font-medium text-red-800">
              Service availability alert: System has been unavailable for {consecutiveFailures} consecutive checks
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceMonitor;