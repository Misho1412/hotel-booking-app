import { z } from 'zod';

/**
 * Validates the request data against the provided schema
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validated data
 * @throws Error if validation fails
 */
export function validateRequest<T>(schema: z.ZodType<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(e => 
        `${e.path.join('.')}: ${e.message}`
      ).join(', ');
      
      console.error(`Request validation error: ${errorMessage}`);
      throw new Error(`Invalid request: ${errorMessage}`);
    }
    throw error;
  }
}

/**
 * Validates the response data against the provided schema
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validated data
 * @throws Error if validation fails (only in development)
 */
export function validateResponse<T>(schema: z.ZodType<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    // Only throw validation errors in development to prevent breaking the app in production
    if (process.env.NODE_ENV !== 'production' && error instanceof z.ZodError) {
      const errorMessage = error.errors.map(e => 
        `${e.path.join('.')}: ${e.message}`
      ).join(', ');
      
      console.error(`Response validation error: ${errorMessage}`);
      console.error('Invalid response data:', data);
      throw new Error(`Invalid response: ${errorMessage}`);
    }
    
    // In production, log the error but return the unvalidated data
    console.error('Response validation error:', error);
    return data as T;
  }
}

/**
 * Options for API request validation
 */
export interface ValidationOptions {
  /**
   * Whether to validate the request data
   * @default true
   */
  validateRequest?: boolean;
  
  /**
   * Whether to validate the response data
   * @default true in development, false in production
   */
  validateResponse?: boolean;
}

/**
 * Default validation options
 */
export const defaultValidationOptions: ValidationOptions = {
  validateRequest: true,
  validateResponse: process.env.NODE_ENV !== 'production',
}; 