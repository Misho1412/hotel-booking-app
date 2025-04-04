"use client";

import React, { FC, useState, useEffect } from "react";
import ButtonPrimary from "@/shared/ButtonPrimary";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Alert from "@/shared/Alert";
import Spinner from "@/shared/Spinner";
import bookingService from "@/lib/api/services/bookingService";

export interface PageBookingsProps {}

const PageBookings: FC<PageBookingsProps> = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // If not authenticated, redirect to login
      router.push("/login");
    } else if (isAuthenticated) {
      // Fetch bookings if authenticated
      fetchBookings();
    }
  }, [isLoading, isAuthenticated, router]);

  const fetchBookings = async () => {
    setFetchLoading(true);
    setError(null);
    try {
      const data = await bookingService.getUserBookings();
      setBookings(data);
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      setError(error.message || 'Failed to fetch bookings');
    } finally {
      setFetchLoading(false);
    }
  };

  if (isLoading || fetchLoading) {
    return (
      <div className="container mx-auto py-20 text-center">
        <div className="flex items-center justify-center">
          <Spinner size="lg" />
          <span className="ml-4 text-lg">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-20">
        <Alert>Please login to view your bookings</Alert>
        <div className="mt-8 text-center">
          <ButtonPrimary href="/login">Sign In</ButtonPrimary>
        </div>
      </div>
    );
  }

  return (
    <div className="nc-PageBookings">
      <div className="container py-16 lg:pb-28 lg:pt-20">
        <h2 className="text-3xl font-semibold">My Bookings</h2>
        <div className="mt-12">
          {error && (
            <Alert type="error">{error}</Alert>
          )}
          
          {!error && bookings.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-neutral-500">You don't have any bookings yet</h3>
              <div className="mt-6">
                <ButtonPrimary href="/hotels">Find a hotel</ButtonPrimary>
              </div>
            </div>
          )}
          
          {bookings.length > 0 && (
            <div className="space-y-8">
              {bookings.map((booking) => (
                <div 
                  key={booking.id} 
                  className="border border-neutral-200 dark:border-neutral-700 rounded-2xl overflow-hidden"
                >
                  <div className="p-6 flex flex-col md:flex-row">
                    <div className="flex-grow">
                      <h3 className="text-xl font-medium">{booking.hotelName || 'Hotel Booking'}</h3>
                      <div className="mt-2 text-neutral-500 dark:text-neutral-400">
                        <div>Reservation ID: {booking.id}</div>
                        <div>Check-in: {booking.checkInDate}</div>
                        <div>Check-out: {booking.checkOutDate}</div>
                        <div className="mt-2">
                          <span className="font-medium">Status: </span>
                          <span className={`
                            ${booking.status === 'confirmed' ? 'text-green-600 dark:text-green-400' : ''}
                            ${booking.status === 'pending' ? 'text-yellow-600 dark:text-yellow-400' : ''}
                            ${booking.status === 'cancelled' ? 'text-red-600 dark:text-red-400' : ''}
                          `}>
                            {booking.status ? booking.status.charAt(0).toUpperCase() + booking.status.slice(1) : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 md:mt-0 flex flex-col justify-between">
                      <div className="text-right">
                        <span className="text-xl font-semibold">${booking.totalPrice || 'N/A'}</span>
                      </div>
                      <div className="mt-4 md:mt-0">
                        <ButtonPrimary href={`/booking-details/${booking.id}`} className="w-full">
                          View Details
                        </ButtonPrimary>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageBookings; 