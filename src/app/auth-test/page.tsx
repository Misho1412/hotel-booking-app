"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/context/AuthContext';

// Dynamically import components to prevent server-side rendering issues
const AuthStatusIndicator = dynamic(
  () => import('@/components/auth/AuthStatusIndicator'),
  { ssr: false }
);

const TestLogin = dynamic(
  () => import('@/app/login/TestLogin'),
  { ssr: false }
);

export default function AuthTestPage() {
  const { user, isAuthenticated, isLoading } = useAuth();

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Authentication Testing Page</h1>
      
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Authentication Status Section */}
        <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Current Authentication Status</h2>
          <div className="mb-6">
            <AuthStatusIndicator />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="font-medium mb-2">User Information</h3>
              {isLoading ? (
                <p>Loading...</p>
              ) : isAuthenticated && user ? (
                <div className="space-y-2">
                  <p><span className="font-medium">Email:</span> {user.email}</p>
                  <p><span className="font-medium">Username:</span> {user.username || 'N/A'}</p>
                  <p><span className="font-medium">User ID:</span> {user.id || 'N/A'}</p>
                </div>
              ) : (
                <p>Not authenticated</p>
              )}
            </div>
            
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="font-medium mb-2">Token Information</h3>
              {typeof window !== 'undefined' ? (
                <div className="space-y-2">
                  <p><span className="font-medium">Token Exists:</span> {localStorage.getItem('amr_auth_token') ? 'Yes' : 'No'}</p>
                  {localStorage.getItem('amr_auth_token') && (
                    <>
                      <p><span className="font-medium">Token Preview:</span> {localStorage.getItem('amr_auth_token')?.substring(0, 15)}...</p>
                      <p><span className="font-medium">Last Refresh:</span> {localStorage.getItem('last_token_refresh') 
                        ? new Date(parseInt(localStorage.getItem('last_token_refresh') || '0')).toLocaleString() 
                        : 'Never'}</p>
                    </>
                  )}
                </div>
              ) : (
                <p>Window object not available</p>
              )}
            </div>
          </div>
        </section>
        
        {/* Test Login Component */}
        <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Authentication Testing Tools</h2>
          <TestLogin />
        </section>
        
        {/* Event Logs */}
        <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Authentication Event Log</h2>
          <EventLogger />
        </section>
        
        {/* Navigation Links */}
        <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Quick Navigation</h2>
          <div className="flex flex-wrap gap-4">
            <a href="/login" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Login Page
            </a>
            <a href="/signup" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
              Signup Page
            </a>
            <a href="/" className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
              Home Page
            </a>
            <a href="/hotels/1" className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
              Sample Hotel Page
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}

// Event Logger Component to display authentication events
function EventLogger() {
  const [events, setEvents] = React.useState<{type: string, timestamp: string, details: string}[]>([]);
  
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Log initial state
    const token = localStorage.getItem('amr_auth_token');
    setEvents([{
      type: 'INITIAL',
      timestamp: new Date().toLocaleTimeString(),
      details: token ? 'Token exists in localStorage' : 'No token in localStorage'
    }]);
    
    // Listen for auth state changes
    const handleAuthEvent = (e: any) => {
      setEvents(prev => [{
        type: 'AUTH_EVENT',
        timestamp: new Date().toLocaleTimeString(),
        details: `Source: ${e.detail?.source || 'unknown'}, Authenticated: ${e.detail?.isAuthenticated ? 'true' : 'false'}`
      }, ...prev]);
    };
    
    // Listen for storage events
    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === 'amr_auth_token' || e.key === 'auth_state_timestamp' || e.key === 'last_token_refresh') {
        setEvents(prev => [{
          type: 'STORAGE',
          timestamp: new Date().toLocaleTimeString(),
          details: `Key: ${e.key}, NewValue: ${e.key === 'amr_auth_token' ? (e.newValue ? 'Token exists' : 'Token removed') : e.newValue}`
        }, ...prev]);
      }
    };
    
    window.addEventListener('auth-state-changed', handleAuthEvent);
    window.addEventListener('storage', handleStorageEvent);
    
    return () => {
      window.removeEventListener('auth-state-changed', handleAuthEvent);
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, []);
  
  return (
    <div className="h-64 overflow-y-auto bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
      {events.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No events logged yet</p>
      ) : (
        <div className="space-y-2">
          {events.map((event, index) => (
            <div key={index} className="text-sm border-l-4 border-blue-500 pl-3 py-1">
              <div className="flex justify-between">
                <span className="font-medium">{event.type}</span>
                <span className="text-gray-500 dark:text-gray-400">{event.timestamp}</span>
              </div>
              <p className="text-gray-600 dark:text-gray-300">{event.details}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 