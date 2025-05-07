import { useState, useEffect, useCallback } from 'react';
import { IHotel, IHotelListResponse, IHotelSearchParams } from '@/lib/api/schemas/hotel';
import apiClient from '@/lib/api/apiConfig';
import { StayDataType } from '@/data/types';
import { hotelToStayData, hotelsToStayData } from '@/lib/api/adapters';
import { usePathname } from 'next/navigation';

// Use an interface extension to add the hotel_chain parameter without conflicting with the imported HotelChain
interface ExtendedHotelSearchParams extends IHotelSearchParams {
  hotel_chain?: string;
  name?: string;
}

interface UseHotelsState {
  isLoading: boolean;
  error: Error | null;
  hotels: IHotel[];
  stayData: StayDataType[];
  pagination: {
    count: number;
    next: string | null;
    previous: string | null;
    currentPage: number;
    totalPages: number;
  };
}

interface UseHotelsOptions {
  initialParams?: ExtendedHotelSearchParams;
  autoFetch?: boolean;
}

/**
 * Custom hook for fetching and managing hotel data
 */
export default function useHotels(options: UseHotelsOptions = {}) {
  const { initialParams = {}, autoFetch = true } = options;
  
  // Get current locale for translations
  const pathname = usePathname();
  const isArabic = pathname?.startsWith('/ar');
  
  const [params, setParams] = useState<ExtendedHotelSearchParams>(initialParams);
  const [state, setState] = useState<UseHotelsState>({
    isLoading: autoFetch,
    error: null,
    hotels: [],
    stayData: [],
    pagination: {
      count: 0,
      next: null,
      previous: null,
      currentPage: 1,
      totalPages: 1
    }
  });
  
  // Function to fetch hotels with current params
  const fetchHotels = useCallback(async (searchParams: ExtendedHotelSearchParams = params) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Log the parameters we're using for debugging
      console.log("Fetching hotels with params:", searchParams);
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      
      // Add search parameters to query
      if (searchParams.page) queryParams.append('page', searchParams.page.toString());
      if (searchParams.page_size) queryParams.append('page_size', searchParams.page_size.toString());
      if (searchParams.name) queryParams.append('name', searchParams.name);
      if (searchParams.city) queryParams.append('city', searchParams.city);
      if (searchParams.star_rating) queryParams.append('star_rating', searchParams.star_rating.toString());
      if (searchParams.min_price) queryParams.append('min_price', searchParams.min_price.toString());
      if (searchParams.max_price) queryParams.append('max_price', searchParams.max_price.toString());
      if (searchParams.hotel_chain) queryParams.append('hotel_chain', searchParams.hotel_chain);
      
      // Fetch hotels from API using the new endpoint
      const response = await apiClient.get<IHotelListResponse>(
        `/hotels/api/v1/?${queryParams.toString()}`
      );
      
      // Calculate total pages
      const pageSize = searchParams.page_size || 10;
      const totalPages = Math.ceil(response.data.count / pageSize);
      const currentPage = searchParams.page || 1;
      
      // Convert to StayDataType for UI components
      // Pass isArabic flag for translations
      const stayData = hotelsToStayData(response.data.results, isArabic);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: null,
        hotels: response.data.results,
        stayData,
        pagination: {
          count: response.data.count,
          next: response.data.next,
          previous: response.data.previous,
          currentPage,
          totalPages
        }
      }));
      
      return response.data;
    } catch (error) {
      console.error("Error fetching hotels:", error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error : new Error('Failed to fetch hotels') 
      }));
      throw error;
    }
  }, [params, isArabic]);
  
  // Function to fetch a single hotel by ID
  const fetchHotelById = useCallback(async (id: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Fetch hotel from API using the new endpoint
      const response = await apiClient.get<IHotel>(`/hotels/api/v1/${id}/`);
      
      // Pass isArabic flag for translations
      const stayDataItem = hotelToStayData(response.data, isArabic);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        hotels: [response.data],
        stayData: [stayDataItem]
      }));
      
      return response.data;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error : new Error(`Failed to fetch hotel with ID ${id}`) 
      }));
      throw error;
    }
  }, [isArabic]);
  
  // Function to fetch hotel amenities
  const fetchHotelAmenities = useCallback(async (hotelId: string) => {
    try {
      console.log(`Fetching amenities for hotel ID: ${hotelId}`);
      
      // Fetch amenities from API
      const response = await apiClient.get(`/hotels/api/v1/${hotelId}/`);
      
      console.log(`Fetched ${response.data.length || 0} amenities`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching amenities for hotel ${hotelId}:`, error);
      throw error instanceof Error ? error : new Error(`Failed to fetch amenities for hotel ${hotelId}`);
    }
  }, []);
  
  // Function to go to next page
  const nextPage = useCallback(() => {
    if (state.pagination.next) {
      const newPage = state.pagination.currentPage + 1;
      setParams(prev => ({ ...prev, page: newPage }));
      return fetchHotels({ ...params, page: newPage });
    }
    return Promise.resolve(null);
  }, [state.pagination.next, state.pagination.currentPage, params, fetchHotels]);
  
  // Function to go to previous page
  const prevPage = useCallback(() => {
    if (state.pagination.previous) {
      const newPage = state.pagination.currentPage - 1;
      setParams(prev => ({ ...prev, page: newPage }));
      return fetchHotels({ ...params, page: newPage });
    }
    return Promise.resolve(null);
  }, [state.pagination.previous, state.pagination.currentPage, params, fetchHotels]);
  
  // Function to go to a specific page
  const goToPage = useCallback((page: number) => {
    if (page > 0 && page <= state.pagination.totalPages) {
      setParams(prev => ({ ...prev, page }));
      return fetchHotels({ ...params, page });
    }
    return Promise.resolve(null);
  }, [state.pagination.totalPages, params, fetchHotels]);
  
  // Function to update search parameters
  const updateParams = useCallback((newParams: Partial<ExtendedHotelSearchParams>) => {
    // When changing search criteria, reset to first page
    const updatedParams = { ...params, ...newParams, page: 1 };
    setParams(updatedParams);
    return fetchHotels(updatedParams);
  }, [params, fetchHotels]);
  
  // Initial fetch effect
  useEffect(() => {
    if (autoFetch) {
      fetchHotels(initialParams);
    }
  }, [autoFetch, fetchHotels, initialParams]);
  
  return {
    ...state,
    params,
    fetchHotels,
    fetchHotelById,
    fetchHotelAmenities,
    nextPage,
    prevPage,
    goToPage,
    updateParams,
    setParams
  };
} 