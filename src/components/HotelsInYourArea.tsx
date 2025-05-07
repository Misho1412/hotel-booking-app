"use client";

import React, { useState, useEffect } from "react";
import { StayDataType } from "@/data/types";
import useTranslation from "@/hooks/useTranslation";
import { usePathname } from "next/navigation";
import Image from "next/image";
import BtnLikeIcon from "@/components/BtnLikeIcon";
import Link from "next/link";
import { useFeaturedHotels } from "@/hooks/useFeaturedHotels";
import Spinner from "@/shared/Spinner";
import Heading2 from "@/shared/Heading2";
import { PinContainer } from "@/components/ui/3d-pin";

// Import necessary icons
import LocationIcon from "@/components/icons/LocationIcon";
import BedIcon from "@/components/icons/BedIcon";
import SquareIcon from "@/components/icons/SquareIcon";
import { StarIcon, ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/solid";

export interface HotelsInYourAreaProps {
  className?: string;
  limit?: number;
}

const HotelsInYourArea: React.FC<HotelsInYourAreaProps> = ({
  className = "",
  limit = 5,
}) => {
  const pathname = usePathname();
  const isArabic = pathname?.startsWith('/ar');
  const t = useTranslation('home');
  const [activeIndex, setActiveIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Fetch hotels data
  const { hotels, isLoading, error } = useFeaturedHotels(limit);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePrevious = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : hotels.length - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev < hotels.length - 1 ? prev + 1 : 0));
  };

  // Create visible hotel array based on the activeIndex
  const visibleHotels = hotels.length > 0 
    ? [...hotels.slice(activeIndex), ...hotels.slice(0, activeIndex)].slice(0, 4) 
    : [];

  // Function to render a hotel card with 3D pin effect
  const renderHotelPin = (hotel: StayDataType, index: number) => {
    // Extract data
    const { 
      title, 
      price, 
      bedrooms, 
      href, 
      reviewStart, 
      reviewCount,
      galleryImgs,
      like,
      address
    } = hotel;

    // Calculate sqm from a random base (this is mock data)
    const sqm = (parseInt(hotel.id as string) % 10) * 21 + 200;
    
    // Title for the pin
    const pinTitle = isArabic ? "عرض العقار" : "View Property";

    return (
      <div 
        key={hotel.id} 
        className="flex justify-center items-center h-[30rem]"
        data-aos="fade-up"
        data-aos-delay={index * 100}
        data-aos-duration="800"
      >
        <PinContainer
          title={pinTitle}
          href={href}
          containerClassName={`group/hotel-${index} transition-transform duration-300 pin-container`}
        >
          <div className="flex flex-col p-4 tracking-tight text-slate-100/90 w-[20rem] h-[20rem] rounded-2xl overflow-hidden relative shadow-xl transition-all duration-300 group-hover/hotel-${index}:shadow-amber-400/30">
            {/* Background Image */}
            <div 
              className="absolute inset-0 z-0 rounded-2xl bg-cover bg-center bg-no-repeat" 
              style={{
                backgroundImage: `url("${galleryImgs[0]}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              {/* Dark overlay */}
              <div className="absolute inset-0 bg-black/30 rounded-2xl border-2 border-amber-400 shadow-lg shadow-amber-400/20"></div>
            </div>
            
            {/* Content overlay */}
            <div className="relative z-10 flex flex-col h-full backdrop-blur-[2px]">
              {/* Header with rating */}
              <div className="flex items-center gap-2 bg-black/40 px-3 py-2 rounded-lg self-start border-r-2 border-amber-500">
                <StarIcon className="h-3.5 w-3.5 text-yellow-400" />
                <span className="text-xs text-amber-100">{reviewStart?.toFixed(1) || "4.9"} ({reviewCount || "28"} {t('featuredPlaces.reviews')})</span>
              </div>

              {/* Content */}
              <div className="flex-1 mt-4 space-y-4">
                <div className="text-2xl font-bold text-amber-100 drop-shadow-md">
                  {title}
                </div>
                
                {/* Location */}
                <div className="flex items-center text-sm text-amber-100/90">
                  <LocationIcon className="h-4 w-4 mr-1 text-amber-400" />
                  <span>{address}</span>
                </div>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 bg-black/30 rounded-lg p-2 border border-amber-500/30">
                    <div className="text-xl font-bold text-amber-400">{bedrooms}</div>
                    <div className="text-xs text-slate-200">
                      {bedrooms > 1 ? t('featuredPlaces.bedrooms') : t('featuredPlaces.bedroom')}
                    </div>
                  </div>
                  <div className="space-y-1 bg-black/30 rounded-lg p-2 border border-amber-500/30">
                    <div className="text-xl font-bold text-amber-400">{sqm}m²</div>
                    <div className="text-xs text-slate-200">
                      {t('featuredPlaces.area')}
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div className="mt-auto flex justify-between items-end">
                  <div className="text-2xl font-bold text-white">{price}</div>
                  <div className="text-amber-300 font-medium bg-black/30 px-3 py-1 rounded-lg hover:bg-amber-500/20 transition-colors">
                    {t('featuredPlaces.view')} →
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PinContainer>
      </div>
    );
  };

  // Content to render based on loading/error state
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center min-h-[300px]">
          <Spinner />
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center text-red-500">
          Error loading hotels: {String(error)}
        </div>
      );
    }

    return (
      <>
        {/* Navigation Controls */}
        <div className="flex justify-between items-center mb-10">
          <button 
            onClick={handlePrevious}
            className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
            aria-label="Previous"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          
          {/* Small Switcher Dots */}
          <div className="flex items-center space-x-2">
            {hotels.slice(0, 5).map((_, i) => (
              <div 
                key={i}
                className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  i === activeIndex ? 'w-10 bg-amber-500' : 'w-5 bg-neutral-300 hover:bg-neutral-400 dark:bg-neutral-700 dark:hover:bg-neutral-600'
                }`}
                onClick={() => i < hotels.length && setActiveIndex(i)}
              />
            ))}
          </div>
          
          <button 
            onClick={handleNext}
            className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
            aria-label="Next"
          >
            <ArrowRightIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Hotel Cards with 3D Pin Effect */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {visibleHotels.slice(0, 2).map((hotel, index) => 
            renderHotelPin(hotel, index)
          )}
        </div>
        
        {/* View all button */}
        <div className="flex justify-center mt-16">
          <Link 
            href="/listing-stay" 
            className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-full transition-colors font-medium tracking-wide shadow-lg hover:shadow-xl"
          >
            {t('featuredPlaces.viewAll')}
          </Link>
        </div>
      </>
    );
  };

  return (
    <div className={`hotels-in-your-area relative ${className} bg-gradient-to-b from-white via-white dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-800 pt-14 pb-20`}>
      {/* Top SVG Background - moved outside the container for full width and positioned at absolute top */}
      <div className="absolute left-1/2 -top-[70px] transform -translate-x-1/2 w-full max-w-[1100px] z-0">
  <svg 
    width="90%" 
    height="60" 
    viewBox="0 0 1057 49" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    preserveAspectRatio="none"
  >
    <path 
      fillRule="evenodd" 
      clipRule="evenodd" 
      d="M300.479 49L0.00012207 49C58.1508 48.9999 77.617 35.167 95.8637 22.2007C111.959 10.7632 127.105 -2.67026e-05 167.017 -2.67026e-05L300.479 -3.4332e-05L889.983 -3.43322e-05C929.895 -3.43322e-05 945.041 10.7632 961.136 22.2007C979.383 35.167 998.849 48.9999 1057 49L756.521 49L300.479 49Z" 
      fill="#FFFFFF" // Changed to full white
      fillOpacity="1" // Changed to fully opaque
    />
  </svg>
</div>
      
      <div className="container -top-[10px] mx-auto px-4 py-12 relative z-10">
        {/* Section Title with - positioned within the container */}
        <div className="relative mb-16 mt-2">
          {/* Section Title Content - no need for SVG positioning here anymore */}
          <div className="relative z-10 px-4 pt-6 pb-4">
            <div className="text-center mb-2">
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white">
                {t('featuredPlaces.title') || "Hotels in your area"}
              </h2>
            </div>
          </div>
        </div>

        {/* Conditionally render content based on loading/error state */}
        {renderContent()}
        
      </div>

      {/* Custom styling for the 3D animation */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        .hotels-in-your-area .pin-container:hover {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default HotelsInYourArea; 