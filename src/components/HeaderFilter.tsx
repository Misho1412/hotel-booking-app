"use client";

import React, { FC, useState, useEffect } from "react";
import Nav from "@/shared/Nav";
import NavItem from "@/shared/NavItem";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import ButtonSecondary from "@/shared/ButtonSecondary";
import { getLocalizedUrl } from "@/utils/getLocalizedUrl";
import { useParams } from "next/navigation";
import { Route } from "next";

export interface HeaderFilterProps {
  tabActive?: string;
  tabs?: string[];
  heading?: string;
  subHeading?: string;
  onTabChange?: (tab: string) => void;
}

const HeaderFilter: FC<HeaderFilterProps> = ({
  tabActive = "All",
  tabs = ["All", "New York", "Tokyo", "Paris", "London"],
  heading = "Hotels in your area",
  onTabChange,
}) => {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(tabActive);
  const params = useParams();
  const locale = params?.locale as string;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle tab change and pass to parent if callback is defined
  const handleTabChange = (item: string) => {
    setActiveTab(item);
    if (onTabChange) {
      onTabChange(item);
    }
  };

  return (
    <div className="flex flex-col mb-12 md:mb-16 relative">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between">
        <div className="max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-semibold">{heading}</h2>

        </div>
        <div className="mt-4 flex sm:justify-end">
          <ButtonSecondary href={getLocalizedUrl("/listing-stay", locale) as Route} className="!leading-none">
            <span>View all</span>
            <ChevronDownIcon className="w-4 h-4 ml-2 -rotate-90" />
          </ButtonSecondary>
        </div>
      </div>
      <div className="flex items-center justify-between mt-8">
        <Nav
          className="sm:space-x-2"
          containerClassName="relative flex w-full overflow-x-auto text-sm md:text-base hiddenScrollbar"
        >
          {tabs.map((item, index) => (
            <NavItem
              key={index}
              isActive={activeTab === item}
              onClick={() => handleTabChange(item)}
            >
              {item}
            </NavItem>
          ))}
        </Nav>
      </div>
    </div>
  );
};

export default HeaderFilter;
