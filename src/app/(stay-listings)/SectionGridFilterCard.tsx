"use client";

import React, { FC, useState, useEffect, useCallback } from "react";
import { StayDataType } from "@/data/types";
import Pagination from "@/shared/Pagination";
import Heading2 from "@/shared/Heading2";
import StayCard2 from "@/components/StayCard2";
import useHotels from "@/hooks/useHotels";
import Spinner from "@/shared/Spinner";
import Alert from "@/shared/Alert";
import ButtonPrimary from "@/shared/ButtonPrimary";
import CityTabs from "./components/CityTabs";
import useTranslation from "@/hooks/useTranslation";
import { usePathname } from "next/navigation";
import HotelChainFilter from "@/components/filters/HotelChainFilter";
import UserReservations from "@/components/UserReservations";

export interface SectionGridFilterCardProps {
  className?: string;
}

const SectionGridFilterCard: FC<SectionGridFilterCardProps> = ({
  className = "",
}) => {
  const [activeCity, setActiveCity] = useState<string>("All");
  const [selectedChainId, setSelectedChainId] = useState<string | null>(null);
  const [shouldFetch, setShouldFetch] = useState<{
    city?: string, 
    hotelChain?: string | null, 
    isInitial: boolean
  }>({
    isInitial: true
  });
  
  const pathname = usePathname();
  const isArabic = pathname?.startsWith('/ar');
  const t = useTranslation('stay-listing');
  
  const {
    isLoading,
    error,
    stayData,
    pagination,
    fetchHotels,
    goToPage
  } = useHotels({
    // Don't auto-fetch - we'll control this manually
    autoFetch: false
  });

  // Initial fetch on mount and when filters change
  useEffect(() => {
    const params: any = { page: 1, page_size: 8 };
    
    // Only add city filter if it's not "All"
    if (shouldFetch.city && shouldFetch.city !== "All") {
      params.city = shouldFetch.city;
    }
    
    // Add hotel chain filter if selected
    if (shouldFetch.hotelChain) {
      params.hotel_chain = shouldFetch.hotelChain;
    }
    
    console.log("Fetching hotels with params:", params);
    fetchHotels(params);
    
  }, [fetchHotels, shouldFetch]);

  // Handle tab change
  const handleTabChange = useCallback((tab: string) => {
    console.log("Tab changed to:", tab);
    setActiveCity(tab);
    
    // Don't trigger fetch directly from here
    setShouldFetch(prev => ({
      ...prev,
      city: tab,
      isInitial: false
    }));
  }, []);
  
  // Handle hotel chain selection
  const handleChainSelection = useCallback((chainId: string | null) => {
    console.log("Chain selection changed to:", chainId);
    setSelectedChainId(chainId);
    
    setShouldFetch(prev => ({
      ...prev,
      hotelChain: chainId,
      isInitial: false
    }));
  }, []);
  
  // Handle retry
  const handleRetry = useCallback(() => {
    setShouldFetch(prev => ({...prev, isInitial: false}));
  }, []);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    const params: any = { page, page_size: 8 };
    
    if (activeCity !== "All") {
      params.city = activeCity;
    }
    
    if (selectedChainId) {
      params.hotel_chain = selectedChainId;
    }
    
    fetchHotels(params);
  }, [activeCity, selectedChainId, fetchHotels]);

  return (
    <div
      className={`nc-SectionGridFilterCard ${className}`}
      data-nc-id="SectionGridFilterCard"
    >
      <Heading2 />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8 lg:mb-11">
        <div className="lg:col-span-3">
          <CityTabs tabActive={activeCity} onTabChange={handleTabChange} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* FILTERS SIDEBAR */}
        <div className="lg:col-span-1 space-y-8">
          {/* Hotel Chain Filter */}
          <div className="border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden">
            <div className="p-4 bg-neutral-50 dark:bg-neutral-800">
              <HotelChainFilter 
                selectedChainId={selectedChainId}
                onSelectChain={handleChainSelection}
              />
            </div>
          </div>
          
          {/* User Reservations */}
          <div className="border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden">
            <div className="p-4 bg-neutral-50 dark:bg-neutral-800">
              <UserReservations />
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="lg:col-span-3">
          {/* LOADING STATE */}
          {isLoading && (
            <div className="flex items-center justify-center py-10">
              <Spinner className="h-10 w-10" />
              <span className="ml-4 text-lg">{t('loading')}</span>
            </div>
          )}

          {/* ERROR STATE */}
          {error && !isLoading && (
            <Alert type="error" className="mb-8">
              <div>
                <p className="font-medium">
                  {error.message && error.message.includes('Network error') 
                    ? t('error.network')
                    : `${t('error.title')} ${error.message}`
                  }
                </p>
                <p className="mt-2">
                  {error.message && error.message.includes('Network error')
                    ? t('error.networkMessage')
                    : t('error.message')
                  }
                </p>
                <button 
                  className="underline mt-2 font-medium" 
                  onClick={handleRetry}
                >
                  {t('error.retry')}
                </button>
              </div>
            </Alert>
          )}

          {/* EMPTY STATE */}
          {!isLoading && !error && stayData.length === 0 && (
            <div className="text-center py-10">
              <h3 className="text-lg font-medium mb-4">{t('empty.title')}</h3>
              <p className="mb-4 text-neutral-500">
                {t('empty.message')}
              </p>
              {activeCity !== "All" && (
                <ButtonPrimary onClick={() => handleTabChange("All")}>
                  {t('empty.viewAll')}
                </ButtonPrimary>
              )}
            </div>
          )}

          {/* RESULTS INFO */}
          {!isLoading && !error && stayData.length > 0 && (
            <div className="mb-4 text-neutral-500">
              <span>{t('filters.found', { count: pagination.count || 0 })}</span>
              {activeCity !== "All" && <span> {t('filters.inCity', { city: activeCity })}</span>}
              {selectedChainId && <span> ({selectedChainId})</span>}
            </div>
          )}

          {/* HOTELS GRID */}
          {!isLoading && !error && stayData.length > 0 && (
            <>
              <div className="grid grid-cols-1 gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {stayData.map((stay) => (
                  <StayCard2 key={stay.id} data={stay} />
                ))}
              </div>
              
              {/* PAGINATION */}
              {pagination.totalPages > 1 && (
                <div className="flex mt-16 justify-center items-center">
                  <nav className="inline-flex space-x-1">
                    {/* Previous button */}
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage <= 1}
                      className={`flex h-9 w-9 items-center justify-center rounded-full ${
                        pagination.currentPage <= 1
                          ? "cursor-not-allowed text-neutral-400"
                          : "text-neutral-700 hover:bg-neutral-100"
                      }`}
                    >
                      <i className={`las ${isArabic ? 'la-angle-right' : 'la-angle-left'}`}></i>
                    </button>
                    
                    {/* Page numbers */}
                    {Array.from({ length: pagination.totalPages }, (_, i) => (
                      <button
                        key={i+1}
                        onClick={() => handlePageChange(i+1)}
                        className={`flex h-9 w-9 items-center justify-center rounded-full ${
                          i+1 === pagination.currentPage
                            ? "bg-primary-500 text-white"
                            : "text-neutral-700 hover:bg-neutral-100"
                        }`}
                      >
                        {i+1}
                      </button>
                    ))}
                    
                    {/* Next button */}
                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage >= pagination.totalPages}
                      className={`flex h-9 w-9 items-center justify-center rounded-full ${
                        pagination.currentPage >= pagination.totalPages
                          ? "cursor-not-allowed text-neutral-400"
                          : "text-neutral-700 hover:bg-neutral-100"
                      }`}
                    >
                      <i className={`las ${isArabic ? 'la-angle-left' : 'la-angle-right'}`}></i>
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SectionGridFilterCard;
