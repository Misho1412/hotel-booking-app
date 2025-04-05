"use client";

import React from "react";
import Nav from "@/shared/Nav";
import NavItem from "@/shared/NavItem";
import useTranslation from "@/hooks/useTranslation";
import { usePathname } from "next/navigation";

// Available cities (English labels)
const CITIES = ["All", "Makkah", "Madinah"];

interface CityTabsProps {
  tabActive?: string;
  onTabChange?: (tab: string) => void;
}

const CityTabs: React.FC<CityTabsProps> = ({
  tabActive = "All",
  onTabChange,
}) => {
  const pathname = usePathname();
  const isArabic = pathname?.startsWith('/ar');
  const t = useTranslation('stay-listing');

  const handleTabChange = (item: string) => {
    if (onTabChange) {
      onTabChange(item);
    }
  };

  // Get translated city names
  const getTranslatedCityName = (city: string): string => {
    if (!isArabic) return city;
    
    switch(city.toLowerCase()) {
      case 'all':
        return t('cityTabs.all');
      case 'makkah':
        return t('cityTabs.makkah');
      case 'madinah':
        return t('cityTabs.madinah');
      default:
        return city;
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
            {getTranslatedCityName(item)}
          </NavItem>
        ))}
      </Nav>
    </div>
  );
};

export default CityTabs; 