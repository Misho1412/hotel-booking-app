'use client';

import React, { FC, useState, useEffect } from "react";
import { TaxonomyType } from "@/data/types";
import CardCategory3 from "@/components/CardCategory3";
import CardCategory4 from "@/components/CardCategory4";
import CardCategory5 from "@/components/CardCategory5";
import Heading from "@/shared/Heading";
import { InfiniteSlider } from "@/components/ui/infinite-slider";
import useTranslation from "@/hooks/useTranslation";

export interface SectionSliderNewCategoriesProps {
  className?: string;
  itemClassName?: string;
  heading?: string;
  subHeading?: string;
  categories?: TaxonomyType[];
  categoryCardType?: "card3" | "card4" | "card5";
  itemPerRow?: 4 | 5;
  sliderStyle?: "style1" | "style2";
  useTranslation?: boolean;
  translationNamespace?: string;
}

const DEMO_CATS: TaxonomyType[] = [
  {
    id: "1",
    href: "/listing-stay-map",
    name: "Nature House",
    taxonomy: "category",
    count: 17288,
    thumbnail:
      "https://images.pexels.com/photos/2581922/pexels-photo-2581922.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260",
  },
  {
    id: "2",
    href: "/listing-stay-map",
    name: "Wooden house",
    taxonomy: "category",
    count: 2118,
    thumbnail:
      "https://images.pexels.com/photos/2351649/pexels-photo-2351649.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
  },
  {
    id: "3",
    href: "/listing-stay-map",
    name: "Houseboat",
    taxonomy: "category",
    count: 36612,
    thumbnail:
      "https://images.pexels.com/photos/962464/pexels-photo-962464.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
  },
  {
    id: "4",
    href: "/listing-stay-map",
    name: "Farm House",
    taxonomy: "category",
    count: 18188,
    thumbnail:
      "https://images.pexels.com/photos/248837/pexels-photo-248837.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
  },
  {
    id: "5",
    href: "/listing-stay-map",
    name: "Dome House",
    taxonomy: "category",
    count: 22288,
    thumbnail:
      "https://images.pexels.com/photos/3613236/pexels-photo-3613236.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
  },
  {
    id: "6",
    href: "/listing-stay-map",
    name: "Dome House",
    taxonomy: "category",
    count: 188288,
    thumbnail:
      "https://images.pexels.com/photos/14534337/pexels-photo-14534337.jpeg?auto=compress&cs=tinysrgb&w=1600&lazy=load",
  },
];

const SectionSliderNewCategoriesUpdated: FC<SectionSliderNewCategoriesProps> = ({
  heading = "Suggestions for discovery",
  subHeading = "Popular places to recommends for you",
  className = "",
  itemClassName = "",
  categories = DEMO_CATS,
  categoryCardType = "card3",
  sliderStyle = "style1",
  useTranslation: enableTranslation = false,
  translationNamespace = 'home'
}) => {
  const [mounted, setMounted] = useState(false);
  const t = useTranslation(translationNamespace);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const getTranslatedHeading = () => {
    if (!mounted || !enableTranslation) return heading;
    
    if (heading === "Suggestions for discovery" && translationNamespace === 'home') {
      return t('suggestions.title');
    }
    
    return heading;
  };
  
  const getTranslatedSubHeading = () => {
    if (!mounted || !enableTranslation) return subHeading;
    
    if (subHeading && heading === "Suggestions for discovery" && translationNamespace === 'home') {
      return t('suggestions.subtitle');
    }
    
    return subHeading;
  };
  
  const renderCard = (item: TaxonomyType) => {
    // Setup property translations for "Suggestions for discovery" section items
    let translatedItem = { ...item };
    
    if (mounted && enableTranslation && translationNamespace === 'home') {
      // Map the item names to their translation keys
      if (item.name === "Enjoy the great cold") {
        translatedItem.name = t('suggestions.propertyTypes.enjoyGreatCold');
      } else if (item.name === "Sleep in a floating way") {
        translatedItem.name = t('suggestions.propertyTypes.sleepFloatingWay');
      } else if (item.name === "In the billionaire's house") {
        translatedItem.name = t('suggestions.propertyTypes.billionairesHouse');
      } else if (item.name === "Cool in the deep forest") {
        translatedItem.name = t('suggestions.propertyTypes.coolDeepForest');
      }
    }
    
    switch (categoryCardType) {
      case "card3":
        return <CardCategory3 taxonomy={translatedItem} />;
      case "card4":
        return <CardCategory4 taxonomy={translatedItem} />;
      case "card5":
        return <CardCategory5 taxonomy={translatedItem} />;
      default:
        return <CardCategory3 taxonomy={translatedItem} />;
    }
  };

  return (
    <div className={`nc-SectionSliderNewCategories ${className}`}>
      <Heading desc={getTranslatedSubHeading()} isCenter={sliderStyle === "style2"}>
        {getTranslatedHeading()}
      </Heading>
      <InfiniteSlider
        gap={24}
        duration={30}
        durationOnHover={75}
        className="py-4"
      >
        {categories.map((item, index) => (
          <div key={index} className={`inline-block ${itemClassName}`}>
            {renderCard(item)}
          </div>
        ))}
      </InfiniteSlider>
    </div>
  );
};

export default SectionSliderNewCategoriesUpdated;
