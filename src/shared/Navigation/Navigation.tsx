"use client";

import React, { FC } from "react";
import NavigationItem from "./NavigationItem";
import { NAVIGATION_DEMO } from "@/data/navigation";

interface NavigationProps {
  className?: string;
}

const Navigation: FC<NavigationProps> = ({ className = "" }) => {
  return (
    <ul className={`nc-Navigation hidden lg:flex lg:flex-wrap lg:space-x-1 relative ${className}`}>
      {NAVIGATION_DEMO.map((item) => (
        <NavigationItem key={item.id} menuItem={item} />
      ))}
    </ul>
  );
}

export default Navigation;
