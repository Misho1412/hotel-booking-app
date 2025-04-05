import apiClient from '../apiConfig';
import {
  ReservationSchema,
  ReservationRequestSchema,
  PatchedReservationRequestSchema,
  PaginatedReservationListSchema
} from '../schemas';
import { validateRequest, validateResponse } from '../validation';
import { z } from 'zod';
import { Room, RoomType } from './roomService';

// Interface for Reservation entity
export interface Reservation {
  id: string;
  userId: string;
  hotelId: string;
  roomId: string;
  roomTypeId: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  guestDetails: {
    fullName: string;
    email: string;
    phoneNumber: string;
    specialRequests?: string;
  };
  paymentStatus: 'pending' | 'partial' | 'paid' | 'refunded';
  room?: Room;
  roomType?: RoomType;
  createdAt: string;
  updatedAt: string;
}

// Interface for creating a reservation (backend format)
export interface ReservationBackendRequest {
  room_id: string;
  childs: string;
  adults: string;
  price_per_night: string;
  payment_method: string;
  currency: string;
  special_requests: string;
  check_in_date: string;
  check_out_date: string;
  notes?: string;
}

// Interface for creating a reservation (frontend format)
export interface ReservationRequest {
  hotelId: string;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  specialRequests?: string;
  guestDetails: {
    fullName: string;
    email: string;
    phoneNumber: string;
    specialRequests?: string;
  };
}

// Interface for updating a reservation
export interface PatchedReservationRequest {
  checkInDate?: string;
  checkOutDate?: string;
  numberOfGuests?: number;
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  guestDetails?: {
    fullName?: string;
    email?: string;
    phoneNumber?: string;
    specialRequests?: string;
  };
  paymentStatus?: 'pending' | 'partial' | 'paid' | 'refunded';
}

// Interface for paginated reservation list
export interface PaginatedReservationList {
  count: number;
  next: string | null;
  previous: string | null;
  results: Reservation[];
}

/**
 * Service for Reservation related operations
 */
const reservationService = {
  /**
   * Get all reservations for the current user
   * @param page - Optional page number for pagination
   * @param pageSize - Optional page size for pagination
   * @returns Promise with paginated reservation listing
   */
  getUserReservations: async (page?: number, pageSize?: number): Promise<any> => {
    try {
      
      // Get the token directly to make sure it's available
      const token = typeof window !== 'undefined' ? localStorage.getItem('amr_auth_token') : null;
      
      // Create headers with token if available
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Token ${token}`;
      } else {
        console.error('No authentication token available for viewing reservations');
        throw new Error('Authentication required to view your reservations');
      }
      
      const response = await apiClient.get('/reservations/user/', {
        params: { page, page_size: pageSize },
        headers
      });
      
      console.log(`User reservations retrieved, count: ${response.data.results?.length || 0}`);
      
      // Return the actual response data without strict type validation
      return response.data;
    } catch (error: any) {
      console.error('Get user reservations error:', error);
      
      // Handle authentication errors
      if (error.response?.status === 401) {
        throw new Error('Authentication required to view your reservations');
      }
      
      throw new Error(`Failed to retrieve your reservations: ${error.message}`);
    }
  },

  /**
   * Get a specific reservation by ID
   * @param reservationId - The ID of the reservation to retrieve
   * @returns Promise with reservation details
   */
  getReservation: async (reservationId: string): Promise<any> => {
    try {
      console.log(`Fetching reservation details for ID: ${reservationId}`);
      
      // Get the token directly to make sure it's available
      const token = typeof window !== 'undefined' ? localStorage.getItem('amr_auth_token') : null;
      
      // Create headers with token if available
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Token ${token}`;
      } else {
        console.error('No authentication token available for viewing reservation');
        throw new Error('Authentication required to view reservation details');
      }
      
      const response = await apiClient.get(`/reservations/${reservationId}/`, { headers });
      
      console.log(`Reservation details retrieved, status: ${response.status}`);
      
      // Return the actual response data without strict type validation
      return response.data;
    } catch (error: any) {
      console.error('Get reservation error:', error);
      
      // Handle authentication errors
      if (error.response?.status === 401) {
        throw new Error('Authentication required to view reservation details');
      } else if (error.response?.status === 404) {
        throw new Error(`Reservation #${reservationId} not found`);
      }
      
      throw new Error(`Failed to retrieve reservation: ${error.message}`);
    }
  },

  /**
   * Create a new reservation
   * @param reservationData - The data for the new reservation (can be in backend or frontend format)
   * @returns Promise with created reservation
   */
  createReservation: async (reservationData: ReservationRequest | ReservationBackendRequest): Promise<Reservation> => {
    try {
      // Get the token directly to make sure it's available
      const token = typeof window !== 'undefined' ? localStorage.getItem('amr_auth_token') : null;
      
      // Create headers with token if available
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Token ${token}`;
      }
      
      let mappedReservationData;

      // Check if the data is already in the backend format
      if ('room_id' in reservationData) {
        console.log('Using backend reservation format:', reservationData);
        mappedReservationData = reservationData;
      } else {
        // Map frontend field names to API expected field names
        console.log('Converting frontend reservation format to backend format');
        const frontendData = reservationData as ReservationRequest;

        // Format dates from YYYY-MM-DD to DD/MM/YYYY
        const formatDateForBE = (dateStr: string) => {
          const [year, month, day] = dateStr.split('-');
          return `${day}/${month}/${year}`;
        };

        mappedReservationData = {
          room_id: frontendData.roomId,
          childs: "0", // Default value
          adults: frontendData.guestCount ? frontendData.guestCount.toString() : "1",
          price_per_night: "0", // This should be set by the API
          payment_method: "credit_card", // Default value
          currency: "USD",
          special_requests: frontendData.specialRequests || "",
          check_in_date: formatDateForBE(frontendData.checkInDate),
          check_out_date: formatDateForBE(frontendData.checkOutDate),
          notes: "Booking from website" // Default notes
        };
      }

      const response = await apiClient.post<any>('/reservation/', mappedReservationData, { headers });
      
      console.log('Create reservation response:', response.status);
      
      // Validate response data - using unknown as intermediary
      // const validatedResponse = validateResponse(ReservationSchema, response.data as unknown);
      
      // return validatedResponse as unknown as Reservation;
      return response.data;
    } catch (error: any) {
      console.error('Create reservation error:', error);
      throw new Error(`Failed to create reservation: ${error.message}`);
    }
  },

  /**
   * Update a reservation
   * @param reservationId - The ID of the reservation to update
   * @param reservationData - The data to update the reservation with
   * @returns Promise with updated reservation
   */
  updateReservation: async (reservationId: string, reservationData: ReservationRequest): Promise<Reservation> => {
    try {
      // Validate request data
      const validatedReservationData = validateRequest(ReservationRequestSchema, reservationData);
      
      // Get the token directly to make sure it's available
      const token = typeof window !== 'undefined' ? localStorage.getItem('amr_auth_token') : null;
      
      // Create headers with token if available
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Token ${token}`;
      }
      
      // Map frontend field names to API expected field names
      const mappedReservationData = {
        ...validatedReservationData,
        check_in_date: validatedReservationData.checkInDate,
        check_out_date: validatedReservationData.checkOutDate,
        number_of_guests: validatedReservationData.numberOfGuests,
      };

      // Remove the original properties to avoid duplication
      delete (mappedReservationData as any).checkInDate;
      delete (mappedReservationData as any).checkOutDate;
      delete (mappedReservationData as any).numberOfGuests;

      const response = await apiClient.put<any>(`/reservations/${reservationId}/`, mappedReservationData, { headers });
      
      console.log('Update reservation response:', response.status);
      
      // Validate response data - using unknown as intermediary
      // const validatedResponse = validateResponse(ReservationSchema, response.data as unknown);
      
      // return validatedResponse as unknown as Reservation;
      return response.data;
    } catch (error: any) {
      console.error('Update reservation error:', error);
      throw new Error(`Failed to update reservation: ${error.message}`);
    }
  },

  /**
   * Partially update a reservation
   * @param reservationId - The ID of the reservation to update
   * @param reservationData - The partial data to update
   * @returns Promise with updated reservation
   */
  patchReservation: async (reservationId: string, reservationData: PatchedReservationRequest): Promise<Reservation> => {
    try {
      // Validate request data
      const validatedReservationData = validateRequest(PatchedReservationRequestSchema, reservationData);
      
      // Get the token directly to make sure it's available
      const token = typeof window !== 'undefined' ? localStorage.getItem('amr_auth_token') : null;
      
      // Create headers with token if available
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Token ${token}`;
      }
      
      const response = await apiClient.patch<any>(`/reservations/${reservationId}/`, validatedReservationData, { headers });
      
      console.log('Patch reservation response:', response.status);
      
      // Validate response data - using unknown as intermediary
      // const validatedResponse = validateResponse(ReservationSchema, response.data as unknown);
      
      // return validatedResponse as unknown as Reservation;
      return response.data;
    } catch (error: any) {
      console.error('Patch reservation error:', error);
      throw new Error(`Failed to patch reservation: ${error.message}`);
    }
  },

  /**
   * Delete a reservation
   * @param reservationId - The ID of the reservation to delete
   */
  deleteReservation: async (reservationId: string): Promise<void> => {
    try {
      // Get the token directly to make sure it's available
      const token = typeof window !== 'undefined' ? localStorage.getItem('amr_auth_token') : null;
      
      // Create headers with token if available
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Token ${token}`;
      }
      
      await apiClient.delete(`/reservations/${reservationId}/`, { headers });
    } catch (error: any) {
      console.error('Delete reservation error:', error);
      throw new Error(`Failed to delete reservation: ${error.message}`);
    }
  },

  /**
   * Get reservations for a specific hotel
   * @param hotelId - The ID of the hotel
   * @param page - Optional page number for pagination
   * @param pageSize - Optional page size for pagination
   * @returns Promise with paginated reservation listing
   */
  getHotelReservations: async (hotelId: string, page?: number, pageSize?: number): Promise<PaginatedReservationList> => {
    try {
      const response = await apiClient.get<any>(`/reservations/hotel/${hotelId}/`, {
        params: { page, page_size: pageSize }
      });
      
      console.log('Get hotel reservations response:', response.status);
      
      // Validate response data - using unknown as intermediary
      // const validatedResponse = validateResponse(PaginatedReservationListSchema, response.data as unknown);
      
      // return validatedResponse as unknown as PaginatedReservationList;
      return response.data;
    } catch (error: any) {
      console.error('Get hotel reservations error:', error);
      throw new Error(`Failed to retrieve reservations for hotel ${hotelId}: ${error.message}`);
    }
  },

  /**
   * Get reservations for a specific room
   * @param roomId - The ID of the room
   * @param page - Optional page number for pagination
   * @param pageSize - Optional page size for pagination
   * @returns Promise with paginated reservation listing
   */
  getRoomReservations: async (roomId: string, page?: number, pageSize?: number): Promise<PaginatedReservationList> => {
    try {
      const response = await apiClient.get<any>(`/reservations/room/${roomId}/`, {
        params: { page, page_size: pageSize }
      });
      
      console.log('Get room reservations response:', response.status);
      
      // Validate response data - using unknown as intermediary
      // const validatedResponse = validateResponse(PaginatedReservationListSchema, response.data as unknown);
      
      // return validatedResponse as unknown as PaginatedReservationList;
      return response.data;
    } catch (error: any) {
      console.error('Get room reservations error:', error);
      throw new Error(`Failed to retrieve reservations for room ${roomId}: ${error.message}`);
    }
  },

  /**
   * Cancel a reservation
   * @param reservationId - The ID of the reservation to cancel
   * @param reason - Optional reason for cancellation
   * @returns Promise with cancelled reservation
   */
  cancelReservation: async (reservationId: string, reason?: string): Promise<Reservation> => {
    try {
      const response = await apiClient.post<any>(`/reservations/${reservationId}/cancel/`, 
        reason ? { reason } : undefined
      );
      
      console.log('Cancel reservation response:', response.status);
      
      // Validate response data - using unknown as intermediary
      // const validatedResponse = validateResponse(ReservationSchema, response.data as unknown);
      
      // return validatedResponse as unknown as Reservation;
      return response.data;
    } catch (error: any) {
      console.error('Cancel reservation error:', error);
      throw new Error(`Failed to cancel reservation ${reservationId}: ${error.message}`);
    }
  },
};

export default reservationService; 