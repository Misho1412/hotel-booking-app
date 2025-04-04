import { useState, useCallback } from 'react';

interface ApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

interface ApiActions<T> {
  setData: (data: T) => void;
  setError: (error: Error | null) => void;
  setLoading: (isLoading: boolean) => void;
  reset: () => void;
}

/**
 * A utility hook for managing API state including loading, error, and data.
 * 
 * @param initialData - Optional initial data
 * @returns API state and actions
 */
export function useApiState<T>(initialData: T | null = null): [ApiState<T>, ApiActions<T>] {
  const [state, setState] = useState<ApiState<T>>({
    data: initialData,
    isLoading: false,
    error: null,
  });

  const setData = useCallback((data: T) => {
    setState(prev => ({ ...prev, data, error: null, isLoading: false }));
  }, []);

  const setError = useCallback((error: Error | null) => {
    setState(prev => ({ ...prev, error, isLoading: false }));
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading, error: isLoading ? null : prev.error }));
  }, []);

  const reset = useCallback(() => {
    setState({ data: initialData, isLoading: false, error: null });
  }, [initialData]);

  return [
    state,
    { setData, setError, setLoading, reset }
  ];
}

/**
 * Extract error message from API error object or response
 * 
 * @param error - The error object
 * @returns A user-friendly error message
 */
export function getErrorMessage(error: any): string {
  if (!error) {
    return 'An unknown error occurred';
  }

  // Handle Axios error response
  if (error.response) {
    const { data, status } = error.response;
    
    // Handle specific status codes
    if (status === 401) {
      return 'Authentication required. Please log in again.';
    }
    
    if (status === 403) {
      return 'You do not have permission to perform this action.';
    }
    
    if (status === 404) {
      return 'The requested resource was not found.';
    }
    
    if (status === 422 || status === 400) {
      // Handle validation errors
      if (data.errors && typeof data.errors === 'object') {
        return Object.entries(data.errors)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join('; ');
      }
      
      if (data.message) {
        return data.message;
      }
      
      if (data.error) {
        return data.error;
      }
    }
    
    if (status >= 500) {
      return 'Server error. Please try again later.';
    }
    
    // Try to get any message from the response
    if (data.message) {
      return data.message;
    }
    
    if (data.error) {
      return data.error;
    }
    
    // Fallback for response errors
    return `Error ${status}: ${data.message || JSON.stringify(data)}`;
  }
  
  // Network errors
  if (error.request) {
    // Check if we're in development mode
    if (process.env.NODE_ENV === 'development') {
      const apiUrl = process.env.NEXT_PUBLIC_AMR_API_URL;
      return `Network error: Could not connect to the API server at ${apiUrl}. 
      
Please ensure:
1. Your API server is running
2. The URL in .env.local is correct
3. CORS is properly configured on your API server

Error details: ${error.message || 'Connection refused'}`;
    }
    return 'Network error. Please check your connection and try again.';
  }
  
  // Regular Error objects
  if (error.message) {
    return error.message;
  }
  
  // Fallback
  return String(error);
} 