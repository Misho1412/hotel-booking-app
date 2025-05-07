/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    
    // This is needed to properly extend built-in classes in TypeScript
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Helper function to extract a readable error message from API responses
 */
export function getErrorMessage(error: any): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  
  if (error?.response?.data) {
    const data = error.response.data;
    
    if (typeof data === 'string') {
      return data;
    }
    
    if (data.detail) {
      return data.detail;
    }
    
    if (data.message) {
      return data.message;
    }
    
    if (data.error) {
      return data.error;
    }
    
    if (data.non_field_errors) {
      return data.non_field_errors.join(', ');
    }
    
    try {
      return JSON.stringify(data);
    } catch (e) {
      // Fall back to default message
    }
  }
  
  return error?.message || 'An unexpected error occurred';
} 