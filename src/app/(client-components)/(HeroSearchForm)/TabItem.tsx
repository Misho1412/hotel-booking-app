import React, { FC } from "react";

export interface TabItemProps {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}

const TabItem: FC<TabItemProps> = ({ children, active = false, onClick = () => {} }) => {
  return (
    <li
      className={`flex items-center cursor-pointer text-sm py-3 px-4 ${
        active
          ? "text-white font-medium border-b-2 border-white"
          : "text-white/70 hover:text-white"
      }`}
      onClick={onClick}
    >
      {children}
    </li>
  );
};

export default TabItem;