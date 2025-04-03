"use client";

import React, { FC, useState, useEffect } from "react";
import StaySearchForm from "./(stay-search-form)/StaySearchForm";
import useTranslation from "@/hooks/useTranslation";

export type SearchTab = "Stays" ;

export interface HeroSearchFormProps {
  className?: string;
  currentTab?: SearchTab;
  currentPage?: "Stays" ;
}

const HeroSearchForm: FC<HeroSearchFormProps> = ({
  className = "",
  currentTab = "Stays",
  currentPage,
}) => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const tabs: SearchTab[] = ["Stays"];
  const [tabActive, setTabActive] = useState<SearchTab>(
    currentTab as SearchTab || "Stays"
  );

  // We need to use the specific tab namespace for translations
  const tabsTranslation = useTranslation('tabs');
  
  const getTranslatedTab = (tab: SearchTab): string => {
    if (!mounted) return tab;
    
    // Use try-catch to handle any errors with translations
    try {
      switch(tab) {
        case "Stays":
          return tabsTranslation('stays') || "Stays";
        default:
          return tab;
      }
    } catch (error) {
      console.error("Translation error:", error);
      return tab;
    }
  };

  const renderTab = () => {
    return (
      <ul className="ml-2 sm:ml-6 md:ml-12 flex space-x-5 sm:space-x-8 lg:space-x-11 overflow-x-auto hiddenScrollbar">
        {tabs.map((tab) => {
          const active = tab === tabActive;
          return (
            <li
              onClick={() => setTabActive(tab)}
              className={`flex-shrink-0 flex items-center cursor-pointer text-sm lg:text-base font-medium ${
                active
                  ? ""
                  : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-400"
              } `}
              key={tab}
            >
              {active && (
                <span className="block w-2.5 h-2.5 rounded-full bg-neutral-800 dark:bg-neutral-100 mr-2" />
              )}
              <span suppressHydrationWarning>{getTranslatedTab(tab)}</span>
            </li>
          );
        })}
      </ul>
    );
  };

  const renderForm = () => {
    return <StaySearchForm />;
  };

  return (
    <div
      className={`nc-HeroSearchForm w-full max-w-6xl py-5 lg:py-0 ${className}`}
    >
      {renderTab()}
      {renderForm()}
    </div>
  );
};

export default HeroSearchForm;
