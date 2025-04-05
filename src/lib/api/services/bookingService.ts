import apiClient from '../apiConfig';

/**
 * Booking Service for interacting with booking-related API endpoints
 * 
 * Note: This is a placeholder service for future implementation
 * when the booking endpoints are fully developed in the API
 */
class BookingService {
  /**
   * Create a new booking
   */
  async createBooking(bookingData: any): Promise<any> {
    // If in mock mode, return a successful booking response
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
      
      return {
        id: Math.floor(Math.random() * 1000000),
        status: 'confirmed',
        confirmation_code: `AMR-${Math.floor(Math.random() * 10000)}`,
        created_at: new Date().toISOString(),
        ...bookingData
      };
    }
    
    try {
      console.log('Creating new booking');
      
      // Get the token directly to make sure it's available
      const token = typeof window !== 'undefined' ? localStorage.getItem('amr_auth_token') : null;
      
      // Create headers with token if available
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        console.error('No authentication token available for creating booking');
        throw new Error('Authentication required to create a booking');
      }
      
      const response = await apiClient.post('/bookings/', bookingData, { headers });
      console.log(`Booking created successfully, status: ${response.status}`);
      
      return response.data;
    } catch (error: any) {
      console.error('Create booking error:', error);
      
      // Handle authentication errors
      if (error.response?.status === 401) {
        throw new Error('Authentication required to create a booking');
      }
      
      throw new Error(`Failed to create booking: ${error.message}`);
    }
  }
  
  /**
   * Get booking details
   */
  async getBooking(bookingId: number): Promise<any> {
    // If in mock mode, return a mock booking
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      
      return {
        id: bookingId,
        status: 'confirmed',
        confirmation_code: `AMR-${Math.floor(Math.random() * 10000)}`,
        created_at: new Date().toISOString(),
        check_in_date: '2023-12-01',
        check_out_date: '2023-12-05',
        guests: 2,
        hotel_id: 1,
        room_id: 1,
        total_price: 499.99
      };
    }
    
    try {
      console.log(`Fetching booking details for ID: ${bookingId}`);
      
      // Get the token directly to make sure it's available
      const token = typeof window !== 'undefined' ? localStorage.getItem('amr_auth_token') : null;
      
      // Create headers with token if available
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        console.error('No authentication token available for viewing booking');
        throw new Error('Authentication required to view booking details');
      }
      
      const response = await apiClient.get(`/bookings/${bookingId}/`, { headers });
      console.log(`Booking details retrieved successfully, status: ${response.status}`);
      
      return response.data;
    } catch (error: any) {
      console.error('Get booking error:', error);
      
      // Handle authentication errors
      if (error.response?.status === 401) {
        throw new Error('Authentication required to view booking details');
      } else if (error.response?.status === 404) {
        throw new Error(`Booking #${bookingId} not found`);
      }
      
      throw new Error(`Failed to retrieve booking: ${error.message}`);
    }
  }
  
  /**
   * Get user bookings
   */
  async getUserBookings(): Promise<any[]> {
    // If in mock mode, return a list of mock bookings
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
      await new Promise(resolve => setTimeout(resolve, 700)); // Simulate network delay
      
      return Array.from({ length: 3 }, (_, i) => ({
        id: i + 1,
        status: i === 0 ? 'confirmed' : i === 1 ? 'pending' : 'completed',
        confirmation_code: `AMR-${1000 + i}`,
        created_at: new Date().toISOString(),
        check_in_date: '2023-12-01',
        check_out_date: '2023-12-05',
        guests: 2,
        hotel_id: i + 1,
        room_id: i + 1,
        total_price: 350 + (i * 50)
      }));
    }
    
    try {
      console.log('Fetching user bookings');
      
      // Get the token directly to make sure it's available
      const token = typeof window !== 'undefined' ? localStorage.getItem('amr_auth_token') : null;
      
      // Create headers with token if available
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        console.error('No authentication token available for viewing bookings');
        throw new Error('Authentication required to view your bookings');
      }
      
      const response = await apiClient.get('/bookings/user/', { headers });
      console.log(`User bookings retrieved successfully, count: ${response.data.length || 0}`);
      
      return response.data;
    } catch (error: any) {
      console.error('Get user bookings error:', error);
      
      // Handle authentication errors
      if (error.response?.status === 401) {
        throw new Error('Authentication required to view your bookings');
      }
      
      throw new Error(`Failed to retrieve your bookings: ${error.message}`);
    }
  }
  
  /**
   * Cancel a booking
   */
  async cancelBooking(bookingId: number): Promise<any> {
    // If in mock mode, simulate a successful cancellation
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
      await new Promise(resolve => setTimeout(resolve, 600)); // Simulate network delay
      
      return {
        id: bookingId,
        status: 'cancelled',
        cancelled_at: new Date().toISOString()
      };
    }
    
    try {
      console.log(`Cancelling booking ID: ${bookingId}`);
      
      // Get the token directly to make sure it's available
      const token = typeof window !== 'undefined' ? localStorage.getItem('amr_auth_token') : null;
      
      // Create headers with token if available
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        console.error('No authentication token available for cancelling booking');
        throw new Error('Authentication required to cancel a booking');
      }
      
      const response = await apiClient.post(`/bookings/${bookingId}/cancel/`, {}, { headers });
      console.log(`Booking cancelled successfully, status: ${response.status}`);
      
      return response.data;
    } catch (error: any) {
      console.error('Cancel booking error:', error);
      
      // Handle authentication errors
      if (error.response?.status === 401) {
        throw new Error('Authentication required to cancel a booking');
      } else if (error.response?.status === 404) {
        throw new Error(`Booking #${bookingId} not found`);
      } else if (error.response?.status === 400) {
        throw new Error('This booking cannot be cancelled. It may be too late to cancel or already processed.');
      }
      
      throw new Error(`Failed to cancel booking: ${error.message}`);
    }
  }
}

// Export a singleton instance
const bookingService = new BookingService();
export default bookingService; 