import React from "react";

interface PriceTagProps {
  price: number;
  currency?: string;
  className?: string;
}

const PriceTag: React.FC<PriceTagProps> = ({
  price,
  currency = "$",
  className = "",
}) => {
  return (
    <div
      className={`absolute top-5 right-5 z-10 flex items-center justify-center px-4 py-2.5 rounded-full bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 shadow-lg font-semibold text-sm ${className}`}
    >
      <span>{currency}</span>
      <span>{price}</span>
      <span className="ml-1 text-xs text-neutral-500">/night</span>
    </div>
  );
};

export default PriceTag; 