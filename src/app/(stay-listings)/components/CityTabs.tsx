"use client";

import React from "react";
import Nav from "@/shared/Nav";
import NavItem from "@/shared/NavItem";

// Available cities
const CITIES = ["All", "New York", "Tokyo", "Paris", "London", "Dubai", "Sydney", "Singapore"];

interface CityTabsProps {
  tabActive?: string;
  onTabChange?: (tab: string) => void;
}

const CityTabs: React.FC<CityTabsProps> = ({
  tabActive = "All",
  onTabChange,
}) => {
  const handleTabChange = (item: string) => {
    if (onTabChange) {
      onTabChange(item);
    }
  };

  return (
    <div className="mb-8">
      <Nav
        className="sm:space-x-2"
        containerClassName="relative flex w-full overflow-x-auto text-sm md:text-base hiddenScrollbar"
      >
        {CITIES.map((item, index) => (
          <NavItem
            key={index}
            isActive={tabActive === item}
            onClick={() => handleTabChange(item)}
          >
            {item}
          </NavItem>
        ))}
      </Nav>
    </div>
  );
};

export default CityTabs; 