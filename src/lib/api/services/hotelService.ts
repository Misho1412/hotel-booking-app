import apiClient from '../apiConfig';
import { IHotel, IHotelListResponse, IHotelSearchParams, mockHotels, mockHotelListResponse, mockHotel } from '../schemas/hotel';
import { validateRequest, validateResponse } from '../validation';
import { z } from 'zod';
import { mockFeaturedHotels, mockPaginatedHotelList } from '../mockData/hotels/api/v1/';

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
   * Get all hotels/api/v1/ with pagination and filters
   * @param params Optional search parameters
   * @returns Promise with paginated hotel listing
   */
  async getHotels(params?: IHotelSearchParams): Promise<IHotelListResponse> {
    try {
      console.log('Getting hotels/api/v1/ with params:', params);
      
      // Convert params to API expected format
      const apiParams: Record<string, any> = {};
      
      if (params?.page) apiParams.page = params.page;
      if (params?.page_size) apiParams.page_size = params.page_size;
      if (params?.name) apiParams.name = params.name;
      if (params?.city) apiParams.city = params.city;
      if (params?.country) apiParams.country = params.country;
      if (params?.minRating) apiParams.min_rating = params.minRating;
      if (params?.maxRating) apiParams.max_rating = params.maxRating;
      
      // Get authentication token if available
      const token = typeof window !== 'undefined' ? localStorage.getItem('amr_auth_token') : null;
      
      // Create headers with token if available
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Token ${token}`;
      }
      
      // Make API request using the new endpoint
      const response = await apiClient.get('/hotels/api/v1//api/v1/', { params: { page: 1, page_size: 8 } });

      
      console.log(`Retrieved ${response.data.results?.length} hotels/api/v1/`);
      
      return response.data;
    } catch (error: any) {
      console.error('Get hotels/api/v1/ error:', error);
      throw new Error(`Failed to retrieve hotels/api/v1/: ${error.message}`);
    }
  }

  /**
   * Get a specific hotel by ID
   * @param id The hotel ID
   * @returns Promise with hotel details
   */
  async getHotelDetails(id: string): Promise<IHotel> {
    try {
      console.log(`Getting hotel details for ID: ${id}`);
      
      // Get authentication token if available
      const token = typeof window !== 'undefined' ? localStorage.getItem('amr_auth_token') : null;
      
      // Create headers with token if available
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Token ${token}`;
      }
      
      // Make API request using the new endpoint
      const response = await apiClient.get(`/hotels/api/v1//api/v1/${id}/`, { headers });
      
      console.log('Retrieved hotel details successfully');
      
      return response.data;
    } catch (error: any) {
      console.error('Get hotel details error:', error);
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
      
      const response = await apiClient.get<IHotel>(`/hotels/api/v1//slug/${slug}/`, { headers });
      console.log(`Hotel by slug API response status: ${response.status}`);
      
      return response.data;
    } catch (error: any) {
      // Check if this is an authentication error
      if (error.response?.status === 401) {
        console.error("Authentication failed when accessing hotel by slug API:", error.message);
        // Try public endpoint
        try {
          console.log("Attempting to access public hotel by slug endpoint");
          const fallbackResponse = await apiClient.get<IHotel>(`/hotels/api/v1//public/slug/${slug}/`);
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
      
      const response = await apiClient.post<IHotel>('/hotels/api/v1//', hotelData, { headers });
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
      
      const response = await apiClient.put<IHotel>(`/hotels/api/v1//${id}/`, hotelData, { headers });
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
      
      const response = await apiClient.patch<IHotel>(`/hotels/api/v1//${id}/`, hotelData, { headers });
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
      
      const response = await apiClient.delete(`/hotels/api/v1//${id}/`, { headers });
      console.log(`Delete hotel API response status: ${response.status}`);
    } catch (error: any) {
      console.error("Error deleting hotel:", error);
      throw new Error(`Failed to delete hotel: ${error.message}`);
    }
  }

  /**
   * Search for hotels/api/v1/ based on various criteria
   */
  async searchHotels(params: IHotelSearchParams): Promise<IHotelListResponse> {
    try {
      console.log('Searching hotels/api/v1/ with params:', params);
      
      // Get token and add to request if available
      const token = typeof window !== 'undefined' ? localStorage.getItem('amr_auth_token') : null;
      const headers: Record<string, string> = {};
      
      if (token) {
        // Use correct format: "Token <token>" instead of "Bearer <token>"
        headers['Authorization'] = `Token ${token}`;
      }
      
      const response = await apiClient.get<IHotelListResponse>('/hotels/api/v1//search/', { 
        params,
        headers
      });
      console.log(`Hotel search API response status: ${response.status}`);
      console.log(`Found ${response.data.results.length} hotels/api/v1/ matching search criteria`);
      
      return response.data;
    } catch (error: any) {
      // Check if this is an authentication error
      if (error.response?.status === 401) {
        console.error("Authentication failed when searching hotels/api/v1/ API:", error.message);
        // Try public endpoint
        try {
          console.log("Attempting to access public hotel search endpoint");
          const fallbackResponse = await apiClient.get<IHotelListResponse>('/hotels/api/v1//public/search/', { params });
          return fallbackResponse.data;
        } catch (fallbackError) {
          console.error("Fallback hotel search request failed:", fallbackError);
          throw new Error(`Authentication error when searching hotels/api/v1/: ${error.message}`);
        }
      }
      // Re-throw other errors with improved message
      console.error("Error searching hotels/api/v1/:", error);
      throw new Error(`Failed to search hotels/api/v1/: ${error.message}`);
    }
  }
  
  /**
   * Get featured hotels/api/v1/
   */
  async getFeaturedHotels(limit?: number, filters?: { city?: string }): Promise<IHotel[]> {
    try {
      console.log('🏨 Fetching featured hotels/api/v1/ from backend API');
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
      const fullUrl = `${baseUrl}/hotels/api/v1//api/v1/?${queryParams.toString()}`;
      console.log(`[${requestId}] Making request to: ${fullUrl}`);
      
      const startTime = Date.now();
      const response = await apiClient.get('/hotels/api/v1/', {
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
          console.log(`[${requestId}] Got ${data.results.length} /hotels/api/v1/ from API`);
          
          if (data.results.length > 0) {
            // Return the hotels/api/v1/ from the response
            return data.results;
          } else {
            console.log(`[${requestId}] No hotels/api/v1/ found, trying public endpoint`);
            // If no featured hotels/api/v1/ found, try fetching from a public endpoint
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
      console.error('Error fetching featured /hotels/api/v1/:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      
      // No need to return mock data anymore - we'll let the error propagate
      throw error;
    }
  }
  
  /**
   * Get hotels/api/v1/ by city
   */
  async getHotelsByCity(city: string, limit?: number): Promise<IHotel[]> {
    try {
      console.log(`Fetching hotels/api/v1/ for city: ${city}, limit: ${limit || 'default'}`);
      
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
      
      const response = await apiClient.get<IHotelListResponse>('/hotels/api/v1//', { 
        params: { 
          city, 
          page: 1,
          page_size: limit 
        },
        headers
      });
      
      console.log(`Hotels API response status: ${response.status} ${response.statusText}`);
      console.log(`Found ${response.data.results.length} hotels/api/v1/ for ${city}`);
      
      return response.data.results;
    } catch (error: any) {
      // Check if this is an authentication error
      if (error.response?.status === 401) {
        console.error("Authentication failed when accessing hotels/api/v1/ by city API:", error.message);
        
        // Try to get hotels/api/v1/ without authentication as fallback
        console.log("Attempting to fetch hotels/api/v1/ without authentication as fallback");
        try {
          const fallbackResponse = await apiClient.get<IHotelListResponse>('/hotels/api/v1//public/', { 
            params: { 
              city, 
              page: 1,
              page_size: limit 
            }
          });
          
          console.log(`Fallback API response status: ${fallbackResponse.status}`);
          console.log(`Found ${fallbackResponse.data.results.length} hotels/api/v1/ from fallback endpoint`);
          
          return fallbackResponse.data.results;
        } catch (fallbackError) {
          console.error("Fallback hotel request also failed:", fallbackError);
          throw new Error(`Could not retrieve hotels/api/v1/ for ${city}: ${error.message}`);
        }
      }
      
      // Handle network errors
      if (error.code === 'ECONNABORTED' || !error.response) {
        console.error("Network error when fetching hotels/api/v1/ by city:", error);
        throw new Error(`Network error when fetching hotels/api/v1/ for ${city}. Please check your connection.`);
      }
      
      // Re-throw other errors with improved message
      console.error("Error fetching hotels/api/v1/ by city:", error);
      throw new Error(`Failed to retrieve hotels/api/v1/ for ${city}: ${error.message}`);
    }
  }

  /**
   * Get amenities for a specific hotel
   * @param hotelId - The ID of the hotel
   * @returns Promise with hotel amenities
   */
  async getHotelAmenities(hotelId: string): Promise<any[]> {
    try {
      console.log(`Fetching amenities for hotel ID: ${hotelId}`);
      
      // Get token for authentication
      const token = typeof window !== 'undefined' ? localStorage.getItem('amr_auth_token') : null;
      
      // Create headers with token if available
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Token ${token}`;
      }
      
      // Construct the URL - try hotel amenities endpoint
      const response = await apiClient.get(`/hotels/api/v1/${hotelId}/amenities/`, { 
        headers
      });
      
      console.log(`Hotel amenities API response status: ${response.status}`);
      
      // Return the data (could be array or object with results)
      return Array.isArray(response.data) ? response.data : 
             (response.data && response.data.results ? response.data.results : []);
    } catch (error: any) {
      // If first endpoint failed, fallback to the hotel details and extract amenities
      try {
        console.log(`Falling back to hotel details to extract amenities`);
        const hotelResponse = await apiClient.get(`/hotels/api/v1/${hotelId}/`, { 
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        if (hotelResponse.data && hotelResponse.data.amenities) {
          return hotelResponse.data.amenities;
        }
      } catch (fallbackError) {
        console.error('Fallback hotel amenities fetch failed:', fallbackError);
      }
      
      console.error('Get hotel amenities error:', error);
      // Return empty array instead of throwing to make UI more resilient
      return [];
    }
  }

  /**
   * Get hotel reservations for the logged-in user
   * @returns Promise with the user's reservations
   */
  async getUserHotelReservations(): Promise<any[]> {
    try {
      // Get authentication token - required for this endpoint
      const token = typeof window !== 'undefined' ? localStorage.getItem('amr_auth_token') : null;
      
      if (!token) {
        throw new Error('Authentication required to view your reservations');
      }
      
      // Create headers with token
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Token ${token}`
      };
      
      // Make API request to the reservations endpoint
      const response = await apiClient.get('/hotels/api/v1//api/v1/hotel-reservation/', { headers });
      
      console.log(`Retrieved ${response.data.results?.length} user reservations`);
      
      return response.data.results || [];
    } catch (error: any) {
      console.error('Get user hotel reservations error:', error);
      throw new Error(`Failed to retrieve your reservations: ${error.message}`);
    }
  }

  /**
   * Get amenities for a specific hotel
   * @param hotelId - The ID of the hotel
   * @returns Promise with hotel amenities
   */
  async getHotelAmenities(hotelId: string): Promise<any[]> {
    try {
      console.log(`Fetching amenities for hotel ID: ${hotelId}`);
      
      // Get token for authentication
      const token = typeof window !== 'undefined' ? localStorage.getItem('amr_auth_token') : null;
      
      // Create headers with token if available
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Token ${token}`;
      }
      
      // Construct the URL - try hotel amenities endpoint
      const response = await apiClient.get(`/hotels-public/${hotelId}/amenities/`, { 
        headers
      });
      
      console.log(`Hotel amenities API response status: ${response.status}`);
      
      // Return the data (could be array or object with results)
      return Array.isArray(response.data) ? response.data : 
             (response.data && response.data.results ? response.data.results : []);
    } catch (error: any) {
      // If first endpoint failed, fallback to the hotel details and extract amenities
      try {
        console.log(`Falling back to hotel details to extract amenities`);
        const hotelResponse = await apiClient.get(`/hotels-public/${hotelId}/`, { 
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        if (hotelResponse.data && hotelResponse.data.amenities) {
          return hotelResponse.data.amenities;
        }
      } catch (fallbackError) {
        console.error('Fallback hotel amenities fetch failed:', fallbackError);
      }
      
      console.error('Get hotel amenities error:', error);
      // Return empty array instead of throwing to make UI more resilient
      return [];
    }
  }
}

// Export a singleton instance
const hotelService = new HotelService();
export default hotelService; 