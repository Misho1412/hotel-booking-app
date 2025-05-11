'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import ReservationSummary from '@/components/checkout/ReservationSummary';
import PaymentForm from '@/components/checkout/PaymentForm';
import ApiErrorBoundary from '@/components/ApiErrorBoundary';
import { Reservation, PaymentResponse } from '@/types/reservation';
import { fetchReservation, ApiError } from '@/lib/api';

interface PageProps {
  params: {
    id: string;
    locale: string;
  };
}

const PaymentPage: React.FC<PageProps> = ({ params }) => {
  const router = useRouter();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadReservation = async () => {
      try {
        // Try to get reservation from session storage first
        const savedReservation = sessionStorage.getItem('currentReservation');
        
        if (savedReservation) {
          const parsedReservation = JSON.parse(savedReservation);
          
          if (parsedReservation && parsedReservation.id.toString() === params.id) {
            setReservation(parsedReservation);
            setIsLoading(false);
            return;
          }
        }

        // If no reservation in session storage or ID doesn't match, fetch from API
        const data = await fetchReservation(params.id);
        setReservation(data);
        // Store in session storage for future use
        sessionStorage.setItem('currentReservation', JSON.stringify(data));
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError('An unexpected error occurred. Please try again.');
        }
        console.error('Error loading reservation:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadReservation();
  }, [params.id]);

  const handlePaymentSuccess = (paymentResponse: PaymentResponse) => {
    // Store payment result for confirmation page
    sessionStorage.setItem('paymentResult', JSON.stringify(paymentResponse));
    
    // Clean up reservation data
    sessionStorage.removeItem('currentReservation');

    // Redirect to success page using URL object
    const searchParams = new URLSearchParams({
      payment_id: paymentResponse.id
    });
    
    // Redirect to success page using the correct route type
    const route = `/${params.locale}/booking-confirmation?payment_id=${paymentResponse.id}` as const;
  };

  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error);
    setError('Payment processing error. Please try again.');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-100 h-96 rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              <div className="h-36 bg-gray-200 rounded mt-8"></div>
              <div className="h-12 bg-gray-200 rounded mt-8"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !reservation) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="bg-red-50 border border-red-300 p-8 rounded-lg text-red-800">
          <h2 className="text-xl font-semibold mb-4">Error Loading Reservation</h2>
          <p>{error || 'Unable to load reservation details'}</p>
          <button
            onClick={() => router.back()}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Main content
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Complete Your Booking</h1>

      <ApiErrorBoundary
        onError={(error) => {
          toast.error('An unexpected error occurred. Please try again.');
          console.error('API Error:', error);
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <ReservationSummary reservation={reservation} />
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Secure Payment</h3>
              <p className="text-sm text-blue-700">
                Your payment information is encrypted and secure. We use industry standard
                security measures to protect your data.
              </p>
            </div>
          </div>
          <div>
            <PaymentForm
              reservation={reservation}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          </div>
        </div>
      </ApiErrorBoundary>
    </div>
  );
};

export default PaymentPage; 