import apiClient from '../apiConfig';
import {
  UserSchema, 
  UserRequestSchema
} from '../schemas';
import { validateRequest, validateResponse } from '../validation';
import axios from 'axios';

// Interface for AuthTokenRequest schema
export interface AuthTokenRequest {
  username: string;
  password: string;
}

// Interface for AuthToken response
export interface AuthToken {
  token: string;
}

// Interface for UserRegistrationRequest schema
export interface UserRegistrationRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber?: string;  // Optional field
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
      console.log('Attempting login with credentials:', { username: credentials.username });
      
      // Format the credentials according to the API requirements
      const formattedCredentials = {
        username: credentials.username,
        password: credentials.password,
      };
      
      console.log('Formatted login data (username only):', { username: formattedCredentials.username });
      
      // Get the base URL from environment variable or apiClient
      const baseURL = process.env.NEXT_PUBLIC_AMR_API_URL || apiClient.defaults.baseURL || 'https://amrbooking.onrender.com/api';
      const fullURL = `${baseURL}/token/`;
      
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
      console.log('Response body:', responseBody);
      
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
      
      console.log('Login successful:', data);
      
      // Store the token in localStorage
      if (typeof window !== 'undefined' && data.token) {
        // Log the token value (just first 10 chars for security)
        const tokenPreview = data.token.substring(0, 10) + "...";
        console.log('Token received:', tokenPreview);
        
        // Store raw token for flexibility
        localStorage.setItem('amr_auth_token', data.token);
        console.log('Token stored in localStorage');
        
        // Also set the token in the default headers for all future requests
        // Use correct format: "Token <token>" instead of "Bearer <token>"
        apiClient.defaults.headers.common['Authorization'] = `Token ${data.token}`;
        
        // Set token in axios defaults too
        axios.defaults.headers.common['Authorization'] = `Token ${data.token}`;
        console.log('Token set in API client and axios default headers with "Token" prefix');
        
        // Log all header values to verify
        console.log('Current API client headers:', apiClient.defaults.headers);
      } else {
        console.warn('No token received from login response or not in browser environment');
      }
      
      return data;
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Simply pass through the error message
      throw error;
    }
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
      const fullURL = `${baseURL}/accounts/register/`;
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
   * Get current user profile information
   * @returns Promise with user information
   */
  getUserProfile: async (): Promise<User> => {
    try {
      console.log('Fetching user profile');
      
      // Get the token from localStorage
      const token = typeof window !== 'undefined' ? localStorage.getItem('amr_auth_token') : null;
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Get the base URL from environment variable or apiClient
      const baseURL = process.env.NEXT_PUBLIC_AMR_API_URL || 'https://amrbooking.onrender.com/api';
      const fullURL = `${baseURL}/accounts/profile/`;
      
      console.log('Making direct fetch request to:', fullURL);
      
      // Use direct fetch approach with correct token format
      const response = await fetch(fullURL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Token ${token}`
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Profile fetch failed:', response.status, errorText);
        throw new Error(`Failed to fetch user profile: ${response.statusText}`);
      }
      
      const userData = await response.json();
      console.log('User profile fetch successful');
      
      return userData;
    } catch (error: any) {
      console.error('Error getting user profile:', error);
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
  logout: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('amr_auth_token');
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