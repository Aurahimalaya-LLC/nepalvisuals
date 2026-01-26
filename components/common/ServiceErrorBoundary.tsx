import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  serviceStatus: 'unknown' | 'healthy' | 'degraded' | 'unavailable';
}

interface ServiceErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void; retryConnection?: () => void; serviceStatus?: string }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

class ServiceErrorBoundary extends React.Component<ServiceErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ServiceErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      serviceStatus: 'unknown'
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      serviceStatus: 'unavailable'
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Service Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
      serviceStatus: 'unavailable'
    });

    // Call the onError prop if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Attempt to log the error to a monitoring service
    this.logErrorToMonitoring(error, errorInfo);
  }

  logErrorToMonitoring = async (error: Error, errorInfo: React.ErrorInfo) => {
    try {
      // Log to console for now, can be extended to send to external monitoring service
      console.error('Logging to monitoring service:', {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      });

      // Attempt to log to Supabase if available
      const { error: logError } = await supabase
        .from('error_logs')
        .insert({
          message: error.message,
          stack_trace: error.stack,
          component_stack: errorInfo.componentStack,
          url: window.location.href,
          user_agent: navigator.userAgent,
          severity: 'error',
          created_at: new Date().toISOString()
        });

      if (logError) {
        console.warn('Failed to log error to database:', logError);
      }
    } catch (loggingError) {
      console.error('Failed to log error:', loggingError);
    }
  };

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      serviceStatus: 'unknown'
    });
  };

  retryConnection = async () => {
    this.setState({ serviceStatus: 'unknown' });
    
    try {
      // Test basic connectivity
      const { error } = await supabase.auth.getSession();
      
      if (!error) {
        this.setState({ serviceStatus: 'healthy' });
        // Reset the error after successful connection
        setTimeout(() => {
          this.resetError();
        }, 1000);
      } else {
        this.setState({ serviceStatus: 'unavailable' });
      }
    } catch (error) {
      this.setState({ serviceStatus: 'unavailable' });
    }
  };

  render() {
    if (this.state.hasError && this.state.serviceStatus === 'unavailable') {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return (
        <FallbackComponent 
          error={this.state.error!} 
          resetError={this.resetError}
          retryConnection={this.retryConnection}
          serviceStatus={this.state.serviceStatus}
        />
      );
    }

    return this.props.children;
  }
}

// Default error fallback component
const DefaultErrorFallback: React.FC<{
  error: Error;
  resetError: () => void;
  retryConnection?: () => void;
  serviceStatus?: string;
}> = ({ error, resetError, retryConnection, serviceStatus }) => {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    if (retryConnection) {
      await retryConnection();
    }
    setIsRetrying(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <span className="material-symbols-outlined text-red-600 text-2xl">error</span>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Service Unavailable
          </h2>
          
          <p className="text-gray-600 mb-4">
            We're experiencing technical difficulties. Our team has been notified and is working to resolve the issue.
          </p>
          
          {error && (
            <div className="bg-gray-100 rounded-md p-3 mb-4">
              <p className="text-sm text-gray-700 font-medium">Error Details:</p>
              <p className="text-sm text-gray-600 mt-1">{error.message}</p>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isRetrying ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin mr-2">⟳</span>
                  Retrying...
                </span>
              ) : (
                'Try Again'
              )}
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
            >
              Reload Page
            </button>
          </div>
          
          <div className="mt-4 text-xs text-gray-500">
            <p>Status: {serviceStatus || 'Unknown'}</p>
            <p>Timestamp: {new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceErrorBoundary;
