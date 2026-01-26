import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-admin-background flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-admin-surface rounded-lg border border-admin-border p-6 text-center">
            <div className="mb-4">
              <span className="material-symbols-outlined text-6xl text-red-500">error</span>
            </div>
            <h2 className="text-xl font-semibold text-admin-text-primary mb-2">Something went wrong</h2>
            <p className="text-admin-text-secondary mb-4">
              We're sorry, but something unexpected happened. Please try refreshing the page or contact support if the problem persists.
            </p>
            {this.state.error && (
              <details className="mb-4 text-left">
                <summary className="cursor-pointer text-sm text-admin-text-secondary hover:text-admin-primary">
                  Error details (for developers)
                </summary>
                <div className="mt-2 p-3 bg-red-50 rounded text-xs font-mono text-red-700 overflow-auto">
                  <p className="mb-2">{this.state.error.toString()}</p>
                  {this.state.errorInfo?.componentStack && (
                    <pre>{this.state.errorInfo.componentStack}</pre>
                  )}
                </div>
              </details>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.resetError}
                className="px-4 py-2 bg-admin-primary text-white rounded-lg hover:bg-admin-primary-hover transition-colors"
              >
                Try Again
              </button>
              <Link
                to="/admin/tours"
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Go to Tours
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;