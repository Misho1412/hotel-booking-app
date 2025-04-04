"use client";

import React, { FC, useEffect, useState } from "react";
import { Tab } from "@headlessui/react";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import visaPng from "@/images/vis.png";
import mastercardPng from "@/images/mastercard.svg";
import paypalPng from "@/images/paypal.svg";
import Input from "@/shared/Input";
import Label from "@/components/Label";
import Textarea from "@/shared/Textarea";
import ButtonPrimary from "@/shared/ButtonPrimary";
import StartRating from "@/components/StartRating";
import NcModal from "@/shared/NcModal";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import Image from "next/image";
import useHotels from "@/hooks/useHotels";
import Spinner from "@/shared/Spinner";
import Alert from "@/shared/Alert";
import { IHotel } from "@/lib/api/schemas/hotel";
import { format, addDays, differenceInDays } from "date-fns";
import bookingService from "@/lib/api/services/bookingService";

interface CheckoutPageProps {}

const CheckoutPage: FC<CheckoutPageProps> = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  
  // Get query parameters for booking details
  const checkInParam = searchParams.get('checkIn');
  const checkOutParam = searchParams.get('checkOut');
  const guestsParam = searchParams.get('guests');
  const nightsParam = searchParams.get('nights');
  const totalParam = searchParams.get('total');
  
  // Default values if params are missing
  const checkInDate = checkInParam ? new Date(checkInParam) : new Date();
  const checkOutDate = checkOutParam ? new Date(checkOutParam) : addDays(new Date(), 1);
  const guests = guestsParam ? parseInt(guestsParam) : 2;
  const nights = nightsParam ? parseInt(nightsParam) : differenceInDays(checkOutDate, checkInDate);
  const totalPrice = totalParam ? parseInt(totalParam) : 0;
  
  // Form state
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"credit" | "paypal">("credit");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  
  // Processing state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  
  // Fetch hotel data
  const { isLoading, error, stayData, hotels, fetchHotelBySlug } = useHotels({
    autoFetch: false,
  });

  useEffect(() => {
    if (slug) {
      fetchHotelBySlug(slug).catch(error => {
        console.error("Failed to fetch hotel details:", error);
      });
    }
  }, [slug, fetchHotelBySlug]);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hotels || !hotels.length) {
      setBookingError("Hotel information is missing");
      return;
    }
    
    // Validate form
    if (!customerName.trim()) {
      setBookingError("Please enter your name");
      return;
    }
    
    if (!customerEmail.trim() || !customerEmail.includes("@")) {
      setBookingError("Please enter a valid email address");
      return;
    }
    
    if (paymentMethod === "credit") {
      if (!cardNumber.trim() || !cardName.trim() || !cardExpiry.trim() || !cardCvc.trim()) {
        setBookingError("Please complete all payment details");
        return;
      }
    }
    
    setIsSubmitting(true);
    setBookingError(null);
    
    try {
      // This would be replaced with actual booking API call
      const hotel = hotels[0] as IHotel;
      
      // Simulate API call
      const bookingResult = await new Promise<{success: boolean, bookingId: string}>((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            bookingId: `BK-${Math.floor(Math.random() * 1000000)}`
          });
        }, 1500);
      });
      
      if (bookingResult.success) {
        setBookingSuccess(true);
        
        // Redirect to confirmation page after a delay
        setTimeout(() => {
          router.push(`/booking-confirmation?id=${bookingResult.bookingId}`);
        }, 2000);
      } else {
        setBookingError("Failed to process booking. Please try again.");
      }
    } catch (error: any) {
      console.error("Booking error:", error);
      setBookingError(error.message || "An error occurred while processing your booking");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle loading and error states
  if (isLoading) {
    return (
      <div className="container mx-auto py-16 flex items-center justify-center">
        <Spinner size="lg" />
        <span className="ml-4 text-lg">Loading checkout details...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto py-16">
        <Alert type="error">
          <span className="font-medium">Error!</span> {error.message}
        </Alert>
        <button 
          onClick={() => router.back()}
          className="mt-4 text-primary-600 hover:underline"
        >
          ← Go back
        </button>
      </div>
    );
  }
  
  if (!hotels || !hotels.length || !stayData || !stayData.length) {
    return (
      <div className="container mx-auto py-16">
        <Alert>Hotel information not found.</Alert>
        <button 
          onClick={() => router.push('/hotels')}
          className="mt-4 text-primary-600 hover:underline"
        >
          ← Browse hotels
        </button>
      </div>
    );
  }
  
  const hotel = hotels[0] as IHotel;
  const data = stayData[0];
  
  // Helper function to format dates
  const formatDate = (date: Date) => {
    return format(date, "MMMM d, yyyy");
  };
  
  return (
    <div className="container mb-24 lg:mb-32 mt-12">
      <div className="flex flex-col lg:flex-row">
        {/* MAIN CONTENT */}
        <div className="w-full lg:w-3/5 xl:w-2/3 lg:pr-10">
          <div className="mb-12">
            <h2 className="text-3xl font-semibold">Complete your booking</h2>
            <p className="text-neutral-500 mt-2">
              You're booking a stay at {hotel.name}
            </p>
          </div>
          
          {/* SUCCESS MESSAGE */}
          {bookingSuccess && (
            <div className="mb-8">
              <Alert type="success">
                <span className="font-medium">Success!</span> Your booking is being processed. You will be redirected to the confirmation page...
              </Alert>
            </div>
          )}
          
          {/* ERROR MESSAGE */}
          {bookingError && (
            <div className="mb-8">
              <Alert type="error">
                <span className="font-medium">Error!</span> {bookingError}
              </Alert>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* BOOKING DETAILS */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6">
              <h3 className="text-xl font-semibold mb-4">Booking Details</h3>
              
              <div className="flex flex-col sm:flex-row justify-between text-neutral-700 dark:text-neutral-300 space-y-4 sm:space-y-0">
                <div>
                  <p className="text-sm text-neutral-500">Check-in</p>
                  <p className="font-medium">{formatDate(checkInDate)}</p>
                  <p className="text-sm">{hotel.check_in_time || "3:00 PM"}</p>
                </div>
                
                <div>
                  <p className="text-sm text-neutral-500">Check-out</p>
                  <p className="font-medium">{formatDate(checkOutDate)}</p>
                  <p className="text-sm">{hotel.check_out_time || "11:00 AM"}</p>
                </div>
                
                <div>
                  <p className="text-sm text-neutral-500">Guests</p>
                  <p className="font-medium">{guests} {guests === 1 ? 'Guest' : 'Guests'}</p>
                </div>
              </div>
            </div>
            
            {/* GUEST INFORMATION */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6">
              <h3 className="text-xl font-semibold mb-4">Guest Information</h3>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label>Full Name *</Label>
                  <Input 
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                
                <div className="space-y-1">
                  <Label>Email Address *</Label>
                  <Input 
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                  />
                  <span className="text-sm text-neutral-500 block">
                    Your booking confirmation will be sent to this email
                  </span>
                </div>
                
                <div className="space-y-1">
                  <Label>Phone Number</Label>
                  <Input 
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Enter your phone number"
                  />
                </div>
                
                <div className="space-y-1">
                  <Label>Special Requests</Label>
                  <Textarea 
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="Let the hotel know about any special requirements"
                    rows={4}
                  />
                </div>
              </div>
            </div>
            
            {/* PAYMENT INFORMATION */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6">
              <h3 className="text-xl font-semibold mb-4">Payment Method</h3>
              
              <Tab.Group>
                <Tab.List className="flex my-5 gap-1">
                  <Tab 
                    className={({ selected }) => 
                      `px-4 py-2 rounded-full focus:outline-none ${
                        selected
                          ? "bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900"
                          : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      }`
                    }
                    onClick={() => setPaymentMethod("credit")}
                  >
                    <div className="flex items-center">
                      <span className="mr-2">Credit Card</span>
                      <Image src={visaPng} alt="Visa" width={24} height={24} className="w-auto h-6" />
                      <Image src={mastercardPng} alt="Mastercard" width={24} height={24} className="w-auto h-6 ml-1" />
                    </div>
                  </Tab>
                  
                  <Tab 
                    className={({ selected }) => 
                      `px-4 py-2 rounded-full focus:outline-none ${
                        selected
                          ? "bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900"
                          : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      }`
                    }
                    onClick={() => setPaymentMethod("paypal")}
                  >
                    <div className="flex items-center">
                      <span className="mr-2">PayPal</span>
                      <Image src={paypalPng} alt="PayPal" width={24} height={24} className="w-auto h-5" />
                    </div>
                  </Tab>
                </Tab.List>
                
                <Tab.Panels>
                  {/* CREDIT CARD */}
                  <Tab.Panel className="space-y-4">
                    <div className="space-y-1">
                      <Label>Card Number *</Label>
                      <Input 
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="0000 0000 0000 0000"
                        required={paymentMethod === "credit"}
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <Label>Cardholder Name *</Label>
                      <Input 
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="Name as it appears on card"
                        required={paymentMethod === "credit"}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label>Expiration Date *</Label>
                        <Input 
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="MM/YY"
                          required={paymentMethod === "credit"}
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <Label>CVC *</Label>
                        <Input 
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          placeholder="CVC"
                          required={paymentMethod === "credit"}
                        />
                      </div>
                    </div>
                  </Tab.Panel>
                  
                  {/* PAYPAL */}
                  <Tab.Panel>
                    <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                      <p>You will be redirected to PayPal to complete your payment securely.</p>
                      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="flex items-center">
                          <i className="las la-info-circle text-lg mr-2 text-blue-500"></i>
                          <p>For demonstration purposes, no actual PayPal payment will be processed.</p>
                        </div>
                      </div>
                    </div>
                  </Tab.Panel>
                </Tab.Panels>
              </Tab.Group>
            </div>
            
            {/* SUBMIT BUTTON */}
            <div className="pt-4">
              <ButtonPrimary type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <Spinner size="sm" className="mr-2" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  <span>Complete Booking</span>
                )}
              </ButtonPrimary>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center mt-4">
                By clicking the button above, you agree to our terms of service and privacy policy.
              </p>
            </div>
          </form>
        </div>
        
        {/* SIDEBAR */}
        <div className="w-full lg:w-2/5 xl:w-1/3 mt-10 lg:mt-0">
          <div className="sticky top-24">
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-2xl overflow-hidden">
              {/* HOTEL IMAGE */}
              <div className="aspect-w-5 aspect-h-3">
                <Image
                  src={data.galleryImgs[0] || "/placeholder-image.jpg"}
                  alt={hotel.name}
                  fill
                  className="object-cover"
                />
              </div>
              
              {/* HOTEL INFO */}
              <div className="p-5">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">{hotel.name}</h3>
                  <div className="flex items-center">
                    <i className="las la-star text-yellow-500"></i>
                    <span className="ml-1 text-sm font-medium">{hotel.star_rating}</span>
                  </div>
                </div>
                
                <div className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                  <div className="flex items-center">
                    <i className="las la-map-marker-alt mr-2"></i>
                    <span>{data.address}</span>
                  </div>
                </div>
                
                <div className="w-full border-b border-neutral-200 dark:border-neutral-700 my-4"></div>
                
                {/* PRICE DETAILS */}
                <div className="space-y-3">
                  <h4 className="font-medium">Price Details</h4>
                  
                  <div className="flex justify-between text-neutral-700 dark:text-neutral-300">
                    <span>{data.price} x {nights} {nights === 1 ? 'night' : 'nights'}</span>
                    <span>${totalPrice}</span>
                  </div>
                  
                  <div className="flex justify-between text-neutral-700 dark:text-neutral-300">
                    <span>Service fee</span>
                    <span>$30</span>
                  </div>
                  
                  {hotel.discount_percentage && Number(hotel.discount_percentage) > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-{hotel.discount_percentage}%</span>
                    </div>
                  )}
                  
                  <div className="border-t border-neutral-200 dark:border-neutral-700 pt-3 flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${totalPrice + 30}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* BOOKING POLICIES */}
            <div className="mt-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-5">
              <h3 className="text-lg font-semibold mb-3">Booking Policies</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-start">
                  <i className="las la-calendar-check text-lg mr-2 text-neutral-600 dark:text-neutral-400 mt-0.5"></i>
                  <div>
                    <span className="font-medium block">Free Cancellation</span>
                    <span className="text-neutral-500 dark:text-neutral-400">Cancel before {hotel.check_in_time || "3:00 PM"} on {formatDate(addDays(checkInDate, -1))}</span>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <i className="las la-shield-alt text-lg mr-2 text-neutral-600 dark:text-neutral-400 mt-0.5"></i>
                  <div>
                    <span className="font-medium block">Secure Booking</span>
                    <span className="text-neutral-500 dark:text-neutral-400">Your payment information is protected</span>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <i className="las la-user-check text-lg mr-2 text-neutral-600 dark:text-neutral-400 mt-0.5"></i>
                  <div>
                    <span className="font-medium block">No Hidden Fees</span>
                    <span className="text-neutral-500 dark:text-neutral-400">The price you see is the final price</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* NEED HELP */}
            <div className="mt-6 text-center">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Need help with your booking?
              </p>
              <button className="text-sm text-primary-600 hover:text-primary-700 font-medium mt-1">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage; 