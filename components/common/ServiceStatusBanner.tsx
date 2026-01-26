import React, { useState, useEffect } from 'react';
import { healthCheck } from '../../lib/supabaseClient';

interface ServiceStatusBannerProps {
  className?: string;
  position?: 'top' | 'bottom';
}

/**
 * Service Status Banner Component
 * 
 * Displays a non-intrusive banner showing the current service status.
 * Automatically appears when services are degraded or unavailable.
 */
export const ServiceStatusBanner: React.FC<ServiceStatusBannerProps> = ({
  className = '',
  position = 'top'
}) => {
  const [serviceStatus, setServiceStatus] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      setIsChecking(true);
      try {
        const result = await healthCheck();
        setServiceStatus(result);
        
        // Show banner only for degraded or unavailable status
        if (result.status === 'degraded' || result.status === 'unavailable') {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      } catch (error) {
        console.error('Failed to check service status:', error);
        setIsVisible(true); // Show error state
      } finally {
        setIsChecking(false);
      }
    };

    // Initial check
    checkStatus();

    // Check every 30 seconds
    const interval = setInterval(checkStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  if (isChecking || !isVisible || !serviceStatus) {
    return null;
  }

  const getBannerStyle = () => {
    switch (serviceStatus.status) {
      case 'degraded':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'unavailable':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getIcon = () => {
    switch (serviceStatus.status) {
      case 'degraded':
        return 'warning';
      case 'unavailable':
        return 'error';
      default:
        return 'info';
    }
  };

  const getMessage = () => {
    switch (serviceStatus.status) {
      case 'degraded':
        return 'Some services are experiencing issues. We\'re working to resolve them.';
      case 'unavailable':
        return 'Services are temporarily unavailable. Please try again later.';
      default:
        return 'Service status unknown.';
    }
  };

  return (
    <div className={`fixed ${position}-0 left-0 right-0 z-50 border-b ${getBannerStyle()} ${className}`}>
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">{getIcon()}</span>
            <span className="text-sm font-medium">{getMessage()}</span>
          </div>
          
          <button
            onClick={() => setIsVisible(false)}
            className="text-sm hover:opacity-70 transition-opacity"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
        
        {serviceStatus.details?.error && (
          <div className="mt-1 text-xs opacity-75">
            Details: {serviceStatus.details.error}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceStatusBanner;