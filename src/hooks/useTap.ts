import { useState, useEffect } from 'react';

declare global {
  interface Window {
    Tap: any;
  }
}

export interface TapConfig {
  publicKey: string;
  currencyCode: string;
  locale?: string;
}

interface UseTapReturn {
  tap: any | null;
  loading: boolean;
  error: Error | null;
  createToken: (cardData: any) => Promise<any>;
}

const useTap = ({ publicKey, currencyCode, locale = 'en' }: TapConfig): UseTapReturn => {
  const [tap, setTap] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadScript = async () => {
      try {
        setLoading(true);
        // Dynamic import of the Tap SDK
        const script = document.createElement('script');
        script.src = 'https://cdn.gotapapi.com/tap/v3/checkout.js';
        script.async = true;
        script.onload = () => {
          // Initialize Tap
          if (window.Tap) {
            const instance = new window.Tap({
              publicKey,
              currencyCode,
              locale
            });
            setTap(instance);
            setLoading(false);
          }
        };
        script.onerror = () => {
          setError(new Error('Failed to load payment processor'));
          setLoading(false);
        };
        document.body.appendChild(script);

        return () => {
          document.body.removeChild(script);
        };
      } catch (err: any) {
        setError(new Error(err?.message || 'Failed to load payment processor'));
        setLoading(false);
      }
    };

    loadScript();
  }, [publicKey, currencyCode, locale]);

  const createToken = async (cardData: any): Promise<any> => {
    if (!tap) {
      throw new Error('Tap SDK not initialized');
    }
    
    try {
      return await tap.createToken(cardData);
    } catch (err: any) {
      throw new Error(err?.message || 'Failed to create payment token');
    }
  };

  return { tap, loading, error, createToken };
};

export default useTap; 