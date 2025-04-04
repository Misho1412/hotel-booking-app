import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';

// Get API URL from environment
const API_URL = process.env.NEXT_PUBLIC_AMR_API_URL || 'https://amrbooking.onrender.com/api';
const API_KEY = process.env.NEXT_PUBLIC_AMR_API_KEY || 'e68f78e-8749-4544-98ad-7e1c5d5dee9a';

// Create a queue for retrying requests after authentication
let isRefreshing = false;
let failedQueue: { resolve: Function; reject: Function }[] = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach(promise => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Create Axios instance with common configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Add a timestamp to track request duration
apiClient.interceptors.request.use(
  (config) => {
    // Add timestamp to metadata for tracking request duration
    config.metadata = { startTime: Date.now() };
    
    // Get the token from localStorage if we're in a browser environment
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('amr_auth_token');
      
      if (token) {
        // Use the correct format: "Token <token>" instead of "Bearer <token>"
        config.headers.Authorization = `Token ${token}`;
        
        // Log (for debugging only)
        console.log('Adding auth token to request:', {
          url: config.url,
          method: config.method,
          tokenFormat: 'Token <token>',
          tokenPreview: token.substring(0, 10) + '...'
        });
      } else {
        console.log('No auth token available for request:', {
          url: config.url,
          method: config.method
        });
      }
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for logging and error handling
apiClient.interceptors.response.use(
  (response) => {
    // Calculate and log request duration
    const { config } = response;
    if (config.metadata) {
      const duration = Date.now() - config.metadata.startTime;
      
      // Enhanced logging for all responses
      console.log(`API Response:`, {
        url: config.url,
        method: config.method,
        status: response.status,
        duration: `${duration}ms`,
        dataPreview: response.data ? (
          typeof response.data === 'object' ? 
            (response.data.results ? 
              `Found ${response.data.results.length} results` : 
              JSON.stringify(response.data).substring(0, 100) + '...') :
            String(response.data).substring(0, 100) + '...'
        ) : 'No data'
      });
    }
    
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest: any = error.config;
    
    // Log error details in development
    if (process.env.NODE_ENV === 'development') {
      console.error('API request error:', {
        url: originalRequest?.url,
        status: error.response?.status,
        message: error.message,
        data: error.response?.data
      });
    }
    
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest?._retry) {
      // If token is invalid, clear it and redirect to login
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('amr_auth_token');
        
        if (token) {
          // Remove invalid token
          localStorage.removeItem('amr_auth_token');
          console.warn('Clearing invalid authentication token');
          
          // If this is not an authentication endpoint, queue failed requests
          if (!originalRequest.url?.includes('token')) {
            // Redirect to login only once
            if (!isRefreshing) {
              isRefreshing = true;
              console.warn('Authentication required, redirecting to login');
              
              // If this is a client-side environment, redirect to login
              if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
                // Use timeout to allow current execution to complete
                setTimeout(() => {
                  window.location.href = '/login';
                }, 100);
              }
            }
            
            // Add to failed queue for retry after login
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            });
          }
        }
      }
    }
    
    // Handle network errors
    if (error.code === 'ECONNABORTED' || !error.response) {
      console.error('Network error:', error.message);
      throw new Error(`Network error: ${error.message}`);
    }
    
    // For 400 or 500 level errors, provide more context
    if (error.response?.status >= 400) {
      const errorData = error.response?.data;
      let errorMessage = 'API request failed';
      
      // Try to extract error details
      if (errorData) {
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.non_field_errors) {
          errorMessage = errorData.non_field_errors.join(', ');
        } else {
          // Try to stringify the error data
          try {
            errorMessage = `API Error: ${JSON.stringify(errorData)}`;
          } catch (e) {
            errorMessage = `API Error: ${error.response?.status}`;
          }
        }
      }
      
      // Create enhanced error
      const enhancedError: any = new Error(errorMessage);
      enhancedError.response = error.response;
      enhancedError.status = error.response?.status;
      enhancedError.data = errorData;
      
      throw enhancedError;
    }
    
    return Promise.reject(error);
  }
);

// Export configured axios instance
export default apiClient;

// Export for TypeScript
declare module 'axios' {
  export interface AxiosRequestConfig {
    metadata?: {
      startTime: number;
    };
  }
} 