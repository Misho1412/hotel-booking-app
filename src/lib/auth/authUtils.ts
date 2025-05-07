/**
 * Get the authentication token from localStorage
 * @returns The authentication token or null if not found
 */
export function getTokenFromCookie(): string | null {
  if (typeof window === 'undefined') {
    // Running on server side
    return null;
  }
  
  return localStorage.getItem('amr_auth_token');
}

/**
 * Set the authentication token in localStorage
 * @param token The token to store
 */
export function setTokenInCookie(token: string): void {
  if (typeof window === 'undefined') {
    // Running on server side
    return;
  }
  
  localStorage.setItem('amr_auth_token', token);
}

/**
 * Remove the authentication token from localStorage
 */
export function removeTokenFromCookie(): void {
  if (typeof window === 'undefined') {
    // Running on server side
    return;
  }
  
  localStorage.removeItem('amr_auth_token');
}

/**
 * Check if user is authenticated (has a token)
 * @returns True if authenticated, false otherwise
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') {
    // Running on server side
    return false;
  }
  
  return !!localStorage.getItem('amr_auth_token');
} 