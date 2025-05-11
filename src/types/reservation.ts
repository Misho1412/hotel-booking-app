export interface Reservation {
  id: number;
  guest_name: string;
  check_in_date: string;
  check_out_date: string;
  number_of_guests: number;
  total_price: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  hotel_name?: string;
  room_type?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentFormData {
  cardholderName: string;
  email: string;
  phone?: string;
}

export interface PaymentResponse {
  id: string;
  status: 'success' | 'failed' | 'pending';
  amount: number;
  currency: string;
  payment_method: string;
  created_at: string;
  transaction_id?: string;
  error_message?: string;
}

export interface PaymentErrorResponse {
  error: string;
  message: string;
  status: number;
}

export interface PaymentFormValues {
  cardholderName: string;
  email: string;
  phone?: string;
  cardNumber: string;
  expiryDate: string;
  cvc: string;
} 