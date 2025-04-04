"use client";

import React, { useState, useEffect } from "react";
import BgGlassmorphism from "@/components/BgGlassmorphism";
import { useSearchParams } from "next/navigation";
import useHotels from "@/hooks/useHotels";
import { IHotelSearchParams } from "@/lib/api/schemas/hotel";
import StayCard from "@/components/StayCard";
import ButtonPrimary from "@/shared/ButtonPrimary";
import Heading from "@/shared/Heading";
import Spinner from "@/shared/Spinner";
import Alert from "@/shared/Alert";
import Input from "@/shared/Input";
import RangeSlider from "@/components/RangeSlider";
import SectionSubscribe2 from "@/components/SectionSubscribe2";

export default function HotelSearchPage() {
  const searchParams = useSearchParams();
  const initialCity = searchParams.get("city") || "";
  
  // State for search filters
  const [filters, setFilters] = useState({
    city: initialCity,
    starRating: undefined as number | undefined,
    priceRange: { min: 0, max: 1000 },
    checkInDate: "",
    checkOutDate: "",
    guests: 1,
  });
  
  // Initialize useHotels hook with search params
  const initialParams: IHotelSearchParams = {
    page: 1,
    page_size: 20,
    city: initialCity || undefined,
  };
  
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
  
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle price range changes
  const handlePriceRangeChange = (min: number, max: number) => {
    setFilters(prev => ({
      ...prev,
      priceRange: { min, max }
    }));
  };
  
  // Apply filters
  const handleSearch = () => {
    const params: IHotelSearchParams = { 
      page: 1,
      page_size: 20,
    };
    
    if (filters.city) {
      params.city = filters.city;
    }
    
    if (filters.starRating) {
      params.star_rating = Number(filters.starRating);
    }
    
    if (filters.checkInDate) {
      params.check_in_date = filters.checkInDate;
    }
    
    if (filters.checkOutDate) {
      params.check_out_date = filters.checkOutDate;
    }
    
    if (filters.guests > 1) {
      params.guests = filters.guests;
    }
    
    // Price range is handled at the UI level since the mock API
    // doesn't support price filtering directly
    
    updateParams(params);
  };
  
  // Reset filters
  const handleReset = () => {
    setFilters({
      city: "",
      starRating: undefined,
      priceRange: { min: 0, max: 1000 },
      checkInDate: "",
      checkOutDate: "",
      guests: 1
    });
    
    updateParams({ 
      page: 1, 
      page_size: 20
    });
  };
  
  // Filter results by price range (client-side)
  const filteredResults = stayData.filter(item => {
    const price = Number(item.price.replace(/[^0-9.-]+/g, ""));
    return price >= filters.priceRange.min && price <= filters.priceRange.max;
  });
  
  // Generate pagination items
  const paginationItems = [];
  const maxPagesToShow = 5;
  
  if (pagination.totalPages > 1) {
    // "Previous" button
    paginationItems.push(
      <button
        key="prev"
        onClick={() => prevPage()}
        disabled={pagination.currentPage <= 1}
        className={`flex h-9 w-9 items-center justify-center rounded-full ${
          pagination.currentPage <= 1
            ? "cursor-not-allowed text-neutral-400"
            : "text-neutral-700 hover:bg-neutral-100"
        }`}
      >
        <i className="las la-angle-left"></i>
      </button>
    );
    
    // Page number buttons
    let startPage = Math.max(pagination.currentPage - Math.floor(maxPagesToShow / 2), 1);
    let endPage = startPage + maxPagesToShow - 1;
    
    if (endPage > pagination.totalPages) {
      endPage = pagination.totalPages;
      startPage = Math.max(endPage - maxPagesToShow + 1, 1);
    }
    
    for (let page = startPage; page <= endPage; page++) {
      paginationItems.push(
        <button
          key={page}
          onClick={() => goToPage(page)}
          className={`flex h-9 w-9 items-center justify-center rounded-full ${
            page === pagination.currentPage
              ? "bg-primary-500 text-white"
              : "text-neutral-700 hover:bg-neutral-100"
          }`}
        >
          {page}
        </button>
      );
    }
    
    // "Next" button
    paginationItems.push(
      <button
        key="next"
        onClick={() => nextPage()}
        disabled={pagination.currentPage >= pagination.totalPages}
        className={`flex h-9 w-9 items-center justify-center rounded-full ${
          pagination.currentPage >= pagination.totalPages
            ? "cursor-not-allowed text-neutral-400"
            : "text-neutral-700 hover:bg-neutral-100"
        }`}
      >
        <i className="las la-angle-right"></i>
      </button>
    );
  }
  
  return (
    <div className="nc-HotelSearchPage relative">
      {/* GLASSMORPHISM */}
      <BgGlassmorphism />

      <div className="container relative pt-10 pb-16 lg:pt-20 lg:pb-28">
        <Heading 
          desc="Find the perfect hotel for your stay"
          className="mb-8"
        >
          Search Hotels
        </Heading>
        
        {/* SEARCH FILTERS */}
        <div className="w-full border border-neutral-200 p-5 rounded-2xl bg-white mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {/* DESTINATION */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Destination</label>
              <Input
                type="text"
                name="city"
                placeholder="Where are you going?"
                value={filters.city}
                onChange={handleInputChange}
                className="w-full"
              />
            </div>
            
            {/* DATES */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Check In</label>
              <Input
                type="date"
                name="checkInDate"
                value={filters.checkInDate}
                onChange={handleInputChange}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Check Out</label>
              <Input
                type="date"
                name="checkOutDate"
                value={filters.checkOutDate}
                onChange={handleInputChange}
                className="w-full"
              />
            </div>
            
            {/* STAR RATING */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Star Rating</label>
              <select
                name="starRating"
                value={filters.starRating || ""}
                onChange={handleInputChange}
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
            
            {/* GUESTS */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Guests</label>
              <Input
                type="number"
                name="guests"
                min={1}
                max={10}
                value={filters.guests}
                onChange={handleInputChange}
                className="w-full"
              />
            </div>
            
            {/* PRICE RANGE */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Price Range: ${filters.priceRange.min} - ${filters.priceRange.max}
              </label>
              <RangeSlider
                min={0}
                max={1000}
                defaultValue={[filters.priceRange.min, filters.priceRange.max]}
                onChange={(values) => handlePriceRangeChange(values[0], values[1])}
              />
            </div>
            
            {/* BUTTONS */}
            <div className="flex gap-3 items-end md:col-span-1">
              <ButtonPrimary 
                onClick={handleSearch}
                className="flex-1 flex items-center justify-center"
              >
                <i className="las la-search mr-2"></i>
                Search
              </ButtonPrimary>
              
              <button
                onClick={handleReset}
                className="flex-1 px-4 py-2 border border-neutral-200 rounded-lg text-neutral-700 hover:bg-neutral-100"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
        
        {/* LOADING STATE */}
        {isLoading && (
          <div className="flex items-center justify-center p-16">
            <Spinner size="lg" />
            <span className="ml-4 text-lg">Loading hotels...</span>
          </div>
        )}
        
        {/* ERROR STATE */}
        {error && !isLoading && (
          <Alert type="error" className="mb-8">
            <span className="font-medium">Error:</span> {error.message}
          </Alert>
        )}
        
        {/* NO RESULTS */}
        {!isLoading && !error && filteredResults.length === 0 && (
          <Alert className="mb-8">
            No hotels found matching your criteria. Try adjusting your filters.
          </Alert>
        )}
        
        {/* RESULTS COUNT */}
        {!isLoading && !error && filteredResults.length > 0 && (
          <div className="mb-6 text-neutral-500">
            Found {filteredResults.length} hotels
            {filters.city && ` in ${filters.city}`}
            {filters.starRating && ` with ${filters.starRating} stars`}
            {(filters.priceRange.min > 0 || filters.priceRange.max < 1000) && 
              ` with prices between $${filters.priceRange.min} - $${filters.priceRange.max}`
            }
          </div>
        )}
        
        {/* RESULTS GRID */}
        {!isLoading && !error && filteredResults.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredResults.map((stay) => (
              <StayCard key={stay.id} data={stay} />
            ))}
          </div>
        )}
        
        {/* PAGINATION */}
        {!isLoading && !error && pagination.totalPages > 1 && (
          <div className="flex justify-center mt-12">
            <nav className="inline-flex space-x-1">{paginationItems}</nav>
          </div>
        )}
        
        {/* SUBSCRIPTION SECTION */}
        <div className="relative py-16 mt-16">
          <SectionSubscribe2 />
        </div>
      </div>
    </div>
  );
} 