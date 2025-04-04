import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService, { User, AuthTokenRequest, UserRegistrationRequest } from '@/lib/api/services/authService';
import apiClient from '@/lib/api/apiConfig';

// Define the context interface
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: AuthTokenRequest) => Promise<void>;
  register: (userData: UserRegistrationRequest) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  updateProfile: async () => {},
});

// Provider props interface
interface AuthProviderProps {
  children: ReactNode;
}

// Create the auth provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Function to fetch user profile
  const fetchUserProfile = async () => {
    try {
      console.log('Fetching user profile');
      const token = authService.getToken();
      if (!token) {
        console.log('No auth token available, cannot fetch profile');
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }
      
      console.log('Auth token found, fetching profile');
      
      // Ensure token is in the headers
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const userData = await authService.getUserProfile();
      console.log('User profile fetched successfully:', userData);
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      
      // Check if this is an auth error or token expired
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log('Authentication error or token expired, logging out');
        // Clear token if invalid
        authService.logout();
        
        // Clear auth headers
        delete apiClient.defaults.headers.common['Authorization'];
      }
      
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Check authentication status on mount
  useEffect(() => {
    console.log('AuthProvider mounted, checking auth status');
    if (authService.isAuthenticated()) {
      console.log('Token found in localStorage, attempting to fetch profile');
      fetchUserProfile();
    } else {
      console.log('No token found in localStorage');
      setIsLoading(false);
    }
  }, []);

  // Login function
  const login = async (credentials: AuthTokenRequest) => {
    setIsLoading(true);
    try {
      console.log('Login attempt with email:', credentials.email);
      const response = await authService.login(credentials);
      console.log('Login successful, token received:', !!response.token);
      
      if (response.token) {
        // Ensure token is in the headers for subsequent requests
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.token}`;
        console.log('Token set in API client headers');
      }
      
      await fetchUserProfile();
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Enhanced error logging
      if (error.response) {
        console.error('Login API response status:', error.response.status);
        console.error('Login API response data:', error.response.data);
      } else if (error.request) {
        console.error('Login request was made but no response received');
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData: UserRegistrationRequest) => {
    setIsLoading(true);
    try {
      console.log('Registration attempt from AuthContext with email:', userData.email);
      console.log('Calling authService.register...');
      const user = await authService.register(userData);
      console.log('Registration successful, user created:', user);
      
      // Automatically login after registration
      console.log('Attempting automatic login after registration');
      await authService.login({
        email: userData.email,
        password: userData.password,
      });
      
      // Set the token in headers for all subsequent requests
      const token = authService.getToken();
      if (token) {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        console.log('Token set in API client headers after registration login');
      }
      
      await fetchUserProfile();
    } catch (error: any) {
      console.error('Registration error in AuthContext:', error);
      
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

  // Logout function
  const logout = () => {
    console.log('Logging out user');
    authService.logout();
    
    // Clear auth headers
    delete apiClient.defaults.headers.common['Authorization'];
    
    setUser(null);
    setIsAuthenticated(false);
  };

  // Update profile function
  const updateProfile = async (userData: Partial<User>) => {
    setIsLoading(true);
    try {
      console.log('Updating user profile');
      const updatedUser = await authService.updateUserProfile({
        ...userData,
      });
      console.log('User profile updated successfully');
      setUser(updatedUser);
    } catch (error: any) {
      console.error('Update profile error:', error);
      
      // Check if this is an auth error
      if (error.response?.status === 401) {
        console.log('Authentication error during profile update, logging out');
        logout();
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Context value
  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

export default AuthContext; 