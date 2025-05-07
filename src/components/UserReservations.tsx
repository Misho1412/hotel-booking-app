"use client";

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Reservation } from '@/lib/api/services/reservationService';
import { getUserHotelReservations } from '@/lib/api/services/hotelService';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { CalendarDays, User } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';

interface UserReservationsProps {
  className?: string;
}

export default function UserReservations({ className }: UserReservationsProps) {
  const t = useTranslations('stay-listing.filters.reservations');
  const { isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set mounted on client-side only
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Skip if not mounted (server-side) or not authenticated
    if (!mounted || !isAuthenticated) return;
    
    async function fetchReservations() {
      setLoading(true);
      setError(null);
      try {
        const response = await getUserHotelReservations();
        setReservations(response.results?.slice(0, 3) || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching reservations');
        console.error('Failed to fetch reservations:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchReservations();
  }, [isAuthenticated, mounted]);

  // On server-side or if not authenticated, render nothing to prevent hydration errors
  if (!mounted || !isAuthenticated) {
    return null;
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{t('title')}</h3>
        <Link href="/reservations">
          <Button variant="link" size="sm">
            {t('viewAll')}
          </Button>
        </Link>
      </div>

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

      {!loading && !error && reservations.length === 0 && (
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="pt-4">
            <p className="text-gray-500 text-sm">{t('noReservations')}</p>
          </CardContent>
        </Card>
      )}

      {!loading && !error && reservations.length > 0 && (
        <div className="space-y-3">
          {reservations.map((reservation) => (
            <Link href={`/reservations/${reservation.id}`} key={reservation.id}>
              <Card className="hover:shadow-md transition-shadow border border-gray-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{reservation.hotelName || 'Hotel'}</CardTitle>
                  <CardDescription>
                    Booking #{reservation.id.substring(0, 8)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex items-center text-sm text-gray-600 mb-1">
                    <CalendarDays className="h-4 w-4 mr-2" />
                    <span>
                      {reservation.checkInDate && reservation.checkOutDate 
                        ? `${format(new Date(reservation.checkInDate), 'MMM d')} - ${format(new Date(reservation.checkOutDate), 'MMM d, yyyy')}`
                        : 'Dates not available'}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="h-4 w-4 mr-2" />
                    <span>{reservation.roomName || 'Room'} · {reservation.numberOfGuests} guests</span>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <div className={cn(
                    "text-xs px-2 py-1 rounded-full",
                    reservation.status === 'CONFIRMED' ? "bg-green-100 text-green-800" : 
                    reservation.status === 'PENDING' ? "bg-yellow-100 text-yellow-800" : 
                    "bg-gray-100 text-gray-800"
                  )}>
                    {reservation.status}
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
} 