"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ButtonPrimary from "@/shared/ButtonPrimary";
import Spinner from "@/shared/Spinner";
import Alert from "@/shared/Alert";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";

const BookingConfirmationPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("id");
  const [isLoading, setIsLoading] = useState(true);
  
  // Mock booking data - in a real app, this would be fetched from the API
  const [bookingData, setBookingData] = useState<any>(null);
  
  useEffect(() => {
    if (!bookingId) {
      setIsLoading(false);
      return;
    }
    
    // Simulate API call to fetch booking details
    const simulateFetchBooking = async () => {
      setIsLoading(true);
      
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        // Mock booking data
        setBookingData({
          id: bookingId,
          status: "confirmed",
          createdAt: new Date(),
          hotel: {
            name: "Luxury Resort & Spa",
            address: "123 Beach Road, Miami, FL",
            imageUrl: "https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
          },
          checkIn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          checkOut: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
          guests: 2,
          nights: 3,
          roomType: "Deluxe Ocean View",
          price: 750,
          serviceFee: 30,
          totalAmount: 780,
          paymentMethod: "Credit Card",
          lastFourDigits: "4242",
        });
      } catch (error) {
        console.error("Error fetching booking:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    simulateFetchBooking();
  }, [bookingId]);
  
  // Handle loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-16 flex flex-col items-center justify-center">
        <Spinner size="lg" />
        <span className="mt-4 text-lg">Loading your booking confirmation...</span>
      </div>
    );
  }
  
  // Handle missing booking ID
  if (!bookingId) {
    return (
      <div className="container mx-auto py-16">
        <Alert type="error">
          <span className="font-medium">Error!</span> Booking ID is missing. Please check your URL.
        </Alert>
        <div className="mt-6 text-center">
          <ButtonPrimary onClick={() => router.push('/hotels')}>
            Browse Hotels
          </ButtonPrimary>
        </div>
      </div>
    );
  }
  
  // Handle booking not found
  if (!bookingData) {
    return (
      <div className="container mx-auto py-16">
        <Alert type="error">
          <span className="font-medium">Error!</span> Booking information not found.
        </Alert>
        <div className="mt-6 text-center">
          <ButtonPrimary onClick={() => router.push('/hotels')}>
            Browse Hotels
          </ButtonPrimary>
        </div>
      </div>
    );
  }
  
  // Format date for display
  const formatDate = (date: Date) => {
    return format(new Date(date), "MMMM d, yyyy");
  };
  
  return (
    <div className="container mx-auto py-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* SUCCESS HEADER */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-green-100 flex items-center justify-center rounded-full mx-auto mb-4">
            <i className="las la-check-circle text-4xl text-green-600"></i>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Booking Confirmed!</h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            Your reservation has been successfully confirmed. You'll receive a confirmation email shortly.
          </p>
        </div>
        
        {/* BOOKING DETAILS CARD */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden shadow-lg">
          {/* HEADER */}
          <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Booking Confirmation</h2>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">
                  Confirmation #{bookingData.id}
                </p>
              </div>
              <div className="bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-500 py-1 px-3 rounded-full text-sm font-medium">
                {bookingData.status.charAt(0).toUpperCase() + bookingData.status.slice(1)}
              </div>
            </div>
          </div>
          
          {/* HOTEL INFO */}
          <div className="flex flex-col md:flex-row border-b border-neutral-200 dark:border-neutral-700">
            <div className="md:w-1/3 relative">
              <div className="aspect-w-4 aspect-h-3">
                <Image 
                  src={bookingData.hotel.imageUrl} 
                  alt={bookingData.hotel.name}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="p-6 md:w-2/3">
              <h3 className="text-lg font-semibold mb-2">{bookingData.hotel.name}</h3>
              <div className="flex items-center text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                <i className="las la-map-marker-alt mr-2 text-neutral-500"></i>
                <span>{bookingData.hotel.address}</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Check-in</p>
                  <p className="font-medium">{formatDate(bookingData.checkIn)}</p>
                  <p className="text-sm">After 3:00 PM</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Check-out</p>
                  <p className="font-medium">{formatDate(bookingData.checkOut)}</p>
                  <p className="text-sm">Before 11:00 AM</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Room Type</p>
                  <p className="font-medium">{bookingData.roomType}</p>
                  <p className="text-sm">{bookingData.guests} Guests</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* PRICE DETAILS */}
          <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
            <h3 className="text-lg font-semibold mb-4">Price Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-neutral-700 dark:text-neutral-300">
                <span>${bookingData.price / bookingData.nights} x {bookingData.nights} nights</span>
                <span>${bookingData.price}</span>
              </div>
              <div className="flex justify-between text-neutral-700 dark:text-neutral-300">
                <span>Service fee</span>
                <span>${bookingData.serviceFee}</span>
              </div>
              <div className="border-t border-neutral-200 dark:border-neutral-700 pt-3 flex justify-between font-semibold">
                <span>Total</span>
                <span>${bookingData.totalAmount}</span>
              </div>
            </div>
          </div>
          
          {/* PAYMENT INFO */}
          <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
            <h3 className="text-lg font-semibold mb-4">Payment Information</h3>
            <div className="flex items-center">
              <i className="las la-credit-card text-lg mr-2 text-neutral-600 dark:text-neutral-400"></i>
              <div>
                <span className="font-medium">{bookingData.paymentMethod}</span>
                {bookingData.lastFourDigits && (
                  <span className="ml-2 text-neutral-500 dark:text-neutral-400">
                    ending in {bookingData.lastFourDigits}
                  </span>
                )}
              </div>
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
              Payment processed on {formatDate(bookingData.createdAt)}
            </p>
          </div>
          
          {/* ACTIONS */}
          <div className="p-6 flex flex-wrap gap-4">
            <ButtonPrimary href="/hotels" className="flex-1 sm:flex-none">
              <i className="las la-search mr-2"></i>
              Book Another Stay
            </ButtonPrimary>
            
            <button className="flex-1 sm:flex-none px-4 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors flex items-center justify-center">
              <i className="las la-download mr-2"></i>
              Download Receipt
            </button>
            
            <button className="flex-1 sm:flex-none px-4 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors flex items-center justify-center">
              <i className="las la-print mr-2"></i>
              Print
            </button>
          </div>
        </div>
        
        {/* ADDITIONAL INFO */}
        <div className="mt-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4">What's Next?</h3>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-primary-50 dark:bg-primary-900/30 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <i className="las la-envelope text-primary-600 dark:text-primary-500"></i>
              </div>
              <div className="ml-4">
                <h4 className="font-medium">Check Your Email</h4>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  We've sent a confirmation email with all the details of your booking.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-primary-50 dark:bg-primary-900/30 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <i className="las la-suitcase text-primary-600 dark:text-primary-500"></i>
              </div>
              <div className="ml-4">
                <h4 className="font-medium">Pack Your Bags</h4>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Get ready for your trip and make sure to bring everything you need.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-primary-50 dark:bg-primary-900/30 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <i className="las la-concierge-bell text-primary-600 dark:text-primary-500"></i>
              </div>
              <div className="ml-4">
                <h4 className="font-medium">Need Assistance?</h4>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Our support team is available 24/7 to assist with any questions or concerns.
                </p>
                <button className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-1">
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* FOOTER */}
        <div className="mt-10 text-center">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Thank you for choosing AmrBooking for your stay.
          </p>
          <Link href="/" className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-1 inline-block">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationPage; 