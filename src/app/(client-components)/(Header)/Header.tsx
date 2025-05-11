import React, { FC } from "react";
import MainNav1 from "./MainNav1";

export interface HeaderProps {
  navType?: "MainNav1" | "MainNav2";
  className?: string;
}

const Header: FC<HeaderProps> = ({ navType = "MainNav1", className = "" }) => {
  const renderNav = () => {
    switch (navType) {
      case "MainNav1":
        return <MainNav1 />;
      default:
        return <MainNav1 />;
    }
  };

  return (
    <div
      className={`nc-Header fixed top-0 w-full left-0 right-0 z-40 ${className}`}
    >
      {/* elbat3aa el rectangle 2ly fo2 deh */}
      <div className="absolute left-1/2 transform left-[53%] -translate-x-[33%] w-full max-w-[1012px] z-0">  <svg 
    width="50%" 
    height="40%" 
    viewBox="0 0 1012 108" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    preserveAspectRatio="none"
  >
    <path 
      fillRule="evenodd" 
      clipRule="evenodd" 
      d="M448.195 9.82477e-06C671.116 -1.10291e-05 1044.73 -3.55688e-05 1009 3.8554e-05C953.621 0.000153433 935.083 30.4789 917.706 59.0483C902.378 84.2491 887.954 107.964 849.945 107.964L722.845 107.964L161.443 107.964C123.434 107.964 109.01 84.2491 93.6817 59.0483C76.3049 30.4789 57.7666 0.00016321 2.38801 4.83307e-05C-27.686 -1.40559e-05 232.223 -6.54995e-06 448.195 9.82477e-06Z" 
      fill="#F0EFEF" 
      fillOpacity="0.86"
    />
  </svg>
</div>

      {/* Navigation content */}
      <div className="relative z-10">
        {renderNav()}
      </div>
    </div>
  );
};

export default Header;
