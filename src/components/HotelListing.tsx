import React, { useMemo, useState } from "react";
import useHotels from "@/hooks/useHotels";
import { IHotelSearchParams } from "@/lib/api/schemas/hotel";
import StayCard from "@/components/StayCard";
import ButtonPrimary from "@/shared/ButtonPrimary";
import Heading from "@/shared/Heading";
import Spinner from "@/shared/Spinner";
import Alert from "@/shared/Alert";
import Input from "@/shared/Input";

export interface HotelListingProps {
  heading?: string;
  subHeading?: string;
  className?: string;
  initialParams?: IHotelSearchParams;
}

const HotelListing: React.FC<HotelListingProps> = ({
  heading = "Find Your Perfect Stay",
  subHeading = "Browse our selection of quality hotels around the world",
  className = "",
  initialParams = { page: 1, page_size: 12 }
}) => {
  const [filterCity, setFilterCity] = useState<string>("");
  const [filterStars, setFilterStars] = useState<number | undefined>(undefined);
  
  const {
    isLoading,
    error,
    stayData,
    pagination,
    updateParams,
    nextPage,
    prevPage,
    goToPage
  } = useHotels({
    initialParams,
    autoFetch: true
  });
  
  // Apply filters
  const handleFilter = () => {
    const params: IHotelSearchParams = { 
      page: 1,
      page_size: initialParams.page_size,
    };
    
    if (filterCity) {
      params.city = filterCity;
    }
    
    if (filterStars !== undefined) {
      params.star_rating = filterStars;
    }
    
    updateParams(params);
  };
  
  // Reset filters
  const handleReset = () => {
    setFilterCity("");
    setFilterStars(undefined);
    updateParams({ 
      page: 1, 
      page_size: initialParams.page_size,
      city: undefined,
      star_rating: undefined
    });
  };
  
  // Generate pagination items
  const paginationItems = useMemo(() => {
    const items = [];
    const maxPagesToShow = 5;
    const currentPage = pagination.currentPage;
    const totalPages = pagination.totalPages;
    
    // Start and end pages calculation
    let startPage = Math.max(currentPage - Math.floor(maxPagesToShow / 2), 1);
    let endPage = startPage + maxPagesToShow - 1;
    
    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(endPage - maxPagesToShow + 1, 1);
    }
    
    // "Previous" button
    items.push(
      <button
        key="prev"
        onClick={() => prevPage()}
        disabled={currentPage <= 1}
        className={`flex h-9 w-9 items-center justify-center rounded-full ${
          currentPage <= 1
            ? "cursor-not-allowed text-neutral-400"
            : "text-neutral-700 hover:bg-neutral-100"
        }`}
      >
        <i className="las la-angle-left"></i>
      </button>
    );
    
    // Page number buttons
    for (let page = startPage; page <= endPage; page++) {
      items.push(
        <button
          key={page}
          onClick={() => goToPage(page)}
          className={`flex h-9 w-9 items-center justify-center rounded-full ${
            page === currentPage
              ? "bg-primary-500 text-white"
              : "text-neutral-700 hover:bg-neutral-100"
          }`}
        >
          {page}
        </button>
      );
    }
    
    // "Next" button
    items.push(
      <button
        key="next"
        onClick={() => nextPage()}
        disabled={currentPage >= totalPages}
        className={`flex h-9 w-9 items-center justify-center rounded-full ${
          currentPage >= totalPages
            ? "cursor-not-allowed text-neutral-400"
            : "text-neutral-700 hover:bg-neutral-100"
        }`}
      >
        <i className="las la-angle-right"></i>
      </button>
    );
    
    return items;
  }, [pagination, prevPage, nextPage, goToPage]);
  
  return (
    <div className={`nc-HotelListing ${className}`}>
      {/* HEADER */}
      <div className="mb-8">
        <Heading desc={subHeading}>{heading}</Heading>
      </div>
      
      {/* FILTERS */}
      <div className="mb-8 border border-neutral-200 rounded-lg p-5 bg-white">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <label className="block text-sm font-medium text-neutral-700 mb-1">City</label>
            <Input
              type="text"
              placeholder="Filter by city"
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="w-full md:w-48">
            <label className="block text-sm font-medium text-neutral-700 mb-1">Star Rating</label>
            <select
              value={filterStars || ""}
              onChange={(e) => setFilterStars(e.target.value ? parseInt(e.target.value) : undefined)}
              className="block w-full rounded-md border border-neutral-200 py-2.5 px-4 focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
            >
              <option value="">Any Rating</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
          
          <div className="flex gap-3 md:self-end">
            <ButtonPrimary 
              onClick={handleFilter}
              className="flex-1 md:flex-initial flex items-center justify-center"
            >
              <i className="las la-filter mr-1"></i>
              Apply
            </ButtonPrimary>
            
            <button
              onClick={handleReset}
              className="flex-1 md:flex-initial px-4 py-2 border border-neutral-200 rounded-lg text-neutral-700 hover:bg-neutral-100"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
      
      {/* STATUS */}
      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <Spinner size="lg" />
          <span className="ml-4 text-lg">Loading hotels...</span>
        </div>
      )}
      
      {error && (
        <Alert type="error" className="mb-8">
          <span className="font-medium">Error:</span> {error.message}
        </Alert>
      )}
      
      {!isLoading && !error && stayData.length === 0 && (
        <Alert className="mb-8">
          No hotels found matching your criteria. Try adjusting your filters.
        </Alert>
      )}
      
      {/* RESULTS COUNT */}
      {!isLoading && !error && stayData.length > 0 && (
        <div className="mb-4 text-neutral-500">
          Found {pagination.count} hotels
          {filterCity && ` in ${filterCity}`}
          {filterStars !== undefined && ` with ${filterStars} stars`}
        </div>
      )}
      
      {/* HOTEL GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {stayData.map((stay) => (
          <StayCard key={stay.id} data={stay} />
        ))}
      </div>
      
      {/* PAGINATION */}
      {!isLoading && !error && pagination.totalPages > 1 && (
        <div className="flex justify-center mt-12">
          <nav className="inline-flex space-x-1">{paginationItems}</nav>
        </div>
      )}
    </div>
  );
};

export default HotelListing; 