"use client";

import React, { FC } from "react";
import NavigationItem from "./NavigationItem";
import { NAVIGATION_DEMO } from "@/data/navigation";

interface NavigationProps {
  className?: string;
}

const Navigation: FC<NavigationProps> = ({ className = "" }) => {
  return (
    <nav className={`nc-Navigation ${className}`}>
      <ul className="flex items-center space-x-8 lg:space-x-10">
        {NAVIGATION_DEMO.map((item) => (
          <li key={item.id} className="menu-item">
            <NavigationItem menuItem={item} />
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default Navigation;
