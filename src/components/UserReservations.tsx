"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Reservation } from '@/lib/api/services/reservationService';
import { hotelService } from '@/lib/api/services';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';

interface UserReservationsProps {
  className?: string;
}

const UserReservations = ({ className }: UserReservationsProps) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReservations() {
      setLoading(true);
      setError(null);
      try {
        const reservations = await hotelService.getUserHotelReservations();
        setReservations(reservations);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Error fetching reservations');
        console.error('Error fetching reservations:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchReservations();
  }, []);

  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="text-lg font-semibold">Your Reservations</h3>

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
            <p className="text-gray-500 text-sm">No reservations found.</p>
          </CardContent>
        </Card>
      )}

      {!loading && !error && reservations.length > 0 && (
        <div className="space-y-4">
          {reservations.map((reservation) => (
            <Card key={reservation.id}>
              <CardHeader>
                <CardTitle>{reservation.hotel?.name}</CardTitle>
                <CardDescription>
                  Check-in: {new Date(reservation.check_in).toLocaleDateString()}
                  <br />
                  Check-out: {new Date(reservation.check_out).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Status: {reservation.status}</p>
                <p>Guests: {reservation.guests}</p>
                <p>Total: ${reservation.total_price}</p>
              </CardContent>
              <CardFooter>
                <Link 
                  href={{
                    pathname: '/booking/[id]',
                    query: { id: reservation.id }
                  }}
                >
                  View Details
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// Export a dynamic version with SSR disabled
export default dynamic(() => Promise.resolve(UserReservations), {
  ssr: false
}); 