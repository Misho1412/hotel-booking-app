import React, { useState } from "react";
import ButtonPrimary from "@/shared/ButtonPrimary";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useRouter } from "next/navigation";
import Spinner from "@/shared/Spinner";
import { differenceInDays, format, addDays } from "date-fns";

interface CheckAvailabilityFormProps {
  hotelId: string | number;
  hotelSlug: string;
  pricePerNight: string | number;
  onCheckAvailability?: (data: BookingFormData) => void;
  className?: string;
}

export interface BookingFormData {
  checkInDate: Date;
  checkOutDate: Date;
  guests: number;
  nights: number;
  totalPrice: number;
}

const CheckAvailabilityForm: React.FC<CheckAvailabilityFormProps> = ({
  hotelId,
  hotelSlug,
  pricePerNight,
  onCheckAvailability,
  className = "",
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Default dates - today and tomorrow
  const today = new Date();
  const tomorrow = addDays(today, 1);
  
  // Form state
  const [checkInDate, setCheckInDate] = useState<Date>(today);
  const [checkOutDate, setCheckOutDate] = useState<Date>(tomorrow);
  const [guests, setGuests] = useState(2);
  
  // Calculate number of nights between dates
  const nights = differenceInDays(checkOutDate, checkInDate);
  
  // Calculate total price
  const basePrice = typeof pricePerNight === 'string' 
    ? parseFloat(pricePerNight.replace(/[^0-9.-]+/g, "")) 
    : pricePerNight;
  
  const totalPrice = nights * basePrice;
  
  // Handle check-in date change
  const handleCheckInChange = (date: Date) => {
    setCheckInDate(date);
    
    // If check-out date is before new check-in date, update it
    if (differenceInDays(checkOutDate, date) < 1) {
      setCheckOutDate(addDays(date, 1));
    }
  };
  
  // Handle check-out date change
  const handleCheckOutChange = (date: Date) => {
    // Ensure check-out is after check-in
    if (differenceInDays(date, checkInDate) < 1) {
      setError("Check-out date must be after check-in date");
      return;
    }
    
    setCheckOutDate(date);
    setError("");
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate dates
    if (differenceInDays(checkOutDate, checkInDate) < 1) {
      setError("Check-out date must be after check-in date");
      return;
    }
    
    setError("");
    setIsLoading(true);
    
    const bookingData: BookingFormData = {
      checkInDate,
      checkOutDate,
      guests,
      nights,
      totalPrice
    };
    
    // Call onCheckAvailability if provided
    if (onCheckAvailability) {
      onCheckAvailability(bookingData);
      setIsLoading(false);
      return;
    }
    
    // Otherwise, redirect to checkout
    setTimeout(() => {
      // Format dates for URL
      const checkInStr = format(checkInDate, 'yyyy-MM-dd');
      const checkOutStr = format(checkOutDate, 'yyyy-MM-dd');
      
      // Use hotelId if hotelSlug is undefined
      const identifier = hotelSlug || hotelId;
      
      router.push(
        `/checkout/${identifier}?checkIn=${checkInStr}&checkOut=${checkOutStr}&guests=${guests}&nights=${nights}&total=${totalPrice}`
      );
      
      setIsLoading(false);
    }, 800);
  };
  
  return (
    <div className={`nc-CheckAvailabilityForm border border-neutral-200 dark:border-neutral-700 rounded-3xl ${className}`}>
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <h3 className="text-xl font-semibold">Check Availability</h3>
        
        {/* Dates */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Check In
            </label>
            <DatePicker
              selected={checkInDate}
              onChange={handleCheckInChange}
              minDate={today}
              className="w-full border rounded-lg border-neutral-200 dark:border-neutral-700 p-3 focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
              placeholderText="Select check-in date"
              dateFormat="MMMM d, yyyy"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Check Out
            </label>
            <DatePicker
              selected={checkOutDate}
              onChange={handleCheckOutChange}
              minDate={addDays(checkInDate, 1)}
              className="w-full border rounded-lg border-neutral-200 dark:border-neutral-700 p-3 focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
              placeholderText="Select check-out date"
              dateFormat="MMMM d, yyyy"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Guests
            </label>
            <div className="relative">
              <select
                className="w-full border rounded-lg border-neutral-200 dark:border-neutral-700 p-3 focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50 appearance-none"
                value={guests}
                onChange={(e) => setGuests(parseInt(e.target.value))}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <option key={num} value={num}>
                    {num} Guest{num > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <i className="las la-angle-down text-lg"></i>
              </div>
            </div>
          </div>
        </div>
        
        {/* Price Summary */}
        <div className="border-t border-b border-neutral-200 dark:border-neutral-700 py-4 space-y-3">
          {/* Night calculation */}
          <div className="flex justify-between">
            <span className="text-neutral-700 dark:text-neutral-300">
              ${basePrice} x {nights} night{nights > 1 ? "s" : ""}
            </span>
            <span className="font-semibold text-neutral-700 dark:text-neutral-300">
              ${totalPrice}
            </span>
          </div>
          
          {/* Service fee */}
          <div className="flex justify-between">
            <span className="text-neutral-700 dark:text-neutral-300">
              Service fee
            </span>
            <span className="font-semibold text-neutral-700 dark:text-neutral-300">
              $30
            </span>
          </div>
          
          {/* Total */}
          <div className="flex justify-between pt-4 font-semibold">
            <span>Total</span>
            <span>${totalPrice + 30}</span>
          </div>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="text-red-500 text-sm mt-1">{error}</div>
        )}
        
        {/* Submit button */}
        <ButtonPrimary 
          type="submit" 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <Spinner size="sm" className="mr-2" />
              <span>Checking...</span>
            </div>
          ) : (
            <span>Check Availability</span>
          )}
        </ButtonPrimary>
        
        {/* Disclaimer */}
        <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center">
          You won't be charged yet. You'll confirm booking details in the next step.
        </p>
      </form>
    </div>
  );
};

export default CheckAvailabilityForm; 