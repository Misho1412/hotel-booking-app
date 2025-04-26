import React from "react";

const BedIcon = ({ className = "" }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M3 12h18v7a1 1 0 01-1 1H4a1 1 0 01-1-1v-7z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M3 12v-3a1 1 0 011-1h16a1 1 0 011 1v3"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M6 8V5a1 1 0 011-1h2a1 1 0 011 1v3"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M14 8V5a1 1 0 011-1h2a1 1 0 011 1v3"
      />
    </svg>
  );
};

export default BedIcon; 