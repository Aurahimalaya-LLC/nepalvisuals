import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white';
  text?: string;
  className?: string;
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16'
};

const colorClasses = {
  primary: 'border-admin-primary',
  secondary: 'border-admin-text-secondary',
  white: 'border-white'
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  text,
  className = '',
  fullScreen = false
}) => {
  const spinner = (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`animate-spin rounded-full border-2 border-t-transparent ${sizeClasses[size]} ${colorClasses[color]}`} />
      {text && (
        <span className={`ml-3 text-sm text-admin-text-secondary ${size === 'sm' ? 'text-xs' : ''}`}>
          {text}
        </span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        <div className="text-center">
          {spinner}
          {text && (
            <p className="mt-4 text-admin-text-secondary">{text}</p>
          )}
        </div>
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;