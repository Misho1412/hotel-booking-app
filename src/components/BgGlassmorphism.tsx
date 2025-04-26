import React, { FC } from "react";

export interface BgGlassmorphismProps {
  className?: string;
}

const BgGlassmorphism: FC<BgGlassmorphismProps> = ({
  className = "absolute inset-x-0 md:top-10 xl:top-40 min-h-0 pl-20 py-24 flex overflow-hidden z-0",
}) => {
  return (
    <div
      className={`nc-BgGlassmorphism ${className}`}
      data-nc-id="BgGlassmorphism"
    >
      {/* Reduced opacity for better compatibility with background image */}
      <span className="hidden sm:block absolute bg-[#ef233c] opacity-10 bottom-0 left-1/4 transform -translate-x-1/2 w-80 h-80 rounded-full filter blur-3xl" />
      <span className="hidden sm:block absolute bg-primary-500 opacity-10 top-0 right-1/3 transform translate-x-1/2 w-80 h-80 rounded-full filter blur-3xl" />
    </div>
  );
};

export default BgGlassmorphism;
