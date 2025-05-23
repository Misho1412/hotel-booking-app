import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the AuthStatusIndicator
const AuthStatusIndicator = dynamic(
  () => import('@/components/auth/AuthStatusIndicator'),
  { ssr: false }
);

const TestLogin = () => {
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [format, setFormat] = useState('user_provided');
  const [currentToken, setCurrentToken] = useState<string | null>(null);
  
  // Check for existing token on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('amr_auth_token');
      setCurrentToken(token);
    }
  }, []);
  
  // Define different login format options
  const loginFormats = {
    'user_provided': {
      label: 'User Provided Credentials',
      body: { email: 'mishoholmes@gmail.com', password: 'misho1234' }
    },
    'standard_login': {
      label: 'Standard Login',
      body: { email: 'mishoholmes@gmail.com', password: 'misho1234' }
    },
    'test_user': {
      label: 'Test User',
      body: { email: 'mishoholmes@gmail.com', password: 'misho1234' }
    }
  };
  
  const testLogin = async () => {
    try {
      setIsLoading(true);
      setResult(null);
      setError(null);
      
      // Get selected credentials
      const credentials = loginFormats[format as keyof typeof loginFormats].body;
      console.log('Testing login with format:', format);
      console.log('Credentials:', credentials);
      
      // Get login URL from env variable or use default
      const baseURL = process.env.NEXT_PUBLIC_AMR_API_URL || 'https://bookingengine.onrender.com/';
      const loginURL = `${baseURL}auth/api/v1/login/`;
      console.log('Login URL:', loginURL);
      
      // Make direct API request
      const response = await fetch(loginURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(credentials)
      });
      
      console.log('Response status:', response.status);
      
      // Get the response body regardless of status code
      const responseBody = await response.text();
      console.log('Response body:', responseBody);
      
      let data;
      try {
        data = JSON.parse(responseBody);
      } catch (e) {
        console.error('Error parsing response body:', e);
        throw new Error('Invalid response format from server');
      }
      
      if (!response.ok) {
        throw new Error(data.detail || data.non_field_errors?.join(', ') || JSON.stringify(data));
      }
      
      // Extract and store the token
      if (data.token) {
        const tokenPreview = data.token.substring(0, 10) + '...';
        console.log('Token received:', tokenPreview);
        
        // Store the token in localStorage
        localStorage.setItem('amr_auth_token', data.token);
        console.log('Token stored in localStorage');
        setCurrentToken(data.token);
        
        // Check if using proper format for auth header
        const authHeader = `Token ${data.token}`;
        const authHeaderPreview = `Token ${data.token.substring(0, 10)}...`;
        console.log('Auth header format:', authHeaderPreview);
        
        // Set the authorization header on axios for subsequent requests
        import('axios').then(module => {
          const axios = module.default;
          axios.defaults.headers.common['Authorization'] = authHeader;
          console.log('Set Authorization header on axios with format:', authHeaderPreview);
        });
        
        // Also set it on apiClient
        import('@/lib/api/apiConfig').then(module => {
          const apiClient = module.default;
          apiClient.defaults.headers.common['Authorization'] = authHeader;
          console.log('Set Authorization header on apiClient with format:', authHeaderPreview);
        });
        
        // Show success message with auth header format
        setResult(`Login successful! Token stored in localStorage. 
          Auth header format: ${authHeaderPreview}
          
          Next steps:
          1. Go back to the home page
          2. Check if hotels are loading
          3. If not, click "Fix Authentication" button`);
      } else {
        setError('No token in response');
      }
    } catch (error: any) {
      console.error('Test login error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Test direct API call with current token
  const testApiWithToken = async () => {
    try {
      setIsLoading(true);
      
      if (!currentToken) {
        setError('No token available to test');
        setIsLoading(false);
        return;
      }
      
      const baseURL = process.env.NEXT_PUBLIC_AMR_API_URL || 'https://amrbooking.onrender.com/api';
      const apiURL = `${baseURL}/hotels/?featured=true&page_size=8`;
      console.log('Testing API with URL:', apiURL);
      
      const response = await fetch(apiURL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Token ${currentToken}`
        }
      });
      
      const responseBody = await response.text();
      console.log('API test status:', response.status);
      console.log('API test response:', responseBody);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}: ${responseBody}`);
      }
      
      try {
        const data = JSON.parse(responseBody);
        if (data.results && Array.isArray(data.results)) {
          setResult(`API test successful! Found ${data.results.length} hotels in the response.`);
        } else {
          setResult('API returned successful response but no hotels found.');
        }
      } catch (e) {
        throw new Error('Invalid JSON response from API');
      }
    } catch (error: any) {
      console.error('API test error:', error);
      setError(`API test failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Refresh token function
  const handleRefreshToken = async () => {
    try {
      setIsLoading(true);
      setResult(null);
      setError(null);
      
      if (!currentToken) {
        setError('No token available to refresh');
        setIsLoading(false);
        return;
      }
      
      console.log('Manually triggering token refresh using /auth/api/v1/refresh/');
      
      // Get the base URL from environment variable or use default
      const baseURL = process.env.NEXT_PUBLIC_AMR_API_URL || 'https://bookingengine.onrender.com/';
      const refreshURL = `${baseURL}auth/api/v1/refresh/`;
      console.log('Refresh URL:', refreshURL);
      
      // Make direct API request to refresh token
      const response = await fetch(refreshURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Token ${currentToken}`
        },
        body: JSON.stringify({})
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
        console.error('Error parsing response body:', e);
        throw new Error('Invalid response format from server');
      }
      
      if (!response.ok) {
        throw new Error(data.detail || data.non_field_errors?.join(', ') || JSON.stringify(data));
      }
      
      // Extract and store the new token
      if (data.token) {
        const tokenPreview = data.token.substring(0, 10) + '...';
        console.log('New token received:', tokenPreview);
        
        // Store the new token in localStorage
        localStorage.setItem('amr_auth_token', data.token);
        console.log('New token stored in localStorage');
        setCurrentToken(data.token);
        
        // Set the authorization header on axios for subsequent requests
        import('axios').then(module => {
          const axios = module.default;
          axios.defaults.headers.common['Authorization'] = `Token ${data.token}`;
          console.log('Set Authorization header on axios with refreshed token');
        });
        
        // Also set it on apiClient
        import('@/lib/api/apiConfig').then(module => {
          const apiClient = module.default;
          apiClient.defaults.headers.common['Authorization'] = `Token ${data.token}`;
          console.log('Set Authorization header on apiClient with refreshed token');
        });
        
        // Dispatch a custom event for auth state change
        try {
          const authEvent = new CustomEvent('auth-state-changed', { 
            detail: { isAuthenticated: true, isRefresh: true } 
          });
          window.dispatchEvent(authEvent);
          
          // Update timestamp to notify other tabs
          localStorage.setItem('auth_state_timestamp', Date.now().toString());
          console.log('Auth event dispatched for token refresh');
        } catch (error) {
          console.error('Error dispatching auth event:', error);
        }
        
        setResult(`Token refresh successful! New token stored in localStorage.
          New token preview: ${tokenPreview}
          
          The UI should automatically update to reflect your authenticated state.`);
      } else {
        setError('No token in refresh response');
      }
    } catch (error: any) {
      console.error('Refresh token error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Clear token function
  const clearToken = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('amr_auth_token');
      setCurrentToken(null);
      
      // Also remove from axios and apiClient
      import('axios').then(module => {
        const axios = module.default;
        delete axios.defaults.headers.common['Authorization'];
        console.log('Removed Authorization header from axios');
      });
      
      import('@/lib/api/apiConfig').then(module => {
        const apiClient = module.default;
        delete apiClient.defaults.headers.common['Authorization'];
        console.log('Removed Authorization header from apiClient');
      });
      
      setResult('Token has been cleared from localStorage and API clients');
    }
  };

  // Force refresh authentication state
  const fixAuthentication = () => {
    try {
      if (typeof window !== 'undefined') {
        console.log('Fixing authentication state...');
        
        // Check if we have a token
        const token = localStorage.getItem('amr_auth_token');
        
        if (token) {
          console.log('Found token, ensuring proper auth state');
          
          // Create and dispatch a custom event
          const authEvent = new CustomEvent('auth-state-changed', { 
            detail: { isAuthenticated: true, source: 'test-login' } 
          });
          window.dispatchEvent(authEvent);
          
          // Update timestamp to notify other tabs
          localStorage.setItem('auth_state_timestamp', Date.now().toString());
          
          // Update user email if needed
          if (!localStorage.getItem('user_email')) {
            localStorage.setItem('user_email', 'test@example.com');
          }
          
          // Set token in API client headers
          import('@/lib/api/apiConfig').then(module => {
            const apiClient = module.default;
            apiClient.defaults.headers.common['Authorization'] = `Token ${token}`;
            console.log('Set Authorization header on apiClient');
          });
          
          // Set token in axios headers
          import('axios').then(module => {
            const axios = module.default;
            axios.defaults.headers.common['Authorization'] = `Token ${token}`;
            console.log('Set Authorization header on axios');
          });
          
          setResult('Authentication state fixed! Auth event dispatched and headers set. Try navigating to another page now.');
        } else {
          setError('No token found. Please login first.');
        }
      }
    } catch (error: any) {
      console.error('Error fixing authentication:', error);
      setError(`Error fixing authentication: ${error.message}`);
    }
  };
  
  return (
    <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
      {/* Authentication Status */}
      <div className="mb-5">
        <AuthStatusIndicator />
      </div>
      
      <h3 className="text-lg font-medium mb-3">Authentication Debugging</h3>
      
      {/* Current token status */}
      <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-700 rounded">
        <h4 className="text-sm font-medium mb-2">Current Authentication Status:</h4>
        {currentToken ? (
          <>
            <p className="text-green-600 dark:text-green-400 text-sm mb-1">Token Present ✓</p>
            <code className="block p-2 text-xs bg-gray-200 dark:bg-gray-800 rounded overflow-auto">
              Token: {currentToken.substring(0, 15)}...
            </code>
            <code className="block p-2 mt-1 text-xs bg-gray-200 dark:bg-gray-800 rounded overflow-auto">
              Auth Header: Token {currentToken.substring(0, 15)}...
            </code>
          </>
        ) : (
          <p className="text-red-600 dark:text-red-400 text-sm">No Token Present ✗</p>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        <button 
          onClick={testApiWithToken}
          disabled={!currentToken || isLoading}
          className={`flex-1 p-2 rounded text-white text-xs ${!currentToken || isLoading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
        >
          Test Token with API
        </button>
        
        <button 
          onClick={handleRefreshToken}
          disabled={!currentToken || isLoading}
          className={`flex-1 p-2 rounded text-white text-xs ${!currentToken || isLoading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          Refresh Token
        </button>
        
        <button 
          onClick={clearToken}
          disabled={!currentToken || isLoading}
          className={`flex-1 p-2 rounded text-white text-xs ${!currentToken || isLoading ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'}`}
        >
          Clear Token
        </button>
        
        <button 
          onClick={fixAuthentication}
          disabled={!currentToken || isLoading}
          className={`w-full mt-2 p-2 rounded text-white text-xs ${!currentToken || isLoading ? 'bg-gray-400' : 'bg-purple-600 hover:bg-purple-700'}`}
        >
          Fix Authentication
        </button>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Login Format:</label>
        <select 
          className="w-full p-2 border rounded dark:bg-gray-700" 
          value={format}
          onChange={(e) => setFormat(e.target.value)}
        >
          {Object.entries(loginFormats).map(([key, { label }]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>
      
      <div className="mb-3">
        <div className="text-sm mb-2">Payload:</div>
        <pre className="bg-gray-100 dark:bg-gray-900 p-2 rounded text-xs overflow-auto max-h-24">
          {JSON.stringify(loginFormats[format as keyof typeof loginFormats].body, null, 2)}
        </pre>
      </div>
      
      <button 
        className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded flex items-center justify-center" 
        onClick={testLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Testing...
          </>
        ) : 'Test Login'}
      </button>
      
      {result && (
        <div className="mt-3 p-3 bg-green-100 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded text-green-800 dark:text-green-200 text-sm whitespace-pre-line">
          {result}
        </div>
      )}
      
      {error && (
        <div className="mt-3 p-3 bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded text-red-800 dark:text-red-200 text-sm">
          {error}
        </div>
      )}
    </div>
  );
};

export default TestLogin; 