"use client";

import React, { createContext, useContext, ReactNode } from "react";

// Create a Context for locale information
interface LocaleContextType {
  locale: string;
  isRTL: boolean;
}

const LocaleContext = createContext<LocaleContextType | null>(null);

export interface LocaleProviderProps {
  children: ReactNode;
  locale?: string;
}

// Provider component to wrap your app
export function LocaleContextProvider({ 
  children, 
  locale = 'en' 
}: LocaleProviderProps) {
  // Determine if RTL based on locale
  const isRTL = locale === 'ar';

  return (
    <LocaleContext.Provider value={{ locale, isRTL }}>
      {children}
    </LocaleContext.Provider>
  );
}

// Custom hooks to access locale information
export function useLocale() {
  const context = useContext(LocaleContext);
  // If no context is available, return default locale
  if (!context) return 'en';
  return context.locale;
}

export function useIsRTLFromContext() {
  const context = useContext(LocaleContext);
  // If no context is available, return false for RTL
  if (!context) return false;
  return context.isRTL;
}

// Useful when redirecting or constructing URLs
export function getPathWithLocale(path: string, locale: string) {
  // Remove any existing locale prefix
  let cleanPath = path.replace(/^\/(en|ar)/, '');
  // Ensure path starts with /
  if (!cleanPath.startsWith('/')) {
    cleanPath = '/' + cleanPath;
  }
  return `/${locale}${cleanPath}`;
}

// List of available locales
export const LOCALES = ['en', 'ar'];

// Re-export from next-intl
export { Link, useRouter, usePathname } from "next/navigation";

// A fallback for useTranslations for client components
export function useTranslations(namespace: string) {
  return (key: string) => {
    // This is a simple fallback - it will be replaced by proper translations from the server
    return key;
  };
} 