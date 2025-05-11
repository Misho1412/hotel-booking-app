import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import CardInputs from './CardInputs';
import PaymentButton from './PaymentButton';
import { paymentFormSchema, type PaymentFormValues } from '@/lib/validationSchema';
import { Reservation, PaymentResponse } from '@/types/reservation';
import { processPayment } from '@/services/paymentService';
import useTap from '@/hooks/useTap';

// Add react-hook-form and @hookform/resolvers/zod to your dependencies if not already installed
// npm install react-hook-form @hookform/resolvers/zod

interface PaymentFormProps {
  reservation: Reservation;
  onSuccess: (paymentResponse: PaymentResponse) => void;
  onError: (error: any) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ 
  reservation, 
  onSuccess, 
  onError 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Tap integration - using environment variable for public key
  const publicKey = process.env.NEXT_PUBLIC_TAP_PUBLIC_KEY || '';
  const { createToken, loading: tapLoading, error: tapError } = useTap({ 
    publicKey,
    currencyCode: 'USD'
  });
  
  // Initialize form with validation
  const { 
    control, 
    handleSubmit, 
    formState: { errors },
    getValues
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      cardholderName: '',
      email: '',
      phone: '',
      cardNumber: '',
      expiryDate: '',
      cvc: ''
    }
  });
  
  // Handle confirmation dialog
  const handleConfirmation = () => {
    setShowConfirmation(true);
  };
  
  const cancelPayment = () => {
    setShowConfirmation(false);
  };
  
  // Process payment on form submission
  const processPaymentSubmission = async () => {
    setShowConfirmation(false);
    setIsSubmitting(true);
    
    try {
      const formValues = getValues();
      
      // Format card data for Tap
      const [expMonth, expYear] = formValues.expiryDate.split('/');
      
      const cardData = {
        name: formValues.cardholderName,
        number: formValues.cardNumber.replace(/\s+/g, ''),
        expiry: {
          month: expMonth,
          year: `20${expYear}` // Ensure full year format (e.g., 2025 not 25)
        },
        cvc: formValues.cvc
      };
      
      // Create token using Tap SDK
      const { id: token } = await createToken({ card: cardData });
      
      if (!token) {
        throw new Error('Failed to create payment token');
      }
      
      // Process payment with API
      const paymentResult = await processPayment({
        reservation_id: reservation.id,
        amount: reservation.total_amount,
        payment_method: 'card',
        payment_token: token,
        customer_email: formValues.email,
        customer_name: formValues.cardholderName,
        customer_phone: formValues.phone
      });
      
      // Handle 3D Secure if needed
      if (paymentResult.threeDSecure && paymentResult.redirect_url) {
        window.location.href = paymentResult.redirect_url;
        return;
      }
      
      // Payment successful
      toast.success('Payment processed successfully!');
      onSuccess(paymentResult);
      
    } catch (error: any) {
      console.error('Payment processing error:', error);
      
      let errorMessage = 'An error occurred while processing your payment';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast.error(errorMessage);
      onError(error);
      
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Submit handler shows confirmation first
  const onSubmit = () => {
    handleConfirmation();
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-6">Payment Details</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            className={`w-full px-4 py-3 rounded-lg border ${
              errors.email ? 'border-red-300' : 'border-gray-300'
            } focus:ring-2 focus:outline-none transition-colors`}
            placeholder="your@email.com"
            {...control.register('email')}
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number (optional)
          </label>
          <input
            type="tel"
            id="phone"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-blue-200 focus:border-blue-500 focus:ring-2 focus:outline-none transition-colors"
            placeholder="+1 (234) 567-8910"
            {...control.register('phone')}
            disabled={isSubmitting}
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>
        
        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-lg font-medium mb-4">Card Information</h3>
          
          <CardInputs
            control={control}
            errors={errors}
            isSubmitting={isSubmitting}
            publicKey={publicKey}
          />
        </div>
        
        <div className="pt-6">
          <PaymentButton
            isSubmitting={isSubmitting || tapLoading}
            amount={reservation.total_amount}
            isDisabled={Object.keys(errors).length > 0}
          />
          
          <p className="mt-4 text-xs text-gray-500 text-center">
            Your payment is secured with SSL encryption. 
            We do not store your card details.
          </p>
        </div>
      </form>
      
      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Confirm Payment</h3>
            <p className="mb-6">
              You are about to make a payment of <strong>${reservation.total_amount.toFixed(2)}</strong> for your reservation. 
              Would you like to proceed?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={cancelPayment}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={processPaymentSubmission}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentForm; 