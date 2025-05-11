import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PaymentForm from '../PaymentForm';
import { Reservation } from '@/types/reservation';
import useTap from '@/hooks/useTap';
import { processPayment } from '@/services/paymentService';

// Mock external dependencies
jest.mock('@/hooks/useTap');
jest.mock('@/services/paymentService');
jest.mock('react-hot-toast');

// Mock reservation data
const mockReservation: Reservation = {
  id: 12345,
  check_in: '2023-07-15',
  check_out: '2023-07-20',
  room_type: 'Deluxe Suite',
  total_amount: 1250.00
};

// Mock token response
const mockTokenResponse = { id: 'test_token_123456' };

// Mock payment response
const mockPaymentResponse = {
  id: 'payment_123456',
  status: 'success',
  reservation_id: 12345,
  amount: 1250.00,
  payment_method: 'card',
  created_at: '2023-07-01T12:00:00Z'
};

describe('PaymentForm Component', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock useTap hook implementation
    (useTap as jest.Mock).mockReturnValue({
      tap: {},
      loading: false,
      error: null,
      createToken: jest.fn().mockResolvedValue(mockTokenResponse)
    });
    
    // Mock processPayment implementation
    (processPayment as jest.Mock).mockResolvedValue(mockPaymentResponse);
  });
  
  test('renders payment form correctly', () => {
    render(
      <PaymentForm
        reservation={mockReservation}
        onSuccess={jest.fn()}
        onError={jest.fn()}
      />
    );
    
    expect(screen.getByText('Payment Details')).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Cardholder Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Card Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Expiry Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/CVC/i)).toBeInTheDocument();
    expect(screen.getByText(`Pay $${mockReservation.total_amount.toFixed(2)}`)).toBeInTheDocument();
  });

  test('shows validation errors for incomplete form submission', async () => {
    render(
      <PaymentForm
        reservation={mockReservation}
        onSuccess={jest.fn()}
        onError={jest.fn()}
      />
    );
    
    // Submit form with empty fields
    fireEvent.click(screen.getByText(`Pay $${mockReservation.total_amount.toFixed(2)}`));
    
    await waitFor(() => {
      expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument();
      expect(screen.getByText(/Cardholder name must be at least 2 characters/i)).toBeInTheDocument();
    });
  });

  test('shows confirmation dialog on valid form submission', async () => {
    render(
      <PaymentForm
        reservation={mockReservation}
        onSuccess={jest.fn()}
        onError={jest.fn()}
      />
    );
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'test@example.com' }
    });
    
    fireEvent.change(screen.getByLabelText(/Cardholder Name/i), {
      target: { value: 'Test User' }
    });
    
    fireEvent.change(screen.getByLabelText(/Card Number/i), {
      target: { value: '4242424242424242' }
    });
    
    fireEvent.change(screen.getByLabelText(/Expiry Date/i), {
      target: { value: '12/25' }
    });
    
    fireEvent.change(screen.getByLabelText(/CVC/i), {
      target: { value: '123' }
    });
    
    // Submit form
    fireEvent.click(screen.getByText(`Pay $${mockReservation.total_amount.toFixed(2)}`));
    
    // Check for confirmation dialog
    await waitFor(() => {
      expect(screen.getByText(/Confirm Payment/i)).toBeInTheDocument();
      expect(screen.getByText(/You are about to make a payment of/i)).toBeInTheDocument();
      expect(screen.getByText(/Confirm Payment/i)).toBeInTheDocument();
      expect(screen.getByText(/Cancel/i)).toBeInTheDocument();
    });
  });

  test('processes payment when confirmation is accepted', async () => {
    const mockOnSuccess = jest.fn();
    
    render(
      <PaymentForm
        reservation={mockReservation}
        onSuccess={mockOnSuccess}
        onError={jest.fn()}
      />
    );
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'test@example.com' }
    });
    
    fireEvent.change(screen.getByLabelText(/Cardholder Name/i), {
      target: { value: 'Test User' }
    });
    
    fireEvent.change(screen.getByLabelText(/Card Number/i), {
      target: { value: '4242424242424242' }
    });
    
    fireEvent.change(screen.getByLabelText(/Expiry Date/i), {
      target: { value: '12/25' }
    });
    
    fireEvent.change(screen.getByLabelText(/CVC/i), {
      target: { value: '123' }
    });
    
    // Submit form
    fireEvent.click(screen.getByText(`Pay $${mockReservation.total_amount.toFixed(2)}`));
    
    // Confirm payment
    await waitFor(() => {
      fireEvent.click(screen.getByText(/Confirm Payment/i));
    });
    
    await waitFor(() => {
      expect(useTap().createToken).toHaveBeenCalled();
      expect(processPayment).toHaveBeenCalledWith(expect.objectContaining({
        reservation_id: mockReservation.id,
        amount: mockReservation.total_amount,
        payment_method: 'card',
        payment_token: mockTokenResponse.id,
      }));
      expect(mockOnSuccess).toHaveBeenCalledWith(mockPaymentResponse);
    });
  });
}); 