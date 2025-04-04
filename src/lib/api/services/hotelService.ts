import apiClient from '../apiConfig';
import { IHotel, IHotelListResponse, IHotelSearchParams, mockHotels, mockHotelListResponse, mockHotel } from '../schemas/hotel';
import { validateRequest, validateResponse } from '../validation';
import { z } from 'zod';
import { mockFeaturedHotels, mockPaginatedHotelList } from '../mockData/hotels';

// Interface for Hotel entity
export interface Hotel {
  id: string;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  phoneNumber?: string;
  email?: string;
  website?: string;
  starRating?: number;
  amenities?: string[];
  images?: string[];
  latitude?: number;
  longitude?: number;
  createdAt: string;
  updatedAt: string;
}

// Interface for creating a hotel
export interface HotelRequest {
  name: string;
  description?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  phoneNumber?: string;
  email?: string;
  website?: string;
  starRating?: number;
  amenities?: string[];
  images?: string[];
  latitude?: number;
  longitude?: number;
}

// Interface for updating a hotel
export interface PatchedHotelRequest {
  name?: string;
  description?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  phoneNumber?: string;
  email?: string;
  website?: string;
  starRating?: number;
  amenities?: string[];
  images?: string[];
  latitude?: number;
  longitude?: number;
}

// Interface for paginated hotel list
export interface PaginatedHotelList {
  count: number;
  next: string | null;
  previous: string | null;
  results: Hotel[];
}

// Interface for hotel search params
export interface HotelSearchParams {
  name?: string;
  city?: string;
  country?: string;
  minRating?: number;
  maxRating?: number;
  amenities?: string[];
  page?: number;
  pageSize?: number;
}

/**
 * Add delay for rate limiting and demonstrating loading states
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Retry a function with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries = 3,
  backoffMs = 300,
  maxBackoffMs = 10000
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    // Check if we should retry based on status code
    const shouldRetry = 
      (error.response?.status === 429) || // Rate limit
      (error.response?.status >= 500 && error.response?.status < 600); // Server error
    
    if (retries <= 0 || !shouldRetry) {
      throw error;
    }
    
    // Calculate backoff time with jitter
    const jitter = Math.random() * 0.3 * backoffMs;
    const nextBackoffMs = Math.min(backoffMs + jitter, maxBackoffMs);
    
    // Wait before retrying
    await delay(nextBackoffMs);
    
    // Retry with increased backoff
    return retryWithBackoff(fn, retries - 1, backoffMs * 2, maxBackoffMs);
  }
}

/**
 * Hotel Service for interacting with hotel-related API endpoints
 */
class HotelService {
  /**
   * Get all hotels with optional filters
   */
  async getHotels(params?: IHotelSearchParams): Promise<IHotelListResponse> {
    try {
      console.log('Fetching hotels with params:', params);
      
      // Get token and add to request if available
      const token = typeof window !== 'undefined' ? localStorage.getItem('amr_auth_token') : null;
      const headers: Record<string, string> = {};
      
      if (token) {
        // Use correct format: "Token <token>" instead of "Bearer <token>" 
        headers['Authorization'] = `Token ${token}`;
      }
      
      const response = await apiClient.get<IHotelListResponse>('/hotels/', { 
        params,
        headers
      });
      
      console.log(`Hotels API response status: ${response.status}`);
      console.log(`Retrieved ${response.data.results.length} hotels, total: ${response.data.count}`);
      
      return response.data;
    } catch (error: any) {
      // Check if this is an authentication error
      if (error.response?.status === 401) {
        console.error("Authentication failed when accessing hotels API:", error.message);
        // Try to access public endpoint as fallback
        try {
          console.log("Attempting to access public hotels endpoint");
          const fallbackResponse = await apiClient.get<IHotelListResponse>('/hotels/public/', { params });
          return fallbackResponse.data;
        } catch (fallbackError) {
          console.error("Fallback hotels request failed:", fallbackError);
          throw new Error(`Authentication error when accessing hotels: ${error.message}`);
        }
      }
      // Re-throw other errors with improved message
      console.error("Error fetching hotels:", error);
      throw new Error(`Failed to retrieve hotels: ${error.message}`);
    }
  }
  
  /**
   * Get details for a specific hotel by its ID
   */
  async getHotelDetails(id: string): Promise<IHotel> {
    try {
      console.log(`Fetching details for hotel ID: ${id}`);
      
      // Get token and add to request if available
      const token = typeof window !== 'undefined' ? localStorage.getItem('amr_auth_token') : null;
      const headers: Record<string, string> = {};
      
      if (token) {
        // Use correct format: "Token <token>" instead of "Bearer <token>"
        headers['Authorization'] = `Token ${token}`;
      }
      
      const response = await apiClient.get<IHotel>(`/hotels/${id}/`, { headers });
      console.log(`Hotel details API response status: ${response.status}`);
      
      return response.data;
    } catch (error: any) {
      // Check if this is an authentication error
      if (error.response?.status === 401) {
        console.error("Authentication failed when accessing hotel details API:", error.message);
        // Try public endpoint
        try {
          console.log("Attempting to access public hotel details endpoint");
          const fallbackResponse = await apiClient.get<IHotel>(`/hotels/public/${id}/`);
          return fallbackResponse.data;
        } catch (fallbackError) {
          console.error("Fallback hotel details request failed:", fallbackError);
          throw new Error(`Authentication error when accessing hotel details: ${error.message}`);
        }
      }
      // Re-throw other errors with improved message
      console.error("Error fetching hotel details:", error);
      throw new Error(`Failed to retrieve hotel details: ${error.message}`);
    }
  }
  
  /**
   * Get hotel by slug
   */
  async getHotelBySlug(slug: string): Promise<IHotel> {
    try {
      console.log(`Fetching hotel by slug: ${slug}`);
      
      // Get token and add to request if available
      const token = typeof window !== 'undefined' ? localStorage.getItem('amr_auth_token') : null;
      const headers: Record<string, string> = {};
      
      if (token) {
        // Use correct format: "Token <token>" instead of "Bearer <token>"
        headers['Authorization'] = `Token ${token}`;
      }
      
      const response = await apiClient.get<IHotel>(`/hotels/slug/${slug}/`, { headers });
      console.log(`Hotel by slug API response status: ${response.status}`);
      
      return response.data;
    } catch (error: any) {
      // Check if this is an authentication error
      if (error.response?.status === 401) {
        console.error("Authentication failed when accessing hotel by slug API:", error.message);
        // Try public endpoint
        try {
          console.log("Attempting to access public hotel by slug endpoint");
          const fallbackResponse = await apiClient.get<IHotel>(`/hotels/public/slug/${slug}/`);
          return fallbackResponse.data;
        } catch (fallbackError) {
          console.error("Fallback hotel by slug request failed:", fallbackError);
          throw new Error(`Authentication error when accessing hotel by slug: ${error.message}`);
        }
      }
      // Re-throw other errors with improved message
      console.error("Error fetching hotel by slug:", error);
      throw new Error(`Failed to retrieve hotel by slug: ${error.message}`);
    }
  }
  
  /**
   * Create a new hotel (admin only)
   */
  async createHotel(hotelData: Partial<IHotel>): Promise<IHotel> {
    try {
      console.log('Creating new hotel');
      
      // Get token and add to request if available
      const token = typeof window !== 'undefined' ? localStorage.getItem('amr_auth_token') : null;
      const headers: Record<string, string> = {};
      
      if (token) {
        // Use correct format: "Token <token>" instead of "Bearer <token>"
        headers['Authorization'] = `Token ${token}`;
      }
      
      const response = await apiClient.post<IHotel>('/hotels/', hotelData, { headers });
      console.log(`Create hotel API response status: ${response.status}`);
      
      return response.data;
    } catch (error: any) {
      console.error("Error creating hotel:", error);
      throw new Error(`Failed to create hotel: ${error.message}`);
    }
  }
  
  /**
   * Update a hotel (admin only)
   */
  async updateHotel(id: number, hotelData: Partial<IHotel>): Promise<IHotel> {
    try {
      console.log(`Updating hotel ID: ${id}`);
      
      // Get token and add to request if available
      const token = typeof window !== 'undefined' ? localStorage.getItem('amr_auth_token') : null;
      const headers: Record<string, string> = {};
      
      if (token) {
        // Use correct format: "Token <token>" instead of "Bearer <token>"
        headers['Authorization'] = `Token ${token}`;
      }
      
      const response = await apiClient.put<IHotel>(`/hotels/${id}/`, hotelData, { headers });
      console.log(`Update hotel API response status: ${response.status}`);
      
      return response.data;
    } catch (error: any) {
      console.error("Error updating hotel:", error);
      throw new Error(`Failed to update hotel: ${error.message}`);
    }
  }
  
  /**
   * Partially update a hotel (admin only)
   */
  async patchHotel(id: number, hotelData: Partial<IHotel>): Promise<IHotel> {
    try {
      console.log(`Partially updating hotel ID: ${id}`);
      
      // Get token and add to request if available
      const token = typeof window !== 'undefined' ? localStorage.getItem('amr_auth_token') : null;
      const headers: Record<string, string> = {};
      
      if (token) {
        // Use correct format: "Token <token>" instead of "Bearer <token>"
        headers['Authorization'] = `Token ${token}`;
      }
      
      const response = await apiClient.patch<IHotel>(`/hotels/${id}/`, hotelData, { headers });
      console.log(`Patch hotel API response status: ${response.status}`);
      
      return response.data;
    } catch (error: any) {
      console.error("Error patching hotel:", error);
      throw new Error(`Failed to patch hotel: ${error.message}`);
    }
  }
  
  /**
   * Delete a hotel (admin only)
   */
  async deleteHotel(id: number): Promise<void> {
    try {
      console.log(`Deleting hotel ID: ${id}`);
      
      // Get token and add to request if available
      const token = typeof window !== 'undefined' ? localStorage.getItem('amr_auth_token') : null;
      const headers: Record<string, string> = {};
      
      if (token) {
        // Use correct format: "Token <token>" instead of "Bearer <token>"
        headers['Authorization'] = `Token ${token}`;
      }
      
      const response = await apiClient.delete(`/hotels/${id}/`, { headers });
      console.log(`Delete hotel API response status: ${response.status}`);
    } catch (error: any) {
      console.error("Error deleting hotel:", error);
      throw new Error(`Failed to delete hotel: ${error.message}`);
    }
  }

  /**
   * Search for hotels based on various criteria
   */
  async searchHotels(params: IHotelSearchParams): Promise<IHotelListResponse> {
    try {
      console.log('Searching hotels with params:', params);
      
      // Get token and add to request if available
      const token = typeof window !== 'undefined' ? localStorage.getItem('amr_auth_token') : null;
      const headers: Record<string, string> = {};
      
      if (token) {
        // Use correct format: "Token <token>" instead of "Bearer <token>"
        headers['Authorization'] = `Token ${token}`;
      }
      
      const response = await apiClient.get<IHotelListResponse>('/hotels/search/', { 
        params,
        headers
      });
      console.log(`Hotel search API response status: ${response.status}`);
      console.log(`Found ${response.data.results.length} hotels matching search criteria`);
      
      return response.data;
    } catch (error: any) {
      // Check if this is an authentication error
      if (error.response?.status === 401) {
        console.error("Authentication failed when searching hotels API:", error.message);
        // Try public endpoint
        try {
          console.log("Attempting to access public hotel search endpoint");
          const fallbackResponse = await apiClient.get<IHotelListResponse>('/hotels/public/search/', { params });
          return fallbackResponse.data;
        } catch (fallbackError) {
          console.error("Fallback hotel search request failed:", fallbackError);
          throw new Error(`Authentication error when searching hotels: ${error.message}`);
        }
      }
      // Re-throw other errors with improved message
      console.error("Error searching hotels:", error);
      throw new Error(`Failed to search hotels: ${error.message}`);
    }
  }
  
  /**
   * Get featured hotels
   */
  async getFeaturedHotels(limit?: number, filters?: { city?: string }): Promise<IHotel[]> {
    try {
      console.log('🏨 Fetching featured hotels from backend API');
      const requestId = Math.random().toString(36).substring(7);
      
      // Get the token from localStorage if available - use 'amr_auth_token' to match the rest of the app
      let token = null;
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('amr_auth_token');
      }
      console.log(`[${requestId}] Auth token available: ${!!token}`);
      
      // Build request params
      const params: Record<string, any> = {
        featured: true,
        page_size: limit || 8,
      };
      
      if (filters?.city) {
        params.city = filters.city;
      }
      
      // Stringify params for logging
      const queryParams = new URLSearchParams();
      Object.keys(params).forEach(key => queryParams.append(key, params[key]));
      console.log(`[${requestId}] Request params: ${queryParams.toString()}`);
      
      // Create headers with authentication token
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        // Format should be "Token <token_value>"
        headers['Authorization'] = `Token ${token}`;
      }
      
      console.log(`[${requestId}] Request headers:`, Object.keys(headers));
      
      // Construct the full URL for detailed logging
      const baseUrl = apiClient.defaults.baseURL;
      const fullUrl = `${baseUrl}/hotels/?${queryParams.toString()}`;
      console.log(`[${requestId}] Making request to: ${fullUrl}`);
      
      const startTime = Date.now();
      const response = await apiClient.get('/hotels/', {
        params,
        headers,
        timeout: 10000, // 10 second timeout
      });
      
      const timeElapsed = Date.now() - startTime;
      console.log(`[${requestId}] Response received in ${timeElapsed}ms, status: ${response.status}`);
      
      if (response.status === 200) {
        const data = response.data;
        // Check if we have a valid response format
        if (data && data.results && Array.isArray(data.results)) {
          console.log(`[${requestId}] Got ${data.results.length} hotels from API`);
          
          if (data.results.length > 0) {
            // Return the hotels from the response
            return data.results;
          } else {
            console.log(`[${requestId}] No hotels found, trying public endpoint`);
            // If no featured hotels found, try fetching from a public endpoint
            return this.getHotelsByCity('all', limit);
          }
        } else {
          console.error(`[${requestId}] Unexpected response format:`, data);
          throw new Error('Unexpected API response format');
        }
      } else {
        console.error(`[${requestId}] Non-200 response:`, response.status, response.data);
        throw new Error(`API returned status ${response.status}`);
      }
    } catch (error: any) {
      console.error('Error fetching featured hotels:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      
      // No need to return mock data anymore - we'll let the error propagate
      throw error;
    }
  }
  
  /**
   * Get hotels by city
   */
  async getHotelsByCity(city: string, limit?: number): Promise<IHotel[]> {
    try {
      console.log(`Fetching hotels for city: ${city}, limit: ${limit || 'default'}`);
      
      // Get the token directly to make sure it's available
      const token = typeof window !== 'undefined' ? localStorage.getItem('amr_auth_token') : null;
      console.log(`Authentication token available: ${!!token}`);
      
      // Create headers with token if available using the correct format
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      
      if (token) {
        // Use correct format: "Token <token>" instead of "Bearer <token>"
        headers['Authorization'] = `Token ${token}`;
        console.log('Added token with format: Token <token>');
      }
      
      const response = await apiClient.get<IHotelListResponse>('/hotels/', { 
        params: { 
          city, 
          page: 1,
          page_size: limit 
        },
        headers
      });
      
      console.log(`Hotels API response status: ${response.status} ${response.statusText}`);
      console.log(`Found ${response.data.results.length} hotels for ${city}`);
      
      return response.data.results;
    } catch (error: any) {
      // Check if this is an authentication error
      if (error.response?.status === 401) {
        console.error("Authentication failed when accessing hotels by city API:", error.message);
        
        // Try to get hotels without authentication as fallback
        console.log("Attempting to fetch hotels without authentication as fallback");
        try {
          const fallbackResponse = await apiClient.get<IHotelListResponse>('/hotels/public/', { 
            params: { 
              city, 
              page: 1,
              page_size: limit 
            }
          });
          
          console.log(`Fallback API response status: ${fallbackResponse.status}`);
          console.log(`Found ${fallbackResponse.data.results.length} hotels from fallback endpoint`);
          
          return fallbackResponse.data.results;
        } catch (fallbackError) {
          console.error("Fallback hotel request also failed:", fallbackError);
          throw new Error(`Could not retrieve hotels for ${city}: ${error.message}`);
        }
      }
      
      // Handle network errors
      if (error.code === 'ECONNABORTED' || !error.response) {
        console.error("Network error when fetching hotels by city:", error);
        throw new Error(`Network error when fetching hotels for ${city}. Please check your connection.`);
      }
      
      // Re-throw other errors with improved message
      console.error("Error fetching hotels by city:", error);
      throw new Error(`Failed to retrieve hotels for ${city}: ${error.message}`);
    }
  }
}

// Export a singleton instance
const hotelService = new HotelService();
export default hotelService; 