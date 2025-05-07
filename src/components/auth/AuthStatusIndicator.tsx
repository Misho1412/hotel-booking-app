import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { refreshToken } from '@/lib/api/services/authService';

/**
 * AuthStatusIndicator - A component that displays the current authentication status
 * and provides options to refresh the token or logout
 * 
 * Can be included in pages where authentication debugging is needed
 */
export default function AuthStatusIndicator() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [tokenInfo, setTokenInfo] = useState<{token: string, expiry: string | null} | null>(null);

  useEffect(() => {
    // Get token information from localStorage
    const getTokenInfo = () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('amr_auth_token');
        const lastRefresh = localStorage.getItem('last_token_refresh');
        
        if (token) {
          setTokenInfo({
            token: token.substring(0, 10) + '...',
            expiry: lastRefresh ? new Date(parseInt(lastRefresh)).toLocaleString() : null
          });
        } else {
          setTokenInfo(null);
        }
      }
    };

    getTokenInfo();
    
    // Set up event listener for auth state changes
    const handleAuthChange = () => {
      getTokenInfo();
      setMessage(null);
    };
    
    window.addEventListener('auth-state-changed', handleAuthChange);
    window.addEventListener('storage', (e) => {
      if (e.key === 'amr_auth_token' || e.key === 'last_token_refresh') {
        getTokenInfo();
      }
    });
    
    return () => {
      window.removeEventListener('auth-state-changed', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  const handleRefreshToken = async () => {
    try {
      setIsRefreshing(true);
      setMessage(null);
      
      // Call the refresh token service
      const success = await refreshToken();
      
      if (success) {
        setMessage('Token successfully refreshed');
        
        // Store refresh timestamp
        if (typeof window !== 'undefined') {
          localStorage.setItem('last_token_refresh', Date.now().toString());
        }
      } else {
        setMessage('Token refresh failed');
      }
    } catch (error: any) {
      console.error('Error refreshing token:', error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogout = () => {
    logout();
    setMessage('Successfully logged out');
    setTokenInfo(null);
  };

  if (!isAuthenticated && !tokenInfo) {
    return (
      <div className="rounded-md bg-gray-50 p-3 text-sm shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center">
          <div className="h-2 w-2 rounded-full bg-red-500 mr-2"></div>
          <p>Not authenticated</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md bg-gray-50 p-4 text-sm shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center mb-2">
        <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
        <p className="font-medium">Authenticated</p>
      </div>
      
      {user && (
        <div className="mt-1 mb-3">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Logged in as: <span className="font-medium">{user.email || user.username}</span>
          </p>
        </div>
      )}
      
      {tokenInfo && (
        <div className="mb-3 text-xs text-gray-600 dark:text-gray-400">
          <p>Token: <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">{tokenInfo.token}</code></p>
          {tokenInfo.expiry && (
            <p className="mt-1">Last refreshed: {tokenInfo.expiry}</p>
          )}
        </div>
      )}
      
      {message && (
        <div className={`text-xs p-2 mb-3 rounded ${message.includes('Error') ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}`}>
          {message}
        </div>
      )}
      
      <div className="flex space-x-2">
        <button
          onClick={handleRefreshToken}
          disabled={isRefreshing}
          className={`px-3 py-1 text-xs rounded-md ${
            isRefreshing
              ? 'bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
              : 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800'
          }`}
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh Token'}
        </button>
        
        <button
          onClick={handleLogout}
          disabled={isRefreshing}
          className="px-3 py-1 text-xs rounded-md bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
        >
          Logout
        </button>
      </div>
    </div>
  );
} 