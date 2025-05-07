import apiClient from '../apiConfig';
import {
  UserSchema, 
  UserRequestSchema
} from '../schemas';
import { validateRequest, validateResponse } from '../validation';
import axios from 'axios';

// Interface for AuthTokenRequest schema
export interface AuthTokenRequest {
  email: string;
  password: string;
}

// Interface for AuthToken response
export interface AuthToken {
  token: string;
  refreshToken?: string;
  message?: string;
  tokens?: {
    access_token: string;
    refresh_token: string;
  };
}

// Interface for UserRegistrationRequest schema
export interface UserRegistrationRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber?: string;  // Optional field
}

// Interface for OTP verification request
export interface VerifyOTPRequest {
  email: string;
  otp: string;
}

// Interface for UserRequest schema
export interface UserRequest {
  id?: string;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

// Interface for User response
export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Authentication service for the AMR Booking API
 */
const authService = {
  /**
   * Login user and get authentication token
   * @param credentials - User credentials
   * @returns Promise with auth token
   */
  login: async (credentials: AuthTokenRequest): Promise<AuthToken> => {
    try {
      console.log('Attempting login with credentials:', { email: credentials.email });
      
      // Format the credentials according to the API requirements
      const formattedCredentials = {
        email: credentials.email,
        password: credentials.password,
      };
      
      console.log('Formatted login data:', { email: formattedCredentials.email });
      
      // Get the base URL from environment variable or apiClient
      const baseURL = process.env.NEXT_PUBLIC_AMR_API_URL || apiClient.defaults.baseURL || 'https://bookingengine.onrender.com/';
      const fullURL = `${baseURL}auth/api/v1/login/`;
      
      console.log('Making direct fetch POST request to:', fullURL);
      
      // Use direct fetch approach that works in TestLogin
      const response = await fetch(fullURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formattedCredentials)
      });
      
      console.log('Login response status:', response.status);
      
      // Get the response body
      const responseBody = await response.text();
      console.log('Response body length:', responseBody.length);
      
      // Parse the response body
      let data;
      try {
        data = JSON.parse(responseBody);
      } catch (e) {
        console.error('Error parsing response body:', e);
        throw new Error('Invalid response format from server');
      }
      
      if (!response.ok) {
        console.error('Login failed:', data);
        throw new Error(data.detail || data.non_field_errors?.join(', ') || JSON.stringify(data));
      }
      
      // Handle new token format (tokens.access_token and tokens.refresh_token)
      if (data.tokens && data.tokens.access_token) {
        console.log('Login successful, access token received');
        
        // Store the tokens in localStorage
        if (typeof window !== 'undefined') {
          // Log the token value (just first 10 chars for security)
          const accessTokenPreview = data.tokens.access_token.substring(0, 10) + "...";
          console.log('Access token received:', accessTokenPreview, 'Length:', data.tokens.access_token.length);
          
          // Store both tokens
          localStorage.setItem('amr_auth_token', data.tokens.access_token);
          localStorage.setItem('amr_refresh_token', data.tokens.refresh_token);
          console.log('Access and refresh tokens stored in localStorage');
          
          // Always use "Bearer" prefix for JWT tokens
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${data.tokens.access_token}`;
          
          // Set token in axios defaults too
          axios.defaults.headers.common['Authorization'] = `Bearer ${data.tokens.access_token}`;
          console.log('Access token set in API client and axios default headers with "Bearer" prefix');
          
          // Dispatch a storage event to notify other tabs/windows
          try {
            // Create and dispatch a custom event for same-tab communication
            const authEvent = new CustomEvent('auth-state-changed', { 
              detail: { isAuthenticated: true } 
            });
            window.dispatchEvent(authEvent);
            
            // This trick helps with cross-tab communication, as storage events
            // are only sent to other tabs/windows
            localStorage.setItem('auth_state_timestamp', Date.now().toString());
          } catch (error) {
            console.error('Error dispatching auth event:', error);
          }
        } else {
          console.warn('No token received from login response or not in browser environment');
        }
        
        // Return the tokens in a format compatible with the existing interface
        return { 
          token: data.tokens.access_token,
          refreshToken: data.tokens.refresh_token,
          message: data.message || 'Login successful'
        };
      } 
      // Handle legacy token format for backward compatibility
      else if (data.token) {
        console.log('Login successful with legacy token format');
        
        // Store the token in localStorage
        if (typeof window !== 'undefined') {
          // Log the token value (just first 10 chars for security)
          const tokenPreview = data.token.substring(0, 10) + "...";
          console.log('Token received:', tokenPreview, 'Length:', data.token.length);
          
          // Store raw token for flexibility
          localStorage.setItem('amr_auth_token', data.token);
          console.log('Token stored in localStorage');
          
          // Always use "Token" prefix for legacy tokens
          apiClient.defaults.headers.common['Authorization'] = `Token ${data.token}`;
          
          // Set token in axios defaults too
          axios.defaults.headers.common['Authorization'] = `Token ${data.token}`;
          console.log('Token set in API client and axios default headers with "Token" prefix');
          
          // Dispatch a storage event to notify other tabs/windows
          try {
            // Create and dispatch a custom event for same-tab communication
            const authEvent = new CustomEvent('auth-state-changed', { 
              detail: { isAuthenticated: true } 
            });
            window.dispatchEvent(authEvent);
            
            // This trick helps with cross-tab communication, as storage events
            // are only sent to other tabs/windows
            localStorage.setItem('auth_state_timestamp', Date.now().toString());
          } catch (error) {
            console.error('Error dispatching auth event:', error);
          }
        }
        
        return data;
      } else {
        throw new Error('No token found in the response');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Simply pass through the error message
      throw error;
    }
  },

  /**
   * Refresh the authentication token using the refresh token
   * @returns Promise with a new auth token
   */
  refreshToken: async (): Promise<AuthToken> => {
    try {
      // Get the current token and refresh token from localStorage
      const accessToken = localStorage.getItem('amr_auth_token');
      const refreshToken = localStorage.getItem('amr_refresh_token');
      
      if (!accessToken) {
        throw new Error('No authentication token found to refresh');
      }
      
      if (!refreshToken) {
        throw new Error('No refresh token found');
      }
      
      console.log('Attempting to refresh token');
      
      // Get the base URL from environment variable or apiClient
      const baseURL = process.env.NEXT_PUBLIC_AMR_API_URL || apiClient.defaults.baseURL || 'https://bookingengine.onrender.com/';
      const refreshURL = `${baseURL}auth/api/v1/refresh/`;
      
      console.log('Making refresh token request to:', refreshURL);
      
      // Use direct fetch approach to refresh the token
      const response = await fetch(refreshURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        // Send the refresh token in the body
        body: JSON.stringify({ refresh: refreshToken })
      });
      
      console.log('Refresh token response status:', response.status);
      
      // Get the response body
      const responseBody = await response.text();
      console.log('Response body length:', responseBody.length);
      
      // Parse the response body
      let data;
      try {
        data = JSON.parse(responseBody);
      } catch (e) {
        console.error('Error parsing refresh token response:', e);
        throw new Error('Invalid response format from server during token refresh');
      }
      
      if (!response.ok) {
        console.error('Token refresh failed:', data);
        throw new Error(data.detail || data.non_field_errors?.join(', ') || JSON.stringify(data));
      }
      
      console.log('Token refresh successful, new token received');
      
      // Handle different refresh token response formats
      // New format with tokens object containing access_token
      if (data.tokens && data.tokens.access_token) {
        // Store the new tokens in localStorage
        if (typeof window !== 'undefined') {
          // Log the token value (just first 10 chars for security)
          const accessTokenPreview = data.tokens.access_token.substring(0, 10) + "...";
          console.log('New access token received:', accessTokenPreview);
          
          // Store both tokens
          localStorage.setItem('amr_auth_token', data.tokens.access_token);
          
          // Only update refresh token if it's provided
          if (data.tokens.refresh_token) {
            localStorage.setItem('amr_refresh_token', data.tokens.refresh_token);
            console.log('New refresh token stored in localStorage');
          }
          
          // Always use "Bearer" prefix for JWT tokens
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${data.tokens.access_token}`;
          
          // Set token in axios defaults too
          axios.defaults.headers.common['Authorization'] = `Bearer ${data.tokens.access_token}`;
          console.log('New access token set in API headers with "Bearer" prefix');
          
          // Dispatch a storage event to notify other tabs/windows
          try {
            // Create and dispatch a custom event for same-tab communication
            const authEvent = new CustomEvent('auth-state-changed', { 
              detail: { isAuthenticated: true, isRefresh: true } 
            });
            window.dispatchEvent(authEvent);
            
            // This trick helps with cross-tab communication, as storage events
            // are only sent to other tabs/windows
            localStorage.setItem('auth_state_timestamp', Date.now().toString());
          } catch (error) {
            console.error('Error dispatching auth event after refresh:', error);
          }
        }
        
        // Return in format compatible with existing code
        return { 
          token: data.tokens.access_token,
          refreshToken: data.tokens.refresh_token || refreshToken
        };
      }
      // Legacy format with direct access token field
      else if (data.access || data.token) {
        const newToken = data.access || data.token;
        
        // Store the new token in localStorage
        if (typeof window !== 'undefined' && newToken) {
          // Log the token value (just first 10 chars for security)
          const tokenPreview = newToken.substring(0, 10) + "...";
          console.log('New token received:', tokenPreview, 'Length:', newToken.length);
          
          // Store raw token for flexibility
          localStorage.setItem('amr_auth_token', newToken);
          console.log('New token stored in localStorage');
          
          // Use appropriate prefix based on token format
          const isJWT = newToken.split('.').length === 3;
          const authHeader = isJWT ? `Bearer ${newToken}` : `Token ${newToken}`;
          
          // Always use appropriate prefix based on token type
          apiClient.defaults.headers.common['Authorization'] = authHeader;
          
          // Set token in axios defaults too
          axios.defaults.headers.common['Authorization'] = authHeader;
          console.log('New token set in API client and axios default headers');
          
          // Dispatch a storage event to notify other tabs/windows
          try {
            // Create and dispatch a custom event for same-tab communication
            const authEvent = new CustomEvent('auth-state-changed', { 
              detail: { isAuthenticated: true, isRefresh: true } 
            });
            window.dispatchEvent(authEvent);
            
            // This trick helps with cross-tab communication, as storage events
            // are only sent to other tabs/windows
            localStorage.setItem('auth_state_timestamp', Date.now().toString());
          } catch (error) {
            console.error('Error dispatching auth event after refresh:', error);
          }
        } else {
          console.warn('No token received from refresh token response or not in browser environment');
        }
        
        return data;
      } else {
        throw new Error('Invalid token refresh response format');
      }
    } catch (error: any) {
      console.error('Token refresh error:', error);
      
      // Check if the error is due to an expired refresh token
      if (error.response?.status === 401) {
        console.warn('Refresh token expired or invalid. User needs to log in again');
        // Remove any existing tokens from storage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('amr_auth_token');
          localStorage.removeItem('amr_refresh_token');
        }
        
        // Clear authorization headers
        delete apiClient.defaults.headers.common['Authorization'];
        delete axios.defaults.headers.common['Authorization'];
      }
      
      throw error;
    }
  },

  /**
   * Check if the access token needs to be refreshed (is about to expire)
   * This is a placeholder for token expiration check logic
   * @returns boolean indicating if token refresh is needed
   */
  shouldRefreshToken: (): boolean => {
    // In a real implementation, this would decode the JWT and check expiration
    // For simplicity, we'll just check if a token exists
    if (typeof window === 'undefined') return false;
    
    const token = localStorage.getItem('amr_auth_token');
    if (!token) return false;
    
    return true;
  },

  /**
   * Register a new user
   * @param userData - User registration data
   * @returns Promise with registered user
   */
  register: async (userData: UserRegistrationRequest): Promise<User> => {
    try {
      console.log('Attempting to register user:', { email: userData.email, name: userData.name });
      
      // Format the user data according to the API requirements
      const formattedData = {
        username: userData.name,
        email: userData.email,
        password: userData.password,
        confirm_password: userData.confirmPassword,
        phone_number: userData.phoneNumber || "",
      };
      
      console.log('Formatted registration data:', formattedData);
      
      // Get the base URL from apiClient
      const baseURL = apiClient.defaults.baseURL;
      const fullURL = `${baseURL}auth/api/v1/register/`;
      console.log('Making direct fetch POST request to:', fullURL);
      
      // Use fetch API directly with explicit method setting
      const response = await fetch(fullURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formattedData)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Registration API error:', response.status, errorData);
        throw new Error(
          errorData.detail || 
          errorData.message || 
          errorData.error || 
          `Registration failed with status ${response.status}`
        );
      }
      
      const data = await response.json();
      console.log('Registration response status:', response.status);
      console.log('Registration response data:', data);
      
      return data;
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Handle different error types
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        throw new Error('Network error. Please check your connection and try again.');
      }
      
      throw error;
    }
  },
  
  /**
   * Verify user's email with OTP
   * @param verifyData - Email and OTP data for verification
   * @returns Promise with verification result
   */
  verifyOtp: async (verifyData: VerifyOTPRequest): Promise<any> => {
    try {
      console.log('Attempting to verify OTP for email:', verifyData.email);
      
      // Get the base URL from apiClient
      const baseURL = process.env.NEXT_PUBLIC_AMR_API_URL || apiClient.defaults.baseURL || 'https://bookingengine.onrender.com/';
      const fullURL = `${baseURL}auth/api/v1/verify-otp/`;
      
      console.log('Making POST request to verify OTP:', fullURL);
      
      // Use fetch API directly with explicit method setting
      const response = await fetch(fullURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: verifyData.email,
          otp: verifyData.otp
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('OTP verification API error:', response.status, errorData);
        throw new Error(
          errorData.detail || 
          errorData.message || 
          errorData.error || 
          `OTP verification failed with status ${response.status}`
        );
      }
      
      const data = await response.json();
      console.log('OTP verification successful:', data);
      
      // If verification includes a token, store it
      if (data.token) {
        // Store token in localStorage
        localStorage.setItem('amr_auth_token', data.token);
        
        // Always use "Token" prefix for consistency with backend expectations
        apiClient.defaults.headers.common['Authorization'] = `Token ${data.token}`;
        axios.defaults.headers.common['Authorization'] = `Token ${data.token}`;
        console.log('Token set in API headers after verification with "Token" prefix');
      }
      
      return data;
    } catch (error: any) {
      console.error('OTP verification error:', error);
      throw error;
    }
  },
  
  /**
   * Resend OTP to user's email
   * @param email - User's email
   * @returns Promise with resend result
   */
  resendOtp: async (email: string): Promise<any> => {
    try {
      console.log('Attempting to resend OTP for email:', email);
      
      // Get the base URL from apiClient
      const baseURL = process.env.NEXT_PUBLIC_AMR_API_URL || apiClient.defaults.baseURL || 'https://bookingengine.onrender.com/';
      const fullURL = `${baseURL}auth/api/v1/resend-otp/`;
      
      console.log('Making POST request to resend OTP:', fullURL);
      
      // Use fetch API directly
      const response = await fetch(fullURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Resend OTP API error:', response.status, errorData);
        throw new Error(
          errorData.detail || 
          errorData.message || 
          errorData.error || 
          `Resend OTP failed with status ${response.status}`
        );
      }
      
      const data = await response.json();
      console.log('OTP resent successfully:', data);
      
      return data;
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      throw error;
    }
  },

  /**
   * Get the current user's profile
   * @returns Promise with user profile data
   */
  getUserProfile: async (): Promise<User> => {
    try {
      console.log('Fetching user profile');

      // Get the base URL from environment variable or apiClient
      const baseURL = process.env.NEXT_PUBLIC_AMR_API_URL || apiClient.defaults.baseURL || 'https://bookingengine.onrender.com/';
      const profileURL = `${baseURL}auth/api/v1/profile`;
      
      console.log('Making profile request to:', profileURL);
      
      // Use direct fetch approach
      const response = await fetch(profileURL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('amr_auth_token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }
      
      const data = await response.json();
      console.log('Profile data received:', data);
      
      // Map the response to our User interface
      return {
        id: data.id || '',
        username: data.username || data.email || '',
        email: data.email || '',
        firstName: data.first_name || '',
        lastName: data.last_name || '',
        phone: data.phone || '',
        createdAt: data.created_at || new Date().toISOString(),
        updatedAt: data.updated_at || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },
  
  /**
   * Update user profile information
   * @param userData - User data to update
   * @returns Promise with updated user information
   */
  updateUserProfile: async (userData: Partial<User>): Promise<User> => {
    try {
      console.log('Updating user profile:', userData);
      
      // Get token from localStorage
      const token = typeof window !== 'undefined' ? localStorage.getItem('amr_auth_token') : null;
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Use correct token format for the request
      const response = await apiClient.patch<User>('/accounts/profile/', userData, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      
      console.log('User profile update successful');
      return response.data;
    } catch (error: any) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  /**
   * Logout user
   */
  logout: () => {
    console.log('Logging out user - clearing all auth tokens and state');
    
    if (typeof window !== 'undefined') {
      // Remove token from localStorage
      localStorage.removeItem('amr_auth_token');
      localStorage.removeItem('amr_refresh_token');
      
      // Remove auth headers from API clients
      delete apiClient.defaults.headers.common['Authorization'];
      delete axios.defaults.headers.common['Authorization'];
      
      console.log('Logged out: Token removed from localStorage and API headers cleared');
      
      // Dispatch a storage event to notify other tabs/windows
      try {
        // Create and dispatch a custom event for same-tab communication
        const authEvent = new CustomEvent('auth-state-changed', { 
          detail: { isAuthenticated: false } 
        });
        window.dispatchEvent(authEvent);
        
        // This trick helps with cross-tab communication, as storage events
        // are only sent to other tabs/windows
        localStorage.setItem('auth_state_timestamp', Date.now().toString());
      } catch (error) {
        console.error('Error dispatching auth event:', error);
      }
    }
  },

  /**
   * Check if user is authenticated
   * @returns boolean indicating if user is authenticated
   */
  isAuthenticated: (): boolean => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('amr_auth_token');
    }
    return false;
  },

  /**
   * Get authentication token
   * @returns the stored authentication token or null if not found
   */
  getToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('amr_auth_token');
    }
    return null;
  },
};

export default authService; 