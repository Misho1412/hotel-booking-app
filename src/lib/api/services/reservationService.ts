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
import axios from 'axios';

// Interface for Reservation entity
export interface Reservation {
  id: string;
  hotel?: {
    id: string;
    name: string;
  };
  hotelId: string;
  check_in: string;
  check_out: string;
  guests: number;
  total_price: number;
  status: string;
  created_at: string;
  updated_at: string;
}

// Interface for creating a reservation (backend format)
export interface ReservationBackendRequest {
  // Required fields as per the API schema
  hotel_id: string;
  room_type_id: string;
  room_view_id: string;
  num_rooms: string; // Number of rooms (typically "1")
  meal_plan_counts: Record<string, number>; // Format: { "meal_plan_id": quantity } 
  from_date: string; // Format should match API expectation (e.g., "YYYY-MM-DD")
  to_date: string; // Format should match API expectation (e.g., "YYYY-MM-DD")
  
  // Optional fields as per the API schema
  adults?: string;
  children?: string; // API expects "children" not "childs"
  special_requests?: string;
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
      // Check if the reservation ID is valid
      if (!reservationId || reservationId === 'undefined') {
        console.error('Invalid reservation ID:', reservationId);
        throw new Error('Invalid reservation ID. Cannot retrieve reservation details.');
      }

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
      
      // Use the specified endpoint /reservations/api/v1/{reservation_id}/
      const response = await apiClient.get(`/reservations/api/v1/${reservationId}/`, { headers });
      
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
  createReservation: async (reservationData: ReservationBackendRequest): Promise<any> => {
    try {
      console.log('Creating reservation with data:', reservationData);
      
      // Make sure all required fields are present
      const requiredFields = ['hotel_id', 'room_type_id', 'room_view_id', 'num_rooms', 'meal_plan_counts', 'from_date', 'to_date'];
      const missingFields = requiredFields.filter(field => !reservationData[field as keyof ReservationBackendRequest]);
      
      if (missingFields.length > 0) {
        console.error('Missing required fields for reservation:', missingFields);
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }
      
      const response = await apiClient.post('/reservations/api/v1/', reservationData);
      console.log('Reservation created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating reservation:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('API error response:', error.response.data);
        throw new Error(`Reservation creation failed: ${JSON.stringify(error.response.data)}`);
      }
      throw error;
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
        number_of_guests: validatedReservationData.guestCount,
      };

      // Remove the original properties to avoid duplication
      delete (mappedReservationData as any).checkInDate;
      delete (mappedReservationData as any).checkOutDate;
      delete (mappedReservationData as any).guestCount;

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