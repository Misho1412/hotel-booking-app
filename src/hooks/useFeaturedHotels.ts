import { useState, useEffect, useRef, useCallback } from 'react';
import { useApiState, getErrorMessage } from './useApiState';
import { hotelsToStayData } from '@/lib/api/adapters';
import { StayDataType } from '@/data/types';
import { useAuth } from '@/context/AuthContext';
import { IHotel } from '@/lib/api/schemas/hotel';
import hotelService from '@/lib/api/services/hotelService';

// Define a cache for hotel data
interface HotelCache {
  timestamp: number;
  data: StayDataType[];
  raw: IHotel[];
}

// Global cache shared between hook instances
const globalHotelCache: Record<string, HotelCache> = {};

// Cache timeout in milliseconds (5 minutes)
const CACHE_TIMEOUT = 300000;

// Global state to prevent concurrent requests
let isFetchingGlobally = false;
let lastFetchTimestamp = 0;
const MIN_FETCH_INTERVAL = 500; // 500ms to make it responsive

// Maximum number of retry attempts for API calls
const MAX_RETRY_ATTEMPTS = 2;

/**
 * Custom hook to fetch featured hotels with caching and throttling
 * @param limit Maximum number of hotels to fetch
 * @param city Optional city filter
 * @returns Object containing hotels data, loading state and error
 */
export function useFeaturedHotels(limit: number = 8, city?: string) {
  const [apiState, apiActions] = useApiState<StayDataType[]>([]);
  const { isAuthenticated } = useAuth();
  const initialLoadAttemptedRef = useRef(false);
  const requestIdRef = useRef(0);
  const retryCountRef = useRef(0);
  
  // Create a cache key based on the parameters
  const getCacheKey = useCallback(() => {
    return `hotels_${city || 'all'}_${limit}_${isAuthenticated ? 'auth' : 'unauth'}`;
  }, [city, limit, isAuthenticated]);
  
  // Check if cache is still valid
  const isCacheValid = useCallback((cacheKey: string) => {
    const cache = globalHotelCache[cacheKey];
    return (
      cache &&
      cache.data.length > 0 &&
      Date.now() - cache.timestamp < CACHE_TIMEOUT
    );
  }, []);
  
  // Check if we can make a new fetch request
  const canMakeFetchRequest = useCallback(() => {
    const now = Date.now();
    return !isFetchingGlobally && (now - lastFetchTimestamp > MIN_FETCH_INTERVAL);
  }, []);
  
  const fetchHotelsFromBackend = useCallback(async () => {
    // Don't fetch if already fetching or too soon after last fetch
    if (!canMakeFetchRequest()) {
      console.log('Skipping fetch: Another request in progress or rate limit');
      return;
    }
    
    // Get current request ID to handle race conditions
    const requestId = ++requestIdRef.current;
    
    // Set global fetching flag and timestamp
    isFetchingGlobally = true;
    lastFetchTimestamp = Date.now();
    
    try {
      apiActions.setLoading(true);
      
      // Check cache first
      const cacheKey = getCacheKey();
      if (isCacheValid(cacheKey)) {
        console.log('Using cached hotel data:', cacheKey);
        apiActions.setData(globalHotelCache[cacheKey].data);
        apiActions.setLoading(false);
        isFetchingGlobally = false;
        return;
      }
      
      console.log(`----- HOTEL FETCH ATTEMPT ${retryCountRef.current + 1}/${MAX_RETRY_ATTEMPTS + 1} -----`);
      console.log('Parameters:', { limit, city, isAuthenticated });
      
      // Get hotels via the hotelService which has proper token handling
      let hotels: IHotel[] = [];
      
      try {
        // Check if authentication token exists and log it for debugging
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('amr_auth_token');
          console.log('Token status:', token ? 'Found' : 'Not found');
          if (token) {
            console.log('Token preview:', token.substring(0, 10) + '...');
          }
        }
        
        // Log the API endpoint we're about to call
        const baseURL = process.env.NEXT_PUBLIC_AMR_API_URL || 'https://amrbooking.onrender.com/api';
        const queryParams = new URLSearchParams({
          featured: 'true',
          page_size: limit.toString()
        });
        if (city && city !== 'all') {
          queryParams.append('city', city);
        }
        console.log('API URL:', `${baseURL}/hotels/?${queryParams.toString()}`);
        
        // Make the API call through the service
        hotels = await hotelService.getFeaturedHotels(limit, { city: city === 'all' ? undefined : city });
        console.log(`Received ${hotels.length} hotels from backend`);
        
        // If we got hotels, log the first one as a sample
        if (hotels.length > 0) {
          console.log('First hotel sample:', {
            id: hotels[0].id,
            name: hotels[0].name,
            city: hotels[0].address?.city || 'N/A',
            images: hotels[0].images ? hotels[0].images.length : 0
          });
        }
      } catch (serviceError) {
        console.error('Error from hotel service:', serviceError);
        // Try to extract detailed error information
        let errorDetails = '';
        if (serviceError.response) {
          console.error('Response status:', serviceError.response.status);
          console.error('Response data:', serviceError.response.data);
          errorDetails = ` (Status: ${serviceError.response.status})`;
        }
        
        // If we have retry attempts left, throw to trigger retry
        if (retryCountRef.current < MAX_RETRY_ATTEMPTS) {
          throw serviceError;
        }
        // Otherwise, propagate error to be handled in the catch block
        throw new Error(`Failed to fetch hotels after ${MAX_RETRY_ATTEMPTS + 1} attempts: ${getErrorMessage(serviceError)}${errorDetails}`);
      }
      
      // If we got zero hotels and have retries left, throw to trigger retry
      if (hotels.length === 0 && retryCountRef.current < MAX_RETRY_ATTEMPTS) {
        retryCountRef.current++;
        throw new Error('Empty hotels array returned from API');
      }
      
      // Reset retry counter on success
      retryCountRef.current = 0;
      
      // If this is a stale request, ignore the response
      if (requestId !== requestIdRef.current) {
        console.log('Ignoring stale response');
        isFetchingGlobally = false;
        return;
      }
      
      if (hotels.length === 0) {
        console.log('API returned empty results, no hotels available');
        apiActions.setData([]);
        return;
      }
      
      // Convert to UI format
      console.log('Converting API data to UI format...');
      let stayData = hotelsToStayData(hotels);
      console.log('Converted data count:', stayData.length);
      
      // Filter by city if needed
      if (city && city !== 'all') {
        stayData = stayData.filter(stay => 
          stay.address.toLowerCase().includes(city.toLowerCase())
        );
        console.log('After city filtering:', stayData.length);
      }
      
      // If we have no data after conversion and filtering
      if (stayData.length === 0) {
        console.log('No hotels after conversion and filtering');
        apiActions.setData([]);
        return;
      }
      
      // Cache the results
      globalHotelCache[cacheKey] = {
        timestamp: Date.now(),
        data: stayData,
        raw: hotels
      };
      
      // Update state
      console.log('Setting hotel data, count:', stayData.length);
      apiActions.setData(stayData);
      
    } catch (error: any) {
      console.error('Error fetching hotels:', error);
      
      // Only update error state for current request
      if (requestId === requestIdRef.current) {
        // If we have retries left, try again
        if (retryCountRef.current < MAX_RETRY_ATTEMPTS) {
          retryCountRef.current++;
          console.log(`Retrying hotel fetch, attempt ${retryCountRef.current + 1}/${MAX_RETRY_ATTEMPTS + 1}`);
          
          // Wait a bit before retrying
          setTimeout(() => {
            isFetchingGlobally = false;
            fetchHotelsFromBackend();
          }, 1000);
          return;
        }
        
        // No more retries, set error state and empty data
        apiActions.setError(new Error(getErrorMessage(error)));
        apiActions.setData([]);
      }
    } finally {
      // Release global lock
      isFetchingGlobally = false;
      
      // Only update loading state for current request
      if (requestId === requestIdRef.current) {
        apiActions.setLoading(false);
      }
    }
  }, [apiActions, canMakeFetchRequest, city, getCacheKey, isCacheValid, isAuthenticated, limit]);
  
  // Clear cache and reload data
  const refetch = useCallback(() => {
    console.log('Manual refetch triggered');
    retryCountRef.current = 0; // Reset retry count on manual refetch
    const cacheKey = getCacheKey();
    delete globalHotelCache[cacheKey];
    return fetchHotelsFromBackend();
  }, [getCacheKey, fetchHotelsFromBackend]);
  
  // Initial data load - only run once
  useEffect(() => {
    if (!initialLoadAttemptedRef.current) {
      console.log('Initial data load');
      initialLoadAttemptedRef.current = true;
      fetchHotelsFromBackend();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Handle filter changes (city/limit) - with debounce to prevent excessive fetches
  useEffect(() => {
    if (!initialLoadAttemptedRef.current) {
      return; // Skip if initial load hasn't happened
    }
    
    console.log('Filter changed:', { city, limit });
    retryCountRef.current = 0; // Reset retry count on filter change
    
    const cacheKey = getCacheKey();
    if (isCacheValid(cacheKey)) {
      console.log('Using cached data for this filter');
      apiActions.setData(globalHotelCache[cacheKey].data);
      return;
    }
    
    // Shorter debounce time
    const timerId = setTimeout(() => {
      fetchHotelsFromBackend();
    }, 100);
    
    return () => clearTimeout(timerId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city, limit]);
  
  return {
    hotels: apiState.data || [],
    isLoading: apiState.isLoading,
    error: apiState.error,
    refetch
  };
} 