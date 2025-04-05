import { useState, useEffect, useCallback } from 'react';
import { IHotel, IHotelListResponse, IHotelSearchParams } from '@/lib/api/schemas/hotel';
import hotelService from '@/lib/api/services/hotelService';
import { StayDataType } from '@/data/types';
import { hotelToStayData, hotelsToStayData } from '@/lib/api/adapters';
import { usePathname } from 'next/navigation';

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
  initialParams?: IHotelSearchParams;
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
  
  const [params, setParams] = useState<IHotelSearchParams>(initialParams);
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
  const fetchHotels = useCallback(async (searchParams: IHotelSearchParams = params) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Fetch hotels from API
      const response = await hotelService.getHotels(searchParams);
      
      // Calculate total pages
      const pageSize = searchParams.page_size || 10;
      const totalPages = Math.ceil(response.count / pageSize);
      const currentPage = searchParams.page || 1;
      
      // Convert to StayDataType for UI components
      // Pass isArabic flag for translations
      const stayData = hotelsToStayData(response.results, isArabic);
      
      setState({
        isLoading: false,
        error: null,
        hotels: response.results,
        stayData,
        pagination: {
          count: response.count,
          next: response.next,
          previous: response.previous,
          currentPage,
          totalPages
        }
      });
      
      return response;
    } catch (error) {
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
      
      const hotel = await hotelService.getHotelDetails(id);
      // Pass isArabic flag for translations
      const stayDataItem = hotelToStayData(hotel, isArabic);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        hotels: [hotel],
        stayData: [stayDataItem]
      }));
      
      return hotel;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error : new Error(`Failed to fetch hotel with ID ${id}`) 
      }));
      throw error;
    }
  }, [isArabic]);
  
  // Function to fetch a single hotel by slug
  const fetchHotelBySlug = useCallback(async (slug: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const hotel = await hotelService.getHotelBySlug(slug);
      // Pass isArabic flag for translations
      const stayDataItem = hotelToStayData(hotel, isArabic);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        hotels: [hotel],
        stayData: [stayDataItem]
      }));
      
      return hotel;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error : new Error(`Failed to fetch hotel with slug ${slug}`) 
      }));
      throw error;
    }
  }, [isArabic]);
  
  // Function to fetch featured hotels
  const fetchFeaturedHotels = useCallback(async (limit?: number) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const hotels = await hotelService.getFeaturedHotels(limit);
      // Pass isArabic flag for translations
      const stayData = hotelsToStayData(hotels, isArabic);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        hotels,
        stayData,
        pagination: {
          ...prev.pagination,
          count: hotels.length,
          totalPages: 1
        }
      }));
      
      return hotels;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error : new Error('Failed to fetch featured hotels') 
      }));
      throw error;
    }
  }, [isArabic]);
  
  // Function to fetch hotels by city
  const fetchHotelsByCity = useCallback(async (city: string, limit?: number) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const hotels = await hotelService.getHotelsByCity(city, limit);
      // Pass isArabic flag for translations
      const stayData = hotelsToStayData(hotels, isArabic);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        hotels,
        stayData,
        pagination: {
          ...prev.pagination,
          count: hotels.length,
          totalPages: 1
        }
      }));
      
      return hotels;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error : new Error(`Failed to fetch hotels in ${city}`) 
      }));
      throw error;
    }
  }, [isArabic]);
  
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
  const updateParams = useCallback((newParams: Partial<IHotelSearchParams>) => {
    // When changing search criteria, reset to first page
    const updatedParams = { ...params, ...newParams, page: 1 };
    setParams(updatedParams);
    return fetchHotels(updatedParams);
  }, [params, fetchHotels]);
  
  // Function to fetch amenities for a specific hotel
  const fetchHotelAmenities = useCallback(async (hotelId: string): Promise<any[]> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      console.log(`Fetching amenities for hotel ID: ${hotelId}`);
      const amenities = await hotelService.getHotelAmenities(hotelId);
      console.log(`Fetched ${amenities.length} amenities for hotel ${hotelId}`);
      return amenities;
    } catch (error) {
      console.error('Error fetching hotel amenities:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error : new Error('Failed to fetch hotel amenities') 
      }));
      return [];
    }
  }, []);
  
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
    fetchHotelBySlug,
    fetchFeaturedHotels,
    fetchHotelsByCity,
    nextPage,
    prevPage,
    goToPage,
    updateParams,
    setParams,
    fetchHotelAmenities
  };
} 