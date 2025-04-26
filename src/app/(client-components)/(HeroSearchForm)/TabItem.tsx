import React, { FC } from "react";

export interface TabItemProps {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}

const TabItem: FC<TabItemProps> = ({ children, active = false, onClick = () => {} }) => {
  return (
    <li
      className={`flex items-center cursor-pointer font-['ABeeZee'] text-[16px] ${
        active
          ? "text-white border-b-2 border-white"
          : "text-[#ffffff80] hover:text-white"
      }`}
      onClick={onClick}
    >
      {children}
    </li>
  );
};

export default TabItem; 