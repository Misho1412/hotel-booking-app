import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import authService, { User, AuthTokenRequest, UserRegistrationRequest, VerifyOTPRequest } from '@/lib/api/services/authService';
import apiClient from '@/lib/api/apiConfig';
import axios from 'axios';
import { useRouter as useRouterOld } from 'next/router';
import { useRouter as useRouterApp } from 'next/navigation';

// Define the context interface
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: AuthTokenRequest) => Promise<{success: boolean, message?: string}>;
  register: (userData: UserRegistrationRequest) => Promise<void>;
  verifyOtp: (verifyData: VerifyOTPRequest) => Promise<void>;
  resendOtp: (email: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  login: async () => ({success: false}),
  register: async () => {},
  verifyOtp: async () => {},
  resendOtp: async () => {},
  logout: () => {},
  refreshToken: async () => false,
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Props interface for the provider
interface AuthProviderProps {
  children: ReactNode;
}

// Update the AuthToken interface to include tokens object
export interface AuthToken {
  token: string;
  refreshToken?: string;
  message?: string;
  tokens?: {
    access_token: string;
    refresh_token: string;
  };
}

// Provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  // Add a new state to track token verification attempts
  const [tokenCheckAttempts, setTokenCheckAttempts] = useState<number>(0);
  
  // Function to safely redirect without using router
  const safeRedirect = (path: string) => {
    if (typeof window !== 'undefined') {
      window.location.href = path;
    }
  };

  // Handle custom auth event from same tab
  const handleAuthEvent = (event: CustomEvent) => {
    console.log('Auth event received:', event.detail);
    // Re-check authentication when auth events occur
    checkAuth();
  };

  // Handle storage changes from other tabs
  const handleStorageEvent = (event: StorageEvent) => {
    if (event.key === 'amr_auth_token' || event.key === 'amr_refresh_token') {
      console.log('Auth token changed in another tab');
      // Re-check authentication when token changes in another tab
      checkAuth();
    }
  };

  // Modified checkAuth function with better error handling and logging
  const checkAuth = async () => {
    setIsLoading(true);
    try {
      console.log('🔍 Checking authentication state...');
      
      // Check for token in localStorage
      const token = localStorage.getItem('amr_auth_token');
      const refreshToken = localStorage.getItem('amr_refresh_token');
      
      // Debug token presence
      console.log('Token present:', !!token);
      console.log('Refresh token present:', !!refreshToken);
      
      if (!token) {
        console.log('No token found, user is not authenticated');
        setUser(null);
        setIsLoading(false);
        return false;
      }
      
      try {
        // Get current user data using the token
        const userData = await authService.getUserProfile();
        console.log('User data fetched successfully:', userData.email);
        
        // Set the user data in state
        setUser(userData);
        setIsLoading(false);
        return true;
      } catch (error: any) {
        console.error('Error fetching user data:', error.message);
        
        // Try to refresh the token if we have a refresh token
        if (refreshToken) {
          console.log('Attempting to refresh the token...');
          const refreshSuccess = await refreshTokenAsync();
          
          if (refreshSuccess) {
            console.log('Token refreshed successfully, retrying user data fetch');
            // After successful refresh, try again to get user data
            try {
              const userData = await authService.getUserProfile();
              setUser(userData);
              setIsLoading(false);
              return true;
            } catch (retryError) {
              console.error('Error fetching user data after token refresh:', retryError);
            }
          }
        }
        
        // If we reach here, authentication failed
        console.log('Authentication check failed, clearing tokens');
        setUser(null);
        // Clear tokens
        localStorage.removeItem('amr_auth_token');
        localStorage.removeItem('amr_refresh_token');
        
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Authentication check failed with error:', error);
      setUser(null);
      setIsLoading(false);
      return false;
    }
  };

  // Check auth state on mount
  useEffect(() => {
    const initialize = async () => {
      await checkAuth();
      setIsInitialized(true);
    };
    
    initialize();
    
    // Add event listeners for auth state changes
    window.addEventListener('storage', handleStorageEvent);
    window.addEventListener('auth-event', handleAuthEvent as EventListener);
    
    // Add an interval to periodically check authentication status (every 5 minutes)
    const intervalId = setInterval(() => {
      setTokenCheckAttempts(prev => prev + 1);
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => {
      window.removeEventListener('storage', handleStorageEvent);
      window.removeEventListener('auth-event', handleAuthEvent as EventListener);
      clearInterval(intervalId);
    };
  }, []);
  
  // Additional effect to check auth when tokenCheckAttempts changes
  useEffect(() => {
    if (tokenCheckAttempts > 0) {
      checkAuth();
    }
  }, [tokenCheckAttempts]);

  /**
   * Login user with credentials
   */
  const login = async (credentials: AuthTokenRequest) => {
    try {
      setIsLoading(true);
      console.log('Attempting login with:', credentials.email);
      
      const authResult = await authService.login(credentials);
      
      console.log('Login response received:', authResult);
      
      // Check for token in the response
      if (authResult.token) {
        // Store tokens
        localStorage.setItem('amr_auth_token', authResult.token);
        if (authResult.refreshToken) {
          localStorage.setItem('amr_refresh_token', authResult.refreshToken);
        }
        
        // Dispatch auth event to notify other tabs/components
        const authEvent = new CustomEvent('auth-event', {
          detail: { type: 'login', email: credentials.email }
        });
        window.dispatchEvent(authEvent);
        
        // Set user data from email for now
        setUser({
          id: 'temp',
          username: credentials.email,
          email: credentials.email,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });

        setIsLoading(false);
        return { success: true };
      } else {
        // Handle case where token is missing
        console.error('Login response missing token:', authResult);
        setIsLoading(false);
        return { 
          success: false, 
          message: authResult.message || "Login failed: Invalid response from server" 
        };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setIsLoading(false);
      
      // Provide a more descriptive error message
      let errorMessage = "Login failed. Please try again.";
      
      if (error.response?.status === 401) {
        errorMessage = "Invalid email or password. Please try again.";
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { success: false, message: errorMessage };
    }
  };

  /**
   * Refresh the authentication token
   */
  const refreshTokenAsync = async (): Promise<boolean> => {
    try {
      console.log('Attempting to refresh authentication token');
      const refreshResult = await authService.refreshToken();
      
      // Check if we got a new token
      if (refreshResult.token) {
        console.log('Successfully refreshed authentication token');
        return true;
      } else {
        console.error('Token refresh successful but no token in response');
        return false;
      }
    } catch (error) {
      console.error('Failed to refresh authentication token:', error);
      return false;
    }
  };

  /**
   * Logout user
   */
  const logout = () => {
    console.log('Logging out user');
    
    // Clear tokens from local storage
    localStorage.removeItem('amr_auth_token');
    localStorage.removeItem('amr_refresh_token');
    
    // Clear user data
    setUser(null);
    
    // Dispatch auth event to notify other tabs/components
    const authEvent = new CustomEvent('auth-event', {
      detail: { type: 'logout' }
    });
    window.dispatchEvent(authEvent);
    
    console.log('User logged out');
    
    // Redirect to login page
    safeRedirect('/login');
  };

  // Register function
  const register = async (userData: UserRegistrationRequest) => {
    setIsLoading(true);
    try {
      console.log('Registration attempt from AuthContext with email:', userData.email);
      await authService.register(userData);
      console.log('Registration successful, verification pending');
      
      // No longer automatically logging in after registration
      // User must verify OTP first
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Enhanced error logging
      if (error.response) {
        console.error('Registration API response status:', error.response.status);
        console.error('Registration API response data:', error.response.data);
      } else if (error.request) {
        console.error('Registration request was made but no response received');
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP function
  const verifyOtp = async (verifyData: VerifyOTPRequest) => {
    setIsLoading(true);
    try {
      console.log('Verifying OTP for email:', verifyData.email);
      const response = await authService.verifyOtp(verifyData);
      console.log('OTP verification successful:', response);
      
      // If the verification response includes a token, set up authentication
      if (response && response.token) {
        console.log('Authentication token received after OTP verification');
        
        // Store email for future reference (temporary solution)
        if (typeof window !== 'undefined') {
          localStorage.setItem('user_email', verifyData.email);
          
          // Instead of calling checkAuthStatus, trigger a refresh of auth state
          const token = response.token;
          // Update auth headers
          const tokenParts = token.split('.');
          if (tokenParts.length === 3) {
            // For JWT tokens, use Bearer prefix
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          } else {
            // For legacy tokens, use Token prefix
            axios.defaults.headers.common['Authorization'] = `Token ${token}`;
            apiClient.defaults.headers.common['Authorization'] = `Token ${token}`;
          }
          
          // Try to get user data with the new token
          try {
            const userData = await authService.getUserProfile();
            setUser(userData);
            
            // Dispatch auth event
            const authEvent = new CustomEvent('auth-state-changed', { 
              detail: { isAuthenticated: true } 
            });
            window.dispatchEvent(authEvent);
          } catch (userError) {
            console.error('Error fetching user data after OTP verification:', userError);
          }
        }
      }
      
      return response;
    } catch (error: any) {
      console.error('OTP verification error:', error);
      
      // Enhanced error logging
      if (error.response) {
        console.error('OTP verification API response status:', error.response.status);
        console.error('OTP verification API response data:', error.response.data);
      } else if (error.request) {
        console.error('OTP verification request was made but no response received');
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP function
  const resendOtp = async (email: string) => {
    setIsLoading(true);
    try {
      console.log('Resending OTP for email:', email);
      const response = await authService.resendOtp(email);
      console.log('OTP resend successful:', response);
      return response;
    } catch (error: any) {
      console.error('OTP resend error:', error);
      
      // Enhanced error logging
      if (error.response) {
        console.error('OTP resend API response status:', error.response.status);
        console.error('OTP resend API response data:', error.response.data);
      } else if (error.request) {
        console.error('OTP resend request was made but no response received');
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    register,
    verifyOtp,
    resendOtp,
    refreshToken: refreshTokenAsync,
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        verifyOtp,
        resendOtp,
        logout,
        refreshToken: refreshTokenAsync,
      }}
    >
      {/* Only render children when auth is initialized to prevent flash of unauthenticated content */}
      {isInitialized ? children : <div>Loading authentication...</div>}
    </AuthContext.Provider>
  );
};

export default AuthContext;