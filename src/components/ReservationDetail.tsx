import React, { useEffect, useState } from "react";
import { CheckCircleIcon, CalendarIcon, CreditCardIcon, UserIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Heading from "@/shared/Heading";
import StartRating from "@/components/StartRating";
import Spinner from "@/shared/Spinner";
import { formatDateDisplay } from "@/utils/formatDate";
import reservationService from "@/lib/api/services/reservationService";
import ButtonPrimary from "@/shared/ButtonPrimary";
import Link from "next/link";

interface ReservationDetailProps {
  reservationId: string;
  locale?: string;
}

export default function ReservationDetail({ reservationId, locale = 'en' }: ReservationDetailProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [reservation, setReservation] = useState<any>(null);
  const [hotel, setHotel] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReservationDetails = async () => {
      if (!reservationId) {
        setError("No reservation ID provided");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Fetch reservation details using the service
        const reservationData = await reservationService.getReservation(reservationId);
        console.log("Reservation data fetched:", reservationData);
        setReservation(reservationData);
        
        // Now fetch the hotel details if we have a hotel ID
        if (reservationData?.hotelId) {
          const baseURL = process.env.NEXT_PUBLIC_AMR_API_URL || 'https://amrbooking.onrender.com/api';
          
          // Get the token from localStorage if available
          const token = typeof window !== 'undefined' ? localStorage.getItem('amr_auth_token') : null;
          
          // Create headers with authentication token
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          };
          
          if (token) {
            headers['Authorization'] = `Token ${token}`;
          }
          
          const response = await fetch(`${baseURL}/hotels/${reservationData.hotelId}`, {
            headers
          });
          
          if (!response.ok) {
            console.error(`Failed to fetch hotel: ${response.status}`);
          } else {
            const hotelData = await response.json();
            setHotel(hotelData);
          }
        }
      } catch (error: any) {
        console.error("Error fetching reservation details:", error);
        setError(error.message || "Failed to load reservation details");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReservationDetails();
  }, [reservationId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <Heading>Error</Heading>
        <p className="mt-4 text-neutral-500">{error}</p>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="text-center py-10">
        <Heading>Reservation not found</Heading>
        <p className="mt-4 text-neutral-500">We couldn't find the reservation details. Please check the reservation ID.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex flex-col items-center text-center mb-10">
        <div className="relative flex items-center justify-center">
          <CheckCircleIcon className="h-16 w-16 text-green-600" />
        </div>
        <Heading>Booking Confirmed!</Heading>
        <p className="text-neutral-500 dark:text-neutral-400 mt-5">
          Your booking has been confirmed. Thank you for choosing to stay with us.
        </p>
      </div>
      
      <div className="bg-white dark:bg-neutral-900 shadow-xl rounded-2xl p-6 xl:p-8 mb-8">
        <h3 className="text-2xl font-semibold mb-5">Reservation Details</h3>
        <div className="border-b border-neutral-200 dark:border-neutral-700 mb-6"></div>
        
        <div className="flex flex-col sm:flex-row mb-6">
          <div className="flex-shrink-0 w-full sm:w-40 mb-4 sm:mb-0">
            <div className="aspect-w-4 aspect-h-3 sm:aspect-h-4 rounded-2xl overflow-hidden">
              <Image
                alt={hotel?.name || "Hotel Image"}
                fill
                sizes="200px"
                src={hotel?.featuredImage || "https://images.pexels.com/photos/6373478/pexels-photo-6373478.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"}
              />
            </div>
          </div>
          <div className="sm:pl-5 space-y-3">
            <div>
              <span className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-1">
                {hotel?.location?.city}, {hotel?.location?.country}
              </span>
              <span className="text-xl font-medium mt-1 block">
                {hotel?.name || "Hotel Name"}
              </span>
            </div>
            {hotel?.rating && <StartRating defaultValue={hotel.rating} />}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center">
              <CalendarIcon className="h-5 w-5 text-neutral-500 mr-2" />
              <span className="text-neutral-600 dark:text-neutral-300 font-medium">Check-in:</span>
            </div>
            <p className="text-neutral-900 dark:text-white ml-7">
              {formatDateDisplay(reservation.checkInDate)}
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center">
              <CalendarIcon className="h-5 w-5 text-neutral-500 mr-2" />
              <span className="text-neutral-600 dark:text-neutral-300 font-medium">Check-out:</span>
            </div>
            <p className="text-neutral-900 dark:text-white ml-7">
              {formatDateDisplay(reservation.checkOutDate)}
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center">
              <UserIcon className="h-5 w-5 text-neutral-500 mr-2" />
              <span className="text-neutral-600 dark:text-neutral-300 font-medium">Guests:</span>
            </div>
            <p className="text-neutral-900 dark:text-white ml-7">
              {reservation.numberOfGuests} {reservation.numberOfGuests > 1 ? 'persons' : 'person'}
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center">
              <CreditCardIcon className="h-5 w-5 text-neutral-500 mr-2" />
              <span className="text-neutral-600 dark:text-neutral-300 font-medium">Payment Status:</span>
            </div>
            <p className="text-neutral-900 dark:text-white ml-7 capitalize">
              {reservation.paymentStatus || "pending"}
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="text-neutral-600 dark:text-neutral-300 font-medium">Status:</span>
            </div>
            <p className="text-neutral-900 dark:text-white ml-7 capitalize">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                reservation.status === 'confirmed' 
                  ? 'bg-green-100 text-green-800' 
                  : reservation.status === 'pending' 
                    ? 'bg-yellow-100 text-yellow-800'
                    : reservation.status === 'cancelled'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
              }`}>
                {reservation.status}
              </span>
            </p>
          </div>
        </div>
      </div>
      
      {reservation.guestDetails && (
        <div className="bg-white dark:bg-neutral-900 shadow-xl rounded-2xl p-6 xl:p-8 mb-8">
          <h3 className="text-2xl font-semibold mb-5">Guest Information</h3>
          <div className="border-b border-neutral-200 dark:border-neutral-700 mb-6"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <span className="text-neutral-600 dark:text-neutral-300 font-medium">Full Name:</span>
              <p className="text-neutral-900 dark:text-white">
                {reservation.guestDetails?.fullName}
              </p>
            </div>
            
            <div className="space-y-2">
              <span className="text-neutral-600 dark:text-neutral-300 font-medium">Email:</span>
              <p className="text-neutral-900 dark:text-white">
                {reservation.guestDetails?.email}
              </p>
            </div>
            
            <div className="space-y-2">
              <span className="text-neutral-600 dark:text-neutral-300 font-medium">Phone Number:</span>
              <p className="text-neutral-900 dark:text-white">
                {reservation.guestDetails?.phoneNumber}
              </p>
            </div>
            
            {reservation.guestDetails?.specialRequests && (
              <div className="space-y-2 md:col-span-2">
                <span className="text-neutral-600 dark:text-neutral-300 font-medium">Special Requests:</span>
                <p className="text-neutral-900 dark:text-white">
                  {reservation.guestDetails.specialRequests}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="flex flex-col items-center gap-5">
        <p className="text-neutral-500 dark:text-neutral-400 text-center">
          You can access your booking details anytime in your account.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href={`/${locale}`} passHref>
            <ButtonPrimary>Return to Home</ButtonPrimary>
          </Link>
          
          <Link href={`/${locale}/account/bookings`} passHref>
            <ButtonPrimary>View My Bookings</ButtonPrimary>
          </Link>
        </div>
      </div>
    </div>
  );
} 