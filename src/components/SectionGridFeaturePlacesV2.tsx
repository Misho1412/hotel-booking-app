"use client";

import React, { FC, ReactNode, useState, useEffect, useCallback, useMemo } from "react";
import { StayDataType } from "@/data/types";
import ButtonPrimary from "@/shared/ButtonPrimary";
import HeaderFilter from "./HeaderFilter";
import Spinner from "@/shared/Spinner";
import useTranslation from "@/hooks/useTranslation";
import { useParams } from "next/navigation";
import { useFeaturedHotels } from "@/hooks/useFeaturedHotels";
import Alert from "@/shared/Alert";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Button from "@/shared/Button";
import FeaturedHotelCard from "./FeaturedHotelCard";

//
export interface SectionGridFeaturePlacesV2Props {
  stayListings?: StayDataType[];
  gridClass?: string;
  heading?: ReactNode;
  subHeading?: ReactNode;
  headingIsCenter?: boolean;
  tabs?: string[];
  limit?: number;
}

const SectionGridFeaturePlacesV2: FC<SectionGridFeaturePlacesV2Props> = ({
  stayListings,
  gridClass = "",
  heading,
  subHeading,
  headingIsCenter,
  tabs,
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
    // Use our new card design
    return (
      <div 
        key={stay.id}
        data-aos="fade-up"
        data-aos-delay={200 + (index % 4) * 100} // Keep delay reasonable by using modulo
        data-aos-duration="800"
        className="[&_.card-container]:border-0" // Add this line

      >
        <FeaturedHotelCard data={stay} />
      </div>
    );
  }, []);

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
              <ButtonPrimary href={`/listing-stay?city=${activeCity}`}>
                View All {activeCity} Hotels
              </ButtonPrimary>
            </span>
          )}
        </div>
      </div>
    );
  }, [isLoading, refetch, activeCity]);
  
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
      className="nc-SectionGridFeaturePlacesV2 relative"
      data-aos="fade-up"
      data-aos-duration="1000"
    >
<div className="absolute top-[-71px] left-1/4 transform -translate-x-1/2 rotate-180 w-full max-w-[1012px] z-12312130 pointer-events-none">
  <svg 
   width="50%" 
   height="40%" 
   viewBox="0 0 1012 108" 
   fill="none" 
   xmlns="http://www.w3.org/2000/svg" 
   preserveAspectRatio="none"
  >
    <path 
      fillRule="evenodd" 
      clipRule="evenodd" 
      d="M448.195 9.82477e-06C671.116 -1.10291e-05 1044.73 -3.55688e-05 1009 3.8554e-05C953.621 0.000153433 935.083 30.4789 917.706 59.0483C902.378 84.2491 887.954 107.964 849.945 107.964L722.845 107.964L161.443 107.964C123.434 107.964 109.01 84.2491 93.6817 59.0483C76.3049 30.4789 57.7666 0.00016321 2.38801 4.83307e-05C-27.686 -1.40559e-05 232.223 -6.54995e-06 448.195 9.82477e-06Z" 
      fill="#FFFFFF" 
    />
  </svg>
</div>
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
            className={`grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 ${gridClass}`}>

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

export default SectionGridFeaturePlacesV2; 