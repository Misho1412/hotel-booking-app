import { ApiError } from "../apiErrors";
import { getTokenFromCookie } from "@/lib/auth/authUtils";
import apiClient from "../apiConfig";

export interface HotelChain {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  website?: string;
  foundedYear?: number;
  headquarters?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedHotelChainList {
  count: number;
  next: string | null;
  previous: string | null;
  results: HotelChain[];
}

/**
 * Hotel Chain Service for managing hotel chain data
 */
class HotelChainService {
  /**
   * Get all hotel chains
   */
  async getAllHotelChains(): Promise<PaginatedHotelChainList> {
    try {
      console.log('Fetching all hotel chains');
      const response = await apiClient.get<PaginatedHotelChainList>(
        '/hotels/api/v1/hotel-chains/',
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log(`Retrieved ${response.data.results?.length} hotel chains`);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching hotel chains:", error);
      if (error.response) {
        throw new ApiError(
          error.response.data?.detail || "Failed to fetch hotel chains",
          error.response.status
        );
      }
      throw new Error("Failed to fetch hotel chains");
    }
  }

  /**
   * Get hotel chain by ID
   */
  async getHotelChainById(id: string): Promise<HotelChain> {
    try {
      console.log(`Fetching hotel chain with ID: ${id}`);
      const response = await apiClient.get<HotelChain>(
        `/hotels/api/v1/hotel-chains/${id}/`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching hotel chain with ID ${id}:`, error);
      if (error.response) {
        throw new ApiError(
          error.response.data?.detail || `Failed to fetch hotel chain with ID ${id}`,
          error.response.status
        );
      }
      throw new Error(`Failed to fetch hotel chain with ID ${id}`);
    }
  }

  /**
   * Get hotels for a specific chain
   */
  async getHotelsByChain(chainId: string): Promise<any> {
    try {
      console.log(`Fetching hotels for chain ID: ${chainId}`);
      const token = getTokenFromCookie();
      
      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      };
      
      if (token) {
        headers["Authorization"] = `Token ${token}`;
      }
      
      const response = await apiClient.get(
        `/hotels/api/v1/`,
        {
          params: { hotel_chain: chainId },
          headers
        }
      );
      
      console.log(`Retrieved ${response.data.results?.length} hotels for chain ${chainId}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching hotels for chain ${chainId}:`, error);
      if (error.response) {
        throw new ApiError(
          error.response.data?.detail || `Failed to fetch hotels for chain ${chainId}`,
          error.response.status
        );
      }
      throw new Error(`Failed to fetch hotels for chain ${chainId}`);
    }
  }
}

// Create and export an instance of the service
const hotelChainService = new HotelChainService();
export default hotelChainService; 