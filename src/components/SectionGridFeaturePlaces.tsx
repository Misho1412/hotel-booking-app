"use client";

import React, { FC, ReactNode, useState, useEffect } from "react";
import { DEMO_STAY_LISTINGS } from "@/data/listings";
import { StayDataType } from "@/data/types";
import ButtonPrimary from "@/shared/ButtonPrimary";
import HeaderFilter from "./HeaderFilter";
import StayCard from "./StayCard";
import StayCard2 from "./StayCard2";
import useTranslation from "@/hooks/useTranslation";

// OTHER DEMO WILL PASS PROPS
const DEMO_DATA: StayDataType[] = DEMO_STAY_LISTINGS.filter((_, i) => i < 8);

//
export interface SectionGridFeaturePlacesProps {
  stayListings?: StayDataType[];
  gridClass?: string;
  heading?: ReactNode;
  subHeading?: ReactNode;
  headingIsCenter?: boolean;
  tabs?: string[];
  cardType?: "card1" | "card2";
}

const SectionGridFeaturePlaces: FC<SectionGridFeaturePlacesProps> = ({
  stayListings = DEMO_DATA,
  gridClass = "",
  heading,
  subHeading,
  headingIsCenter,
  tabs,
  cardType = "card2",
}) => {
  const [mounted, setMounted] = useState(false);
  const t = useTranslation('home');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Default values with translations
  const translatedHeading = heading || t('featuredPlaces.title');
  const translatedSubHeading = subHeading || t('featuredPlaces.subtitle');
  const translatedTabs = tabs || [
    t('featuredPlaces.cities.newYork'), 
    t('featuredPlaces.cities.tokyo'), 
    t('featuredPlaces.cities.paris'), 
    t('featuredPlaces.cities.london')
  ];

  const renderCard = (stay: StayDataType, index: number) => {
    let CardName = StayCard;
    switch (cardType) {
      case "card1":
        CardName = StayCard;
        break;
      case "card2":
        CardName = StayCard2;
        break;

      default:
        CardName = StayCard;
    }

    return (
      <div 
        key={stay.id}
        data-aos="fade-up"
        data-aos-delay={200 + index * 100}
        data-aos-duration="800"
      >
        <CardName data={stay} />
      </div>
    );
  };

  return (
    <div 
      className="nc-SectionGridFeaturePlaces relative"
      data-aos="fade-up"
      data-aos-duration="1000"
    >
      <HeaderFilter
        tabActive={translatedTabs[0]}
        subHeading={translatedSubHeading}
        tabs={translatedTabs}
        heading={translatedHeading}
      />
      <div
        className={`grid gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${gridClass}`}
      >
        {stayListings.map((stay, index) => renderCard(stay, index))}
      </div>
      <div 
        className="flex mt-16 justify-center items-center"
        data-aos="zoom-in"
        data-aos-delay="400"
      >
        <ButtonPrimary loading>{t('featured.viewAll')}</ButtonPrimary>
      </div>
    </div>
  );
};

export default SectionGridFeaturePlaces;
