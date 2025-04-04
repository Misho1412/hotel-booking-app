import apiClient from '../apiConfig';
import {
  PaymentSchema,
  PaymentRequestSchema,
  PatchedPaymentRequestSchema,
  PaginatedPaymentListSchema
} from '../schemas';
import { validateRequest, validateResponse } from '../validation';
import { z } from 'zod';

// Interface for Payment entity
export interface Payment {
  id: string;
  reservationId: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: 'credit_card' | 'paypal' | 'bank_transfer';
  transactionId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Interface for creating a payment
export interface PaymentRequest {
  reservationId: string;
  amount: number;
  currency: string;
  paymentMethod: 'credit_card' | 'paypal' | 'bank_transfer';
  cardDetails?: {
    cardNumber: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
    nameOnCard: string;
  };
  paypalDetails?: {
    email: string;
    payerId?: string;
  };
  notes?: string;
}

// Interface for updating a payment
export interface PatchedPaymentRequest {
  amount?: number;
  currency?: string;
  status?: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod?: 'credit_card' | 'paypal' | 'bank_transfer';
  transactionId?: string;
  notes?: string;
}

// Interface for paginated payment list
export interface PaginatedPaymentList {
  count: number;
  next: string | null;
  previous: string | null;
  results: Payment[];
}

/**
 * Service for Payment related operations
 */
const paymentService = {
  /**
   * Get all payments for the current user
   * @param page - Optional page number for pagination
   * @param pageSize - Optional page size for pagination
   * @returns Promise with paginated payment listing
   */
  getUserPayments: async (page?: number, pageSize?: number): Promise<PaginatedPaymentList> => {
    try {
      // Get token for authentication
      const token = typeof window !== 'undefined' ? localStorage.getItem('amr_auth_token') : null;
      
      // Create headers with token if available
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Token ${token}`;
      }
      
      const response = await apiClient.get<PaginatedPaymentList>('/payments/user', { 
        params: { page, page_size: pageSize },
        headers
      });
      
      // Validate response data
      const validatedResponse = validateResponse(PaginatedPaymentListSchema, response.data);
      
      return validatedResponse as PaginatedPaymentList;
    } catch (error) {
      console.error('Get user payments error:', error);
      throw error;
    }
  },

  /**
   * Get a specific payment by ID
   * @param paymentId - The ID of the payment to retrieve
   * @returns Promise with payment details
   */
  getPayment: async (paymentId: string): Promise<Payment> => {
    try {
      // Get token for authentication
      const token = typeof window !== 'undefined' ? localStorage.getItem('amr_auth_token') : null;
      
      // Create headers with token if available
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Token ${token}`;
      }
      
      const response = await apiClient.get<Payment>(`/payments/${paymentId}`, { headers });
      
      // Validate response data
      const validatedResponse = validateResponse(PaymentSchema, response.data);
      
      return validatedResponse as Payment;
    } catch (error) {
      console.error('Get payment error:', error);
      throw error;
    }
  },

  /**
   * Create a new payment
   * @param paymentData - The data for the new payment
   * @returns Promise with created payment
   */
  createPayment: async (paymentData: PaymentRequest): Promise<Payment> => {
    try {
      // Validate request data
      const validatedPaymentData = validateRequest(PaymentRequestSchema, paymentData);
      
      // Get token for authentication
      const token = typeof window !== 'undefined' ? localStorage.getItem('amr_auth_token') : null;
      
      // Create headers with token if available
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Token ${token}`;
      }
      
      const response = await apiClient.post<Payment>('/payments', validatedPaymentData, { headers });
      
      // Validate response data
      const validatedResponse = validateResponse(PaymentSchema, response.data);
      
      return validatedResponse as Payment;
    } catch (error) {
      console.error('Create payment error:', error);
      throw error;
    }
  },

  /**
   * Update an existing payment
   * @param paymentId - The ID of the payment to update
   * @param paymentData - The data to update
   * @returns Promise with updated payment
   */
  updatePayment: async (paymentId: string, paymentData: PaymentRequest): Promise<Payment> => {
    try {
      // Validate request data
      const validatedPaymentData = validateRequest(PaymentRequestSchema, paymentData);
      
      const response = await apiClient.put<Payment>(`/payments/${paymentId}`, validatedPaymentData);
      
      // Validate response data
      const validatedResponse = validateResponse(PaymentSchema, response.data);
      
      return validatedResponse as Payment;
    } catch (error) {
      console.error('Update payment error:', error);
      throw error;
    }
  },

  /**
   * Partially update an existing payment
   * @param paymentId - The ID of the payment to update
   * @param paymentData - The partial data to update
   * @returns Promise with updated payment
   */
  patchPayment: async (paymentId: string, paymentData: PatchedPaymentRequest): Promise<Payment> => {
    try {
      // Validate request data
      const validatedPaymentData = validateRequest(PatchedPaymentRequestSchema, paymentData);
      
      const response = await apiClient.patch<Payment>(`/payments/${paymentId}`, validatedPaymentData);
      
      // Validate response data
      const validatedResponse = validateResponse(PaymentSchema, response.data);
      
      return validatedResponse as Payment;
    } catch (error) {
      console.error('Patch payment error:', error);
      throw error;
    }
  },

  /**
   * Delete a payment
   * @param paymentId - The ID of the payment to delete
   */
  deletePayment: async (paymentId: string): Promise<void> => {
    try {
      await apiClient.delete(`/payments/${paymentId}`);
    } catch (error) {
      console.error('Delete payment error:', error);
      throw error;
    }
  },

  /**
   * Get all payments for a specific reservation
   * @param reservationId - The ID of the reservation
   * @returns Promise with payments for the reservation
   */
  getReservationPayments: async (reservationId: string): Promise<Payment[]> => {
    try {
      const response = await apiClient.get<Payment[]>(`/payments/reservation/${reservationId}`);
      
      // Validate response data
      const validatedResponse = validateResponse(z.array(PaymentSchema), response.data);
      
      return validatedResponse as Payment[];
    } catch (error) {
      console.error('Get reservation payments error:', error);
      throw error;
    }
  },

  /**
   * Process a payment for a reservation
   * @param paymentData - The payment data
   * @returns Promise with processed payment
   */
  processPayment: async (paymentData: PaymentRequest): Promise<Payment> => {
    try {
      // Validate request data
      const validatedPaymentData = validateRequest(PaymentRequestSchema, paymentData);
      
      // Get token for authentication
      const token = typeof window !== 'undefined' ? localStorage.getItem('amr_auth_token') : null;
      
      // Create headers with token if available
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Token ${token}`;
      }
      
      const response = await apiClient.post<Payment>('/payments/process', validatedPaymentData, { headers });
      
      // Validate response data
      const validatedResponse = validateResponse(PaymentSchema, response.data);
      
      return validatedResponse as Payment;
    } catch (error) {
      console.error('Process payment error:', error);
      throw error;
    }
  },

  /**
   * Request a refund for a payment
   * @param paymentId - The ID of the payment to refund
   * @param reason - Optional reason for the refund
   * @returns Promise with refunded payment
   */
  requestRefund: async (paymentId: string, reason?: string): Promise<Payment> => {
    try {
      const response = await apiClient.post<Payment>(`/payments/${paymentId}/refund`, { reason });
      
      // Validate response data
      const validatedResponse = validateResponse(PaymentSchema, response.data);
      
      return validatedResponse as Payment;
    } catch (error) {
      console.error('Request refund error:', error);
      throw error;
    }
  },

  /**
   * Verify a payment
   * @param paymentId - The ID of the payment to verify
   * @returns Promise with verified payment
   */
  verifyPayment: async (paymentId: string): Promise<Payment> => {
    try {
      const response = await apiClient.post<Payment>(`/payments/${paymentId}/verify`);
      
      // Validate response data
      const validatedResponse = validateResponse(PaymentSchema, response.data);
      
      return validatedResponse as Payment;
    } catch (error) {
      console.error('Verify payment error:', error);
      throw error;
    }
  },
};

export default paymentService; 