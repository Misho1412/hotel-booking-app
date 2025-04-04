"use client";

import React, { ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';
import AnimationProvider from './(client-components)/AnimationProvider';
import { AuthProvider } from '@/context/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export interface ProvidersProps {
  children: ReactNode;
}

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // default: true
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AnimationProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </AnimationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
} 