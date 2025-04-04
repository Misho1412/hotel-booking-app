import React from 'react';

interface AmenityProps {
  name: string;
  icon?: string;
  className?: string;
}

const Amenity: React.FC<AmenityProps> = ({ name, icon, className = "" }) => {
  // Default icon if none provided
  const iconClass = icon || 'las la-check-circle';
  
  return (
    <div className={`flex items-center space-x-2 text-sm ${className}`}>
      <i className={`${iconClass} text-primary-600`}></i>
      <span className="text-neutral-700 dark:text-neutral-300">{name}</span>
    </div>
  );
};

export default Amenity; 