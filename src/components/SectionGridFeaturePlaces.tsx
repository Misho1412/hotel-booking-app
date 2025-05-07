"use client";

import React, { FC, ReactNode, useState, useEffect, useCallback, useMemo } from "react";
import { StayDataType } from "@/data/types";
import ButtonPrimary from "@/shared/ButtonPrimary";
import HeaderFilter from "./HeaderFilter";
import Spinner from "@/shared/Spinner";
import useTranslation from "@/hooks/useTranslation";
import LocalizedStayCard from "./LocalizedStayCard";
import LocalizedStayCard2 from "./LocalizedStayCard2";
import { useParams } from "next/navigation";
import { useFeaturedHotels } from "@/hooks/useFeaturedHotels";
import Alert from "@/shared/Alert";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import ButtonSecondary from "@/shared/ButtonSecondary";
import Button from "@/shared/Button";

//
export interface SectionGridFeaturePlacesProps {
  stayListings?: StayDataType[];
  gridClass?: string;
  heading?: ReactNode;
  subHeading?: ReactNode;
  headingIsCenter?: boolean;
  tabs?: string[];
  cardType?: "card1" | "card2";
  limit?: number;
}

const SectionGridFeaturePlaces: FC<SectionGridFeaturePlacesProps> = ({
  stayListings,
  gridClass = "",
  heading,
  subHeading,
  headingIsCenter,
  tabs,
  cardType = "card2",
  limit = 8,
}) => {
  const [mounted, setMounted] = useState(false);
  const [activeCity, setActiveCity] = useState<string>("all");
  const [visibleCount, setVisibleCount] = useState(4); // Initial visible cards
  const t = useTranslation('home');
  const params = useParams();
  const locale = params?.locale as string;
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Use our custom hook to fetch hotels from backend
  const { hotels, isLoading, error, refetch } = useFeaturedHotels(limit, activeCity);

  // Console log the hotels for debugging
  useEffect(() => {
    if (hotels.length > 0) {
      console.log(`Received ${hotels.length} hotels from hook`);
    }
  }, [hotels.length]);

  // Set mounted state once
  useEffect(() => {
    setMounted(true);
  }, []);

  // Gradually show more cards as they load
  useEffect(() => {
    // Only run this effect when there are hotels and we're not loading
    if (hotels.length > 0 && !isLoading && mounted) {
      const newCount = Math.min(hotels.length, limit);
      console.log(`Setting visible count to ${newCount}`);
      setVisibleCount(newCount);
    }
  }, [hotels.length, isLoading, limit, mounted]);

  // Reset visible count when changing city filter
  useEffect(() => {
    setVisibleCount(4);
  }, [activeCity]);

  // Default values with translations
  const translatedHeading = useMemo(() => 
    typeof heading === 'string' ? heading : (mounted ? t('featuredPlaces.title') : "Hotels in your area")
  , [heading, mounted, t]);
  

  
  const translatedTabs = useMemo(() => tabs || [
    "All",
    mounted ? t('featuredPlaces.destinations.makkah.name') : "Makkah", 
    mounted ? t('featuredPlaces.destinations.madina.name') : "Madinah"
  ], [tabs, mounted, t]);
  
  // Convert ReactNode heading and subHeading to strings for HeaderFilter
  const headingString = useMemo(() => 
    typeof translatedHeading === 'string' ? translatedHeading : "Hotels in your area"
  , [translatedHeading]);


  // Handle tab change to filter by city
  const handleTabChange = useCallback((tab: string) => {
    console.log(`Tab changed to: ${tab}`);
    if (tab === translatedTabs[0]) {
      setActiveCity("all");
    } else if (tab === translatedTabs[1]) {
      setActiveCity("Makkah");
    } else if (tab === translatedTabs[2]) {
      setActiveCity("Madinah");
    }
  }, [translatedTabs]);

  // Use provided listings or fetched hotels
  const displayedListings = useMemo(() => {
    // Always prioritize backend hotels unless explicitly provided with stayListings
    const result = stayListings && stayListings.length > 0 ? stayListings : hotels;
    console.log(`Using ${result.length} listings for display (${hotels.length} from backend)`);
    
    // Log the first hotel for debugging if available
    if (result.length > 0) {
      console.log('First hotel title:', result[0].title);
      console.log('First hotel image:', result[0].featuredImage);
    }
    
    return result;
  }, [stayListings, hotels]);
  
  // Memoize visible listings to prevent unnecessary re-renders
  const visibleListings = useMemo(() => {
    return displayedListings.slice(0, visibleCount);
  }, [displayedListings, visibleCount]);

  // Handle showing more items
  const handleShowMore = useCallback(() => {
    setVisibleCount(prev => Math.min(prev + 4, displayedListings.length));
  }, [displayedListings.length]);

  const renderCard = useCallback((stay: StayDataType, index: number) => {
    // Use the appropriate localized card based on cardType
    return (
      <div 
        key={stay.id}
        data-aos="fade-up"
        data-aos-delay={200 + (index % 4) * 100} // Keep delay reasonable by using modulo
        data-aos-duration="800"
      >
        {cardType === "card1" ? (
          <LocalizedStayCard data={stay} locale={locale} />
        ) : (
          <LocalizedStayCard2 data={stay} locale={locale} />
        )}
      </div>
    );
  }, [cardType, locale]);

  // Memoized empty state
  const emptyState = useMemo(() => {
    if (isLoading) return null;
    
    return (
      <div className="mt-16 text-center">
        <div className="text-2xl font-semibold">No hotels found from backend</div>
        <div className="text-neutral-500 mt-2">We couldn't find any featured stays for this location.</div>
        <div className="mt-8">
          <Button onClick={() => refetch()} disabled={isLoading}>
            Retry Fetching Hotels
          </Button>
          {activeCity && (
            <span className="ml-3">
              <ButtonSecondary onClick={() => router.push(`/listing-stay?city=${activeCity}`)}>
                View All {activeCity} Hotels
              </ButtonSecondary>
            </span>
          )}
        </div>
      </div>
    );
  }, [isLoading, refetch, activeCity, router]);
  
  // Memoized error message
  const errorMessage = useMemo(() => {
    if (!error) return null;
    
    return (
      <div className="mt-16 text-center">
        <div className="text-2xl font-semibold">Error loading hotels</div>
        <div className="text-neutral-500 mt-2">{String(error)}</div>
        <div className="mt-8">
          <Button onClick={() => refetch()} disabled={isLoading}>
            Retry Fetching Hotels
          </Button>
        </div>
      </div>
    );
  }, [error, isLoading, refetch]);

  return (
    <div 
      className="nc-SectionGridFeaturePlaces relative"
      data-aos="fade-up"
      data-aos-duration="1000"
    >
      <HeaderFilter
        tabActive={activeCity === 'all' ? translatedTabs[0] : 
                  activeCity === 'Makkah' ? translatedTabs[1] :
                  activeCity === 'Madinah' ? translatedTabs[2] : translatedTabs[0]}
        tabs={translatedTabs}
        heading={headingString}
        onTabChange={handleTabChange}
      />
      
      {errorMessage}

      {(isLoading || authLoading) ? (
        <div className="flex flex-col justify-center items-center min-h-[300px]">
          <Spinner className="h-10 w-10" />
          <p className="mt-3 text-gray-500">Loading hotels...</p>
        </div>
      ) : displayedListings.length > 0 ? (
        <>
          <div
            className={`grid gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${gridClass}`}
          >
            {visibleListings.map((stay, index) => renderCard(stay, index))}
          </div>
          
          {visibleCount < displayedListings.length && (
            <div className="flex justify-center mt-8">
              <ButtonPrimary onClick={handleShowMore}>
                Show More
              </ButtonPrimary>
            </div>
          )}
        </>
      ) : emptyState}
      
      {displayedListings.length > 0 && visibleCount >= displayedListings.length && (
        <div 
          className="flex mt-16 justify-center items-center"
          data-aos="zoom-in"
          data-aos-delay="400"
        >
          <ButtonPrimary href="/listing-stay" loading={isLoading}>
            View All
          </ButtonPrimary>
        </div>
      )}
    </div>
  );
};

export default SectionGridFeaturePlaces;
