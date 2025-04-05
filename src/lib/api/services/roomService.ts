import apiClient from '../apiConfig';
import {
  RoomSchema,
  RoomRequestSchema,
  PatchedRoomRequestSchema,
  RoomTypeSchema,
  RoomTypeRequestSchema,
  PatchedRoomTypeRequestSchema,
  RoomRateSchema,
  RoomRateRequestSchema,
  PatchedRoomRateRequestSchema,
  PaginatedRoomListSchema,
  PaginatedRoomTypeListSchema,
  PaginatedRoomRateListSchema
} from '../schemas';
import { validateRequest, validateResponse } from '../validation';
import { z } from 'zod';

// Interface for Room entity
export interface Room {
  id: string;
  hotelId: string;
  roomTypeId: string;
  roomNumber: string;
  floor: string;
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  description?: string;
  capacity: number;
  images?: string[];
  amenities?: string[];
  createdAt: string;
  updatedAt: string;
  roomType?: RoomType;
}

// Interface for Room Type entity
export interface RoomType {
  id: string;
  hotelId: string;
  name: string;
  description?: string;
  capacity: number;
  defaultPrice: number;
  currency: string;
  images?: string[];
  amenities?: string[];
  createdAt: string;
  updatedAt: string;
}

// Interface for Room Rate entity
export interface RoomRate {
  id: string;
  roomTypeId: string;
  startDate: string;
  endDate: string;
  price: number;
  currency: string;
  isPromotion: boolean;
  promotionName?: string;
  promotionDescription?: string;
  createdAt: string;
  updatedAt: string;
}

// Interface for creating a room
export interface RoomRequest {
  hotelId: string;
  roomTypeId: string;
  roomNumber: string;
  floor: string;
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  description?: string;
  capacity: number;
  images?: string[];
  amenities?: string[];
}

// Interface for updating a room
export interface PatchedRoomRequest {
  roomTypeId?: string;
  roomNumber?: string;
  floor?: string;
  status?: 'available' | 'occupied' | 'maintenance' | 'reserved';
  description?: string;
  capacity?: number;
  images?: string[];
  amenities?: string[];
}

// Interface for creating a room type
export interface RoomTypeRequest {
  hotelId: string;
  name: string;
  description?: string;
  capacity: number;
  defaultPrice: number;
  currency: string;
  images?: string[];
  amenities?: string[];
}

// Interface for updating a room type
export interface PatchedRoomTypeRequest {
  name?: string;
  description?: string;
  capacity?: number;
  defaultPrice?: number;
  currency?: string;
  images?: string[];
  amenities?: string[];
}

// Interface for creating a room rate
export interface RoomRateRequest {
  roomTypeId: string;
  startDate: string;
  endDate: string;
  price: number;
  currency: string;
  isPromotion?: boolean;
  promotionName?: string;
  promotionDescription?: string;
}

// Interface for updating a room rate
export interface PatchedRoomRateRequest {
  startDate?: string;
  endDate?: string;
  price?: number;
  currency?: string;
  isPromotion?: boolean;
  promotionName?: string;
  promotionDescription?: string;
}

// Interface for paginated room list
export interface PaginatedRoomList {
  count: number;
  next: string | null;
  previous: string | null;
  results: Room[];
}

// Interface for paginated room type list
export interface PaginatedRoomTypeList {
  count: number;
  next: string | null;
  previous: string | null;
  results: RoomType[];
}

// Interface for paginated room rate list
export interface PaginatedRoomRateList {
  count: number;
  next: string | null;
  previous: string | null;
  results: RoomRate[];
}

// Interface for room availability params
export interface RoomAvailabilityParams {
  hotelId: string;
  checkInDate: string;
  checkOutDate: string;
  guestCount?: number;
}

// Interface for room availability response
export interface RoomAvailabilityResponse {
  available: boolean;
  rooms: Room[];
  roomTypes: RoomType[];
}

/**
 * Service for Room related operations
 */
const roomService = {
  /**
   * Get rooms for a specific hotel
   * @param hotelId - The ID of the hotel
   * @param page - Optional page number for pagination
   * @param pageSize - Optional page size for pagination
   * @returns Promise with paginated room listing
   */
  getHotelRooms: async (hotelId: string, page?: number, pageSize?: number): Promise<PaginatedRoomList> => {
    try {
      console.log(`Fetching rooms for hotel ID: ${hotelId}, page: ${page}, pageSize: ${pageSize}`);
      
      // Get the token directly to make sure it's available
      const token = typeof window !== 'undefined' ? localStorage.getItem('amr_auth_token') : null;
      console.log(`Authentication token available: ${!!token}`);
      
      // Create headers with token if available
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await apiClient.get<PaginatedRoomList>(`/rooms/`, { 
        params: { hotel_id: hotelId, page, page_size: pageSize },
        headers
      });
      
      console.log(`Rooms API response status: ${response.status}`);
      console.log(`Retrieved ${response.data.results.length} rooms for hotel ${hotelId}`);
      
      // Validate response data
      const validatedResponse = validateResponse(PaginatedRoomListSchema, response.data);
      
      return validatedResponse as PaginatedRoomList;
    } catch (error: any) {
      console.error('Get hotel rooms error:', error);
      
      // Handle authentication errors
      if (error.response?.status === 401) {
        console.error("Authentication failed when accessing rooms API");
        throw new Error("Authentication required to access room information");
      }
      
      throw new Error(`Failed to retrieve rooms for hotel ${hotelId}: ${error.message}`);
    }
  },

  /**
   * Get a specific room by ID
   * @param roomId - The ID of the room to retrieve
   * @returns Promise with room details
   */
  getRoom: async (roomId: string): Promise<Room> => {
    try {
      console.log(`Fetching room details for ID: ${roomId}`);
      
      // Get the token directly to make sure it's available
      const token = typeof window !== 'undefined' ? localStorage.getItem('amr_auth_token') : null;
      console.log(`Authentication token available: ${!!token}`);
      
      // Create headers with token if available
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await apiClient.get<Room>(`/rooms/${roomId}/`, {
        headers
      });
      
      console.log(`Room API response status: ${response.status}`);
      
      // Validate response data
      const validatedResponse = validateResponse(RoomSchema, response.data);
      
      return validatedResponse as Room;
    } catch (error: any) {
      console.error('Get room error:', error);
      
      // Handle authentication errors
      if (error.response?.status === 401) {
        console.error("Authentication failed when accessing room details API");
        throw new Error("Authentication required to access room information");
      }
      
      throw new Error(`Failed to retrieve room ${roomId}: ${error.message}`);
    }
  },

  /**
   * Create a new room
   * @param roomData - The data for the new room
   * @returns Promise with created room
   */
  createRoom: async (roomData: RoomRequest): Promise<Room> => {
    try {
      // Validate request data
      const validatedRoomData = validateRequest(RoomRequestSchema, roomData);
      
      const response = await apiClient.post<Room>('/rooms', validatedRoomData);
      
      // Validate response data
      const validatedResponse = validateResponse(RoomSchema, response.data);
      
      return validatedResponse as Room;
    } catch (error) {
      console.error('Create room error:', error);
      throw error;
    }
  },

  /**
   * Update an existing room
   * @param roomId - The ID of the room to update
   * @param roomData - The data to update
   * @returns Promise with updated room
   */
  updateRoom: async (roomId: string, roomData: RoomRequest): Promise<Room> => {
    try {
      // Validate request data
      const validatedRoomData = validateRequest(RoomRequestSchema, roomData);
      
      const response = await apiClient.put<Room>(`/rooms/${roomId}`, validatedRoomData);
      
      // Validate response data
      const validatedResponse = validateResponse(RoomSchema, response.data);
      
      return validatedResponse as Room;
    } catch (error) {
      console.error('Update room error:', error);
      throw error;
    }
  },

  /**
   * Partially update an existing room
   * @param roomId - The ID of the room to update
   * @param roomData - The partial data to update
   * @returns Promise with updated room
   */
  patchRoom: async (roomId: string, roomData: PatchedRoomRequest): Promise<Room> => {
    try {
      // Validate request data
      const validatedRoomData = validateRequest(PatchedRoomRequestSchema, roomData);
      
      const response = await apiClient.patch<Room>(`/rooms/${roomId}`, validatedRoomData);
      
      // Validate response data
      const validatedResponse = validateResponse(RoomSchema, response.data);
      
      return validatedResponse as Room;
    } catch (error) {
      console.error('Patch room error:', error);
      throw error;
    }
  },

  /**
   * Delete a room
   * @param roomId - The ID of the room to delete
   */
  deleteRoom: async (roomId: string): Promise<void> => {
    try {
      await apiClient.delete(`/rooms/${roomId}`);
    } catch (error) {
      console.error('Delete room error:', error);
      throw error;
    }
  },

  /**
   * Get room types for a specific hotel
   * @param hotelId - The ID of the hotel
   * @param page - Optional page number for pagination
   * @param pageSize - Optional page size for pagination
   * @returns Promise with paginated room type listing
   */
  getHotelRoomTypes: async (hotelId: string, page?: number, pageSize?: number): Promise<PaginatedRoomTypeList> => {
    try {
      const response = await apiClient.get<PaginatedRoomTypeList>(`/room-types`, { 
        params: { hotel_id: hotelId, page, page_size: pageSize } 
      });
      
      // Validate response data
      const validatedResponse = validateResponse(PaginatedRoomTypeListSchema, response.data);
      
      return validatedResponse as PaginatedRoomTypeList;
    } catch (error) {
      console.error('Get hotel room types error:', error);
      throw error;
    }
  },

  /**
   * Get a specific room type by ID
   * @param roomTypeId - The ID of the room type to retrieve
   * @returns Promise with room type details
   */
  getRoomType: async (roomTypeId: string): Promise<RoomType> => {
    try {
      const response = await apiClient.get<RoomType>(`/room-types/${roomTypeId}`);
      
      // Validate response data
      const validatedResponse = validateResponse(RoomTypeSchema, response.data);
      
      return validatedResponse as RoomType;
    } catch (error) {
      console.error('Get room type error:', error);
      throw error;
    }
  },

  /**
   * Create a new room type
   * @param roomTypeData - The data for the new room type
   * @returns Promise with created room type
   */
  createRoomType: async (roomTypeData: RoomTypeRequest): Promise<RoomType> => {
    try {
      // Validate request data
      const validatedRoomTypeData = validateRequest(RoomTypeRequestSchema, roomTypeData);
      
      const response = await apiClient.post<RoomType>('/room-types', validatedRoomTypeData);
      
      // Validate response data
      const validatedResponse = validateResponse(RoomTypeSchema, response.data);
      
      return validatedResponse as RoomType;
    } catch (error) {
      console.error('Create room type error:', error);
      throw error;
    }
  },

  /**
   * Update an existing room type
   * @param roomTypeId - The ID of the room type to update
   * @param roomTypeData - The data to update
   * @returns Promise with updated room type
   */
  updateRoomType: async (roomTypeId: string, roomTypeData: RoomTypeRequest): Promise<RoomType> => {
    try {
      // Validate request data
      const validatedRoomTypeData = validateRequest(RoomTypeRequestSchema, roomTypeData);
      
      const response = await apiClient.put<RoomType>(`/room-types/${roomTypeId}`, validatedRoomTypeData);
      
      // Validate response data
      const validatedResponse = validateResponse(RoomTypeSchema, response.data);
      
      return validatedResponse as RoomType;
    } catch (error) {
      console.error('Update room type error:', error);
      throw error;
    }
  },

  /**
   * Partially update an existing room type
   * @param roomTypeId - The ID of the room type to update
   * @param roomTypeData - The partial data to update
   * @returns Promise with updated room type
   */
  patchRoomType: async (roomTypeId: string, roomTypeData: PatchedRoomTypeRequest): Promise<RoomType> => {
    try {
      // Validate request data
      const validatedRoomTypeData = validateRequest(PatchedRoomTypeRequestSchema, roomTypeData);
      
      const response = await apiClient.patch<RoomType>(`/room-types/${roomTypeId}`, validatedRoomTypeData);
      
      // Validate response data
      const validatedResponse = validateResponse(RoomTypeSchema, response.data);
      
      return validatedResponse as RoomType;
    } catch (error) {
      console.error('Patch room type error:', error);
      throw error;
    }
  },

  /**
   * Delete a room type
   * @param roomTypeId - The ID of the room type to delete
   */
  deleteRoomType: async (roomTypeId: string): Promise<void> => {
    try {
      await apiClient.delete(`/room-types/${roomTypeId}`);
    } catch (error) {
      console.error('Delete room type error:', error);
      throw error;
    }
  },

  /**
   * Get room rates for a specific room type
   * @param roomTypeId - The ID of the room type
   * @param page - Optional page number for pagination
   * @param pageSize - Optional page size for pagination
   * @returns Promise with paginated room rate listing
   */
  getRoomTypeRates: async (roomTypeId: string, page?: number, pageSize?: number): Promise<PaginatedRoomRateList> => {
    try {
      const response = await apiClient.get<PaginatedRoomRateList>(`/room-rates`, {
        params: { room_type_id: roomTypeId, page, page_size: pageSize }
      });
      
      // Validate response data
      const validatedResponse = validateResponse(PaginatedRoomRateListSchema, response.data);
      
      return validatedResponse as PaginatedRoomRateList;
    } catch (error) {
      console.error('Get room type rates error:', error);
      throw error;
    }
  },

  /**
   * Get rates for a room type
   * @param roomTypeId - The ID of the room type
   * @param page - Page number for pagination
   * @param limit - Maximum number of items per page
   * @returns Promise with paginated room rates
   */
  getRoomRates: async (roomTypeId: string, page: number = 1, limit: number = 20): Promise<any> => {
    try {
      console.log(`Fetching rates for room type ID: ${roomTypeId}`);
      
      // Get the token directly to make sure it's available
      const token = typeof window !== 'undefined' ? localStorage.getItem('amr_auth_token') : null;
      
      // Create headers with token if available
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await apiClient.get(`/roomtypes/${roomTypeId}/rates`, {
        params: { page, limit },
        headers
      });
      
      console.log(`Room rates API response status: ${response.status}`);
      console.log(`Found ${response.data.results?.length || 0} rates for room type ${roomTypeId}`);
      
      // Return the actual response data without strict type validation
      // This avoids type errors when the API response structure doesn't match our interface exactly
      return response.data;
    } catch (error: any) {
      console.error('Get room rates error:', error);
      
      // Handle authentication errors
      if (error.response?.status === 401) {
        console.error("Authentication failed when accessing room rates API");
        throw new Error("Authentication required to access room rate information");
      }
      
      throw new Error(`Failed to retrieve rates for room type ${roomTypeId}: ${error.message}`);
    }
  },

  /**
   * Get a specific room rate by ID
   * @param rateId - The ID of the room rate to retrieve
   * @returns Promise with room rate details
   */
  getRoomRate: async (rateId: string): Promise<any> => {
    try {
      console.log(`Fetching rate details for ID: ${rateId}`);
      
      // Get the token directly to make sure it's available
      const token = typeof window !== 'undefined' ? localStorage.getItem('amr_auth_token') : null;
      
      // Create headers with token if available
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await apiClient.get(`/room-rates/${rateId}/`, {
        headers
      });
      
      console.log(`Room rate API response status: ${response.status}`);
      
      // Return the actual response data without strict type validation
      return response.data;
    } catch (error: any) {
      console.error('Get room rate error:', error);
      
      // Handle authentication errors
      if (error.response?.status === 401) {
        console.error("Authentication failed when accessing room rate API");
        throw new Error("Authentication required to access room rate information");
      }
      
      throw new Error(`Failed to retrieve room rate ${rateId}: ${error.message}`);
    }
  },

  /**
   * Create a new room rate
   * @param rateData - The data for the new room rate
   * @returns Promise with created room rate
   */
  createRoomRate: async (rateData: RoomRateRequest): Promise<any> => {
    try {
      console.log('Creating new room rate');
      
      // Validate request data
      const validatedRateData = validateRequest(RoomRateRequestSchema, rateData);
      
      const response = await apiClient.post(`/room-rates/`, validatedRateData);
      
      console.log(`Create room rate API response status: ${response.status}`);
      
      // Return the actual response data without strict type validation
      return response.data;
    } catch (error: any) {
      console.error('Create room rate error:', error);
      
      // Handle authentication errors
      if (error.response?.status === 401) {
        console.error("Authentication failed when creating room rate");
        throw new Error("Authentication required to create room rate");
      }
      
      throw new Error(`Failed to create room rate: ${error.message}`);
    }
  },

  /**
   * Update a room rate
   * @param rateId - The ID of the room rate to update
   * @param rateData - The data to update the room rate with
   * @returns Promise with updated room rate
   */
  updateRoomRate: async (rateId: string, rateData: RoomRateRequest): Promise<any> => {
    try {
      // Validate request data
      const validatedRateData = validateRequest(RoomRateRequestSchema, rateData);
      
      const response = await apiClient.put(`/room-rates/${rateId}/`, validatedRateData);
      
      console.log(`Update room rate API response status: ${response.status}`);
      
      // Return the actual response data without strict type validation
      return response.data;
    } catch (error: any) {
      console.error('Update room rate error:', error);
      throw new Error(`Failed to update room rate: ${error.message}`);
    }
  },

  /**
   * Partially update a room rate
   * @param rateId - The ID of the room rate to update
   * @param rateData - The partial data to update
   * @returns Promise with updated room rate
   */
  patchRoomRate: async (rateId: string, rateData: PatchedRoomRateRequest): Promise<any> => {
    try {
      // Validate request data
      const validatedRateData = validateRequest(PatchedRoomRateRequestSchema, rateData);
      
      const response = await apiClient.patch(`/room-rates/${rateId}/`, validatedRateData);
      
      console.log(`Patch room rate API response status: ${response.status}`);
      
      // Return the actual response data without strict type validation
      return response.data;
    } catch (error: any) {
      console.error('Patch room rate error:', error);
      throw new Error(`Failed to patch room rate: ${error.message}`);
    }
  },

  /**
   * Delete a room rate
   * @param rateId - The ID of the room rate to delete
   */
  deleteRoomRate: async (rateId: string): Promise<void> => {
    try {
      await apiClient.delete(`/room-rates/${rateId}`);
    } catch (error) {
      console.error('Delete room rate error:', error);
      throw error;
    }
  },

  /**
   * Check room availability for a specified date range
   * @param params - Parameters for checking availability
   * @returns Promise with availability information
   */
  checkRoomAvailability: async (params: RoomAvailabilityParams): Promise<RoomAvailabilityResponse> => {
    try {
      const response = await apiClient.post<RoomAvailabilityResponse>('/rooms/check-availability', params);
      
      // Validate response data
      const availabilitySchema = z.object({
        available: z.boolean(),
        rooms: z.array(RoomSchema),
        roomTypes: z.array(RoomTypeSchema)
      });
      
      const validatedResponse = validateResponse(availabilitySchema, response.data);
      
      return validatedResponse as RoomAvailabilityResponse;
    } catch (error) {
      console.error('Check room availability error:', error);
      throw error;
    }
  },

  /**
   * Get detailed information for a specific room
   * @param roomId - The ID of the room to retrieve detailed information for
   * @returns Promise with detailed room information
   */
  getRoomDetails: async (roomId: string): Promise<any> => {
    try {
      console.log(`Fetching detailed room information for ID: ${roomId}`);
      
      // Get the token directly to make sure it's available
      const token = typeof window !== 'undefined' ? localStorage.getItem('amr_auth_token') : null;
      console.log(`Authentication token available: ${!!token}`);
      
      // Create headers with token if available
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await apiClient.get(`/room-details/${roomId}/`, {
        headers
      });
      
      console.log(`Room details API response status: ${response.status}`);
      
      // Return the actual response data without strict type validation
      // This allows flexibility with the response structure
      return response.data;
    } catch (error: any) {
      console.error('Get room details error:', error);
      
      // Handle authentication errors
      if (error.response?.status === 401) {
        console.error("Authentication failed when accessing room details API");
        throw new Error("Authentication required to access detailed room information");
      }
      
      throw new Error(`Failed to retrieve detailed information for room ${roomId}: ${error.message}`);
    }
  },
};

export default roomService; 