import React from 'react';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
  label?: string;
}

/**
 * A loading spinner component with customizable size, color, and optional label
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'text-primary-600',
  className = '',
  label = 'Loading...',
}) => {
  const sizeClass = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  }[size];

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`rounded-full border-t-transparent ${color} animate-spin ${sizeClass}`}
        role="status"
        aria-label={label}
      />
      {label && (
        <span className="mt-2 text-sm text-gray-500 dark:text-gray-400">{label}</span>
      )}
    </div>
  );
};

export default LoadingSpinner; 