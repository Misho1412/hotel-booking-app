"use client";

import React, { ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';
import AnimationProvider from './(client-components)/AnimationProvider';

export interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AnimationProvider>
        {children}
      </AnimationProvider>
    </ThemeProvider>
  );
} 