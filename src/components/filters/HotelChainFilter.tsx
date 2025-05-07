"use client";

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import hotelChainService, { HotelChain } from '@/lib/api/services/hotelChainService';

interface HotelChainFilterProps {
  onSelectChain: (chainId: string | null) => void;
  selectedChainId: string | null;
  className?: string;
}

export default function HotelChainFilter({ 
  onSelectChain, 
  selectedChainId, 
  className 
}: HotelChainFilterProps) {
  const t = useTranslations('stay-listing.filters.hotelChains');
  const [mounted, setMounted] = useState(false);
  const [chains, setChains] = useState<HotelChain[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set mounted state to true when component mounts (client-side only)
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Only fetch data on the client-side
    if (!mounted) return;

    async function fetchHotelChains() {
      setLoading(true);
      setError(null);
      try {
        const response = await hotelChainService.getAllHotelChains();
        setChains(response.results || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching hotel chains');
        console.error('Failed to fetch hotel chains:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchHotelChains();
  }, [mounted]);

  const handleSelectChain = (chainId: string | null) => {
    onSelectChain(chainId === selectedChainId ? null : chainId);
  };

  // Prevent hydration errors by rendering nothing on the server
  if (!mounted) {
    return (
      <div className={cn("space-y-4", className)}>
        <h3 className="text-lg font-semibold">{t('title')}</h3>
        <p className="text-sm text-gray-500">{t('description')}</p>
        <div className="py-4 text-center">
          <div className="animate-spin h-6 w-6 border-b-2 border-primary rounded-full mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="text-lg font-semibold">{t('title')}</h3>
      <p className="text-sm text-gray-500">{t('description')}</p>

      {loading && (
        <div className="py-4 text-center">
          <div className="animate-spin h-6 w-6 border-b-2 border-primary rounded-full mx-auto"></div>
        </div>
      )}

      {error && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-4">
            <p className="text-red-500 text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {!loading && !error && chains.length === 0 && (
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="pt-4">
            <p className="text-gray-500 text-sm">{t('noChains')}</p>
          </CardContent>
        </Card>
      )}

      {!loading && !error && chains.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedChainId === null ? "default" : "outline"}
            size="sm"
            onClick={() => handleSelectChain(null)}
            className="rounded-full"
          >
            {t('allChains')}
          </Button>
          
          {chains.map((chain) => (
            <Button
              key={chain.id}
              variant={selectedChainId === chain.id ? "default" : "outline"}
              size="sm"
              onClick={() => handleSelectChain(chain.id)}
              className="rounded-full"
            >
              {chain.name}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
} 