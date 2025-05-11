import axios from 'axios';
import { PaymentResponse, PaymentErrorResponse } from '../types/reservation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bookingengine.onrender.com';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth headers
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    // Add CSRF token if available
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

interface ProcessPaymentParams {
  reservation_id: number;
  amount: number;
  payment_method: 'card';
  payment_token: string;
  customer_email: string;
  customer_name: string;
  customer_phone?: string;
}

export const processPayment = async (paymentData: ProcessPaymentParams): Promise<PaymentResponse> => {
  try {
    const response = await apiClient.post<PaymentResponse>('/payments/api/v1/', paymentData);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw error.response.data as PaymentErrorResponse;
    }
    throw {
      error: 'payment_failed',
      message: error.message || 'An error occurred while processing payment',
      status: error.response?.status || 500
    } as PaymentErrorResponse;
  }
};

export const verifyPayment = async (paymentId: string): Promise<PaymentResponse> => {
  try {
    const response = await apiClient.get<PaymentResponse>(`/payments/api/v1/${paymentId}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw error.response.data as PaymentErrorResponse;
    }
    throw {
      error: 'verification_failed',
      message: error.message || 'An error occurred while verifying payment',
      status: error.response?.status || 500
    } as PaymentErrorResponse;
  }
};

export default {
  processPayment,
  verifyPayment
}; 