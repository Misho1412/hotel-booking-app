"use client";

import React, { FC, useState } from "react";
import StaySearchForm from "./(stay-search-form)/StaySearchForm";
import useTranslation from "@/hooks/useTranslation";
import TabItem from "./TabItem";

export interface HeroSearchFormProps {
  className?: string;
}

export const HeroSearchForm: FC<HeroSearchFormProps> = ({ className = "" }) => {
  const t = useTranslation('tabs');
  const [tabActive, setTabActive] = useState<"Stays" | "Experiences" | "Cars" | "Flights">("Stays");

  const tabs: {
    id: "Stays" | "Experiences" | "Cars" | "Flights";
    name: string;
  }[] = [
    { id: "Stays", name: t("stays") || "Stays" },
  ];

  const renderTab = () => {
    return (
      <ul className="mt-3 ml-5 mb-1 flex space-x-8">
        {tabs.map((tab) => {
          const active = tab.id === tabActive;
          return (
            <TabItem
              key={tab.id}
              active={active}
              onClick={() => {
                setTabActive(tab.id);
              }}
            >
              {tab.name}
            </TabItem>
          );
        })}
      </ul>
    );
  };

  const renderForm = () => {
    switch (tabActive) {
      case "Stays":
        return <StaySearchForm />;
      default:
        return <StaySearchForm />;
    }
  };

  return (
    <div
      className={`nc-HeroSearchForm w-full max-w-[2200px] top-[10px] h-[100px] bg-[#1e1e1e] rounded-[15px] ${className}`}
      data-nc-id="HeroSearchForm"
    >
      {renderTab()}
      {renderForm()}
    </div>
  );
};

export default HeroSearchForm;
