"use client";

import React, { FC, useState, useEffect, useCallback } from "react";
import Navigation from "@/shared/Navigation/Navigation";
import SwitchDarkMode from "@/shared/SwitchDarkMode";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { getLocalizedUrl } from "@/utils/getLocalizedUrl";
import { useParams } from "next/navigation";
import { Route } from "@/routers/types";
import LangDropdown from "./LangDropdown";
import apiClient from "@/lib/api/apiConfig";

export interface MainNav1Props {
  className?: string;
}

const MainNav1: FC<MainNav1Props> = ({ className = "" }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  // Add state to track authentication from local storage
  const [localAuth, setLocalAuth] = useState(false);
  // Add a state to force refresh when auth state changes
  const [forceRefresh, setForceRefresh] = useState(0);
  const params = useParams();
  const locale = params?.locale as string;

  // Check local storage for token on mount and auth state changes
  const checkLocalToken = useCallback(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('amr_auth_token');
      const hasToken = !!token;
      
      if (hasToken) {
        // Set auth headers for making API calls
        // Check if it's a JWT token (has 3 parts separated by dots)
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          // It's a JWT token, use Bearer prefix
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          // If axios is used directly elsewhere, set it here too
          import('axios').then(axios => {
            axios.default.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          });
          console.log('MainNav - Found JWT token, using Bearer prefix');
        } else {
          // Legacy token, use Token prefix
          apiClient.defaults.headers.common['Authorization'] = `Token ${token}`;
          // If axios is used directly elsewhere, set it here too
          import('axios').then(axios => {
            axios.default.defaults.headers.common['Authorization'] = `Token ${token}`;
          });
          console.log('MainNav - Found legacy token, using Token prefix');
        }
      }
      
      setLocalAuth(hasToken);
      return hasToken;
    }
    return false;
  }, []);
  
  // Debug the authentication state
  useEffect(() => {
    if (isMounted) {
      console.log("🔐 MainNav1 - Auth state:", { 
        isAuthenticated, 
        localAuth,
        user: user ? { email: user.email, username: user.username } : null,
        timestamp: new Date().toISOString(),
        tokenExists: typeof window !== 'undefined' ? !!localStorage.getItem('amr_auth_token') : 'unknown'
      });
    }
  }, [isMounted, isAuthenticated, localAuth, user, forceRefresh]);

  // Listen for auth state changes directly in this component
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check token on mount
    checkLocalToken();

    // Handler for auth state changes from custom events
    const handleAuthEvent = (event: CustomEvent<any>) => {
      console.log("🔄 MainNav1 - Auth event received:", event.detail);
      checkLocalToken();
      setForceRefresh(prev => prev + 1);
    };

    // Handler for localStorage changes (works across tabs)
    const handleStorageEvent = (event: StorageEvent) => {
      if (event.key === 'amr_auth_token' || event.key === 'auth_state_timestamp') {
        console.log("🔄 MainNav1 - Storage event for auth detected:", event.key);
        checkLocalToken();
        setForceRefresh(prev => prev + 1);
      }
    };

    // Add event listeners
    window.addEventListener('auth-state-changed', handleAuthEvent as EventListener);
    window.addEventListener('storage', handleStorageEvent);

    return () => {
      window.removeEventListener('auth-state-changed', handleAuthEvent as EventListener);
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, [checkLocalToken]);

  // Set mounted state to enable client-side code
  useEffect(() => {
    setIsMounted(true);
    checkLocalToken();
  }, [checkLocalToken]);

  // Determine if user should be shown as authenticated
  const showAsAuthenticated = isMounted && (isAuthenticated || localAuth);

  return (
    <div className={`nc-MainNav1 relative z-10 ${className}`}>
      <div className="mx-auto max-w-7xl px-4 h-16 md:h-20 flex justify-between items-center">
        {/* Logo */}
        <div className="flex-shrink-0 flex items-center">
          <Link href="/" className="inline-block">
            <div className="flex items-center">
              {/* Inverted dark mode text colors */}
              <h1 className="text-3xl font-normal text-white dark:text-neutral-900">Pixel.</h1>
              <span className="text-xl text-white dark:text-neutral-900 mt-2 ml-1">com</span>
            </div>
          </Link>
        </div>
        
        {/* Main Navigation - Center */}
        <div className="hidden lg:flex justify-center">
          <Navigation />
        </div>

        {/* Right Side Elements */}
        <div className="flex items-center space-x-3">
          {/* Dark Mode Toggle */}
          <SwitchDarkMode />
          
          {/* Language Dropdown */}
          <LangDropdown />
          
          {/* Authentication Button/Link - Use key for force re-render */}
          <div key={`auth-${showAsAuthenticated}-${forceRefresh}`}>
            {showAsAuthenticated ? (
              <Link 
                href={getLocalizedUrl("/profile", locale) as Route<string>}
                className="flex items-center text-sm text-white dark:text-neutral-800 hover:text-neutral-300 dark:hover:text-neutral-600"
              >
                <UserCircleIcon className="h-6 w-6 mr-1" />
                <span>{user?.firstName || user?.username || user?.email || 'Profile'}</span>
              </Link>
            ) : (
              <Link 
                href={getLocalizedUrl("/login", locale) as Route<string>}
                className="px-4 py-2 text-sm text-white dark:text-neutral-800 hover:text-neutral-300 dark:hover:text-neutral-600"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainNav1;