"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { CheckCircleIcon, CalendarIcon, CreditCardIcon, UserIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import ButtonPrimary from "@/shared/ButtonPrimary";
import Heading from "@/shared/Heading";
import StartRating from "@/components/StartRating";
import reservationService from "@/lib/api/services/reservationService";
import paymentService from "@/lib/api/services/paymentService";
import { formatDateDisplay } from "@/utils/formatDate";
import Spinner from "@/shared/Spinner";
import Link from "next/link";

export default function BookingConfirmationPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const reservationId = params.id as string;
  const paymentId = searchParams.get("paymentId");
  
  const [isLoading, setIsLoading] = useState(true);
  const [reservation, setReservation] = useState<any>(null);
  const [payment, setPayment] = useState<any>(null);
  const [hotel, setHotel] = useState<any>(null);
  const hasFetchedRef = useRef(false);
  
  useEffect(() => {
    const fetchData = async () => {
      if (hasFetchedRef.current) return;
      hasFetchedRef.current = true;
      
      try {
        setIsLoading(true);
        // Fetch reservation details with authentication
        const reservationData = await reservationService.getReservation(reservationId);
        setReservation(reservationData);
        
        // Fetch payment if we have payment ID
        if (paymentId) {
          const paymentData = await paymentService.getPayment(paymentId);
          setPayment(paymentData);
        }
        
        // Fetch hotel with direct API call using authentication token
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
            // Use correct format: "Token <token>" instead of "Bearer <token>"
            headers['Authorization'] = `Token ${token}`;
          }
          
          const response = await fetch(`${baseURL}/hotels/${reservationData.hotelId}`, {
            headers
          });
          
          if (!response.ok) {
            throw new Error(`Failed to fetch hotel: ${response.status}`);
          }
          
          const hotelData = await response.json();
          setHotel(hotelData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [reservationId, paymentId]); // Keep only necessary dependencies
  
  if (isLoading) {
    return (
      <div className="container relative pt-10 pb-20 lg:pt-20 lg:pb-28">
        <div className="flex justify-center items-center h-60">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }
  
  if (!reservation) {
    return (
      <div className="container relative pt-10 pb-20 lg:pt-20 lg:pb-28">
        <Heading>Reservation not found</Heading>
        <p className="mt-4">We couldn't find the reservation details. Please check the reservation ID.</p>
      </div>
    );
  }
  
  return (
    <div className="container relative pt-10 pb-20 lg:pt-20 lg:pb-28">
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
                {reservation.paymentStatus || payment?.status || "paid"}
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
        
        <div className="bg-white dark:bg-neutral-900 shadow-xl rounded-2xl p-6 xl:p-8 mb-8">
          <h3 className="text-2xl font-semibold mb-5">Payment Details</h3>
          <div className="border-b border-neutral-200 dark:border-neutral-700 mb-6"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <span className="text-neutral-600 dark:text-neutral-300 font-medium">Amount:</span>
              <p className="text-neutral-900 dark:text-white">
                ${payment?.amount || reservation.totalPrice || '0.00'}
              </p>
            </div>
            
            <div className="space-y-2">
              <span className="text-neutral-600 dark:text-neutral-300 font-medium">Payment Method:</span>
              <p className="text-neutral-900 dark:text-white capitalize">
                {(payment?.paymentMethod || "Credit Card").replace('_', ' ')}
              </p>
            </div>
            
            <div className="space-y-2">
              <span className="text-neutral-600 dark:text-neutral-300 font-medium">Transaction ID:</span>
              <p className="text-neutral-900 dark:text-white">
                {payment?.transactionId || paymentId || "Not available"}
              </p>
            </div>
            
            <div className="space-y-2">
              <span className="text-neutral-600 dark:text-neutral-300 font-medium">Date:</span>
              <p className="text-neutral-900 dark:text-white">
                {payment?.createdAt ? formatDateDisplay(payment.createdAt) : "Not available"}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-center gap-5">
          <p className="text-neutral-500 dark:text-neutral-400 text-center">
            A confirmation email has been sent to {reservation.guestDetails?.email}.<br />
            You can access your booking details anytime in your account.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href={`/${params.locale}`} passHref>
              <ButtonPrimary>Return to Home</ButtonPrimary>
            </Link>
            
            <Link href={`/${params.locale}/account/bookings`} passHref>
              <ButtonPrimary>View My Bookings</ButtonPrimary>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 