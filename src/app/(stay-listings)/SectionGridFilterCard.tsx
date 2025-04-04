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

export interface SectionGridFilterCardProps {
  className?: string;
}

const SectionGridFilterCard: FC<SectionGridFilterCardProps> = ({
  className = "",
}) => {
  const [activeCity, setActiveCity] = useState<string>("All");
  const [shouldFetch, setShouldFetch] = useState<{city?: string, isInitial: boolean}>({
    isInitial: true
  });
  
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
    
    console.log("Fetching hotels with params:", params);
    fetchHotels(params);
    
  }, [fetchHotels, shouldFetch]);

  // Handle tab change
  const handleTabChange = useCallback((tab: string) => {
    console.log("Tab changed to:", tab);
    setActiveCity(tab);
    
    // Don't trigger fetch directly from here
    setShouldFetch({
      city: tab,
      isInitial: false
    });
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
    
    fetchHotels(params);
  }, [activeCity, fetchHotels]);

  return (
    <div
      className={`nc-SectionGridFilterCard ${className}`}
      data-nc-id="SectionGridFilterCard"
    >
      <Heading2 />

      <div className="mb-8 lg:mb-11">
        <CityTabs tabActive={activeCity} onTabChange={handleTabChange} />
      </div>

      {/* LOADING STATE */}
      {isLoading && (
        <div className="flex items-center justify-center py-10">
          <Spinner className="h-10 w-10" />
          <span className="ml-4 text-lg">Loading hotels...</span>
        </div>
      )}

      {/* ERROR STATE */}
      {error && !isLoading && (
        <Alert type="error" className="mb-8">
          <div>
            <p className="font-medium">Error loading hotels: {error.message}</p>
            <p className="mt-2">We couldn't load hotels from the backend. Please try again.</p>
            <button 
              className="underline mt-2 font-medium" 
              onClick={handleRetry}
            >
              Retry
            </button>
          </div>
        </Alert>
      )}

      {/* EMPTY STATE */}
      {!isLoading && !error && stayData.length === 0 && (
        <div className="text-center py-10">
          <h3 className="text-lg font-medium mb-4">No hotels found</h3>
          <p className="mb-4 text-neutral-500">
            We couldn't find any hotels matching your criteria.
          </p>
          {activeCity !== "All" && (
            <ButtonPrimary onClick={() => handleTabChange("All")}>
              View All Hotels
            </ButtonPrimary>
          )}
        </div>
      )}

      {/* HOTELS GRID */}
      {!isLoading && !error && stayData.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                  <i className="las la-angle-left"></i>
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
                  <i className="las la-angle-right"></i>
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SectionGridFilterCard;
