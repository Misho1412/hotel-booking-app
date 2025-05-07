import axios, { AxiosInstance, AxiosRequestConfig, AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Get API URL from environment
const API_URL = process.env.NEXT_PUBLIC_AMR_API_URL || 'https://bookingengine.onrender.com';
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

// Log the configured API URL during initialization
console.log('API Configuration:', {
  apiUrl: API_URL,
  environment: process.env.NODE_ENV,
  hasApiKey: !!API_KEY
});

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
  async (config) => {
    // Track request start time for performance monitoring
    if (config.metadata) {
      config.metadata.startTime = Date.now();
    }
    
    // Log request being made
    console.log('API Request:', {
      url: `${config.baseURL}${config.url}`,
      method: config.method,
      params: config.params
    });
    
    // Get the token from localStorage if we're in a browser environment
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('amr_auth_token');
      
      if (token && config.headers) {
        // Determine if it's a JWT token (has 3 parts separated by dots)
        const tokenParts = token.split('.');
        let authHeader;
        
        if (tokenParts.length === 3) {
          // It's a JWT token, use Bearer prefix
          authHeader = `Bearer ${token}`;
          console.log('Using JWT token format with Bearer prefix');
        } else {
          // Legacy token, use Token prefix
          authHeader = `Token ${token}`;
          console.log('Using legacy token format with Token prefix');
        }
        
        // Set the authorization header
        config.headers.Authorization = authHeader;
        
        // Log (for debugging only)
        console.log('Adding auth token to request:', {
          url: config.url,
          method: config.method,
          tokenFormat: authHeader.split(' ')[0],
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
  (error) => {
    console.error('API request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging and error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
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
    
    // Track response time for performance monitoring
    if (config.metadata && config.metadata.startTime) {
      const endTime = Date.now();
      const duration = endTime - config.metadata.startTime;
      
      if (duration > 1000) {
        console.warn(`API call took ${duration}ms:`, {
          method: config.method,
          url: config.url,
        });
      }
    }
    
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest: any = error.config;
    
    // Log detailed error information
    console.error('API Request Error:', {
      url: originalRequest?.url,
      method: originalRequest?.method,
      status: error.response?.status,
      code: error.code,
      message: error.message,
      data: error.response?.data,
      isNetworkError: !error.response && error.code !== 'ECONNABORTED'
    });
    
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest?._retry && typeof window !== 'undefined') {
      
      // Skip token refresh for login/auth endpoints
      if (originalRequest.url?.includes('/auth/api/v1/login') || 
          originalRequest.url?.includes('/auth/api/v1/refresh')) {
        return Promise.reject(error);
      }

      // If already refreshing token, add request to queue
      if (isRefreshing) {
        console.log('Already refreshing token, adding request to queue:', originalRequest.url);
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = `Token ${token}`;
          return apiClient(originalRequest);
        }).catch(err => {
          console.error('Failed request in queue rejected:', err);
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Try to refresh the token
        console.log('API interceptor - Token expired, attempting to refresh');
        
        // Import authService and refresh the token
        const authServiceModule = await import('./services/authService');
        const authService = authServiceModule.default;
        
        const response = await authService.refreshToken();
        const newToken = response.token;
        
        if (newToken) {
          console.log('Token refresh successful, retrying original request');
          
          // Update authorization headers for the original request
          originalRequest.headers['Authorization'] = `Token ${newToken}`;
          
          // Process all queued requests with the new token
          processQueue(null, newToken);
          
          // Notify about token refresh
          if (typeof window !== 'undefined') {
            try {
              const authEvent = new CustomEvent('auth-state-changed', { 
                detail: { isAuthenticated: true, isRefresh: true, source: 'api-interceptor' } 
              });
              window.dispatchEvent(authEvent);
              
              // Notify other tabs
              localStorage.setItem('auth_state_timestamp', Date.now().toString());
            } catch (eventError) {
              console.error('Error dispatching refresh auth event:', eventError);
            }
          }
          
          // Return the original request with the new token
          return apiClient(originalRequest);
        } else {
          console.error('Token refresh failed - no token in response');
          const axiosError = new AxiosError(
            'Token refresh failed - no token in response',
            'ERR_REFRESH_TOKEN_FAILED'
          );
          processQueue(axiosError, null);
          return Promise.reject(axiosError);
        }
      } catch (refreshError) {
        console.error('Token refresh error:', refreshError);
        
        // Create proper AxiosError to pass to the queue
        const axiosError = refreshError instanceof AxiosError 
          ? refreshError 
          : new AxiosError(
              'Token refresh failed',
              'ERR_REFRESH_TOKEN_FAILED'
            );
        
        // Pass the refresh error to all queued requests
        processQueue(axiosError, null);
        
        // Redirect to login page if token refresh fails
        if (typeof window !== 'undefined') {
          // Clear any existing tokens
          localStorage.removeItem('amr_auth_token');
          delete apiClient.defaults.headers.common['Authorization'];
          
          // Dispatch a logout event
          try {
            const authEvent = new CustomEvent('auth-state-changed', { 
              detail: { isAuthenticated: false, tokenRefreshFailed: true, source: 'api-interceptor' } 
            });
            window.dispatchEvent(authEvent);
            
            // Update timestamp to notify other tabs
            localStorage.setItem('auth_state_timestamp', Date.now().toString());
          } catch (eventError) {
            console.error('Error dispatching auth event:', eventError);
          }
          
          // Only redirect to login if not already on login page
          if (!window.location.pathname.includes('/login')) {
            // Redirect to login with return URL
            const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
            window.location.href = `/login?redirect=${returnUrl}`;
          }
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    // Handle network errors
    if (error.code === 'ECONNABORTED' || !error.response) {
      const errorMessage = `Network error: ${error.message}. Please check your connection and ensure the API server is running at ${API_URL}`;
      console.error(errorMessage);
      
      // Create a custom error with additional context
      const networkError = new Error(errorMessage);
      (networkError as any).isNetworkError = true;
      (networkError as any).originalError = error;
      (networkError as any).request = originalRequest;
      
      throw networkError;
    }
    
    // For 400 or 500 level errors, provide more context
    if (error.response?.status >= 400) {
      const errorData = error.response?.data as Record<string, any>;
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