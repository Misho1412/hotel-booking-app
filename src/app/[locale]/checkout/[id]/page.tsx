"use client";

import React, { useEffect, useState, useRef, Fragment } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Tab } from "@headlessui/react";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Input from "@/shared/Input";
import Label from "@/components/Label";
import Textarea from "@/shared/Textarea";
import ButtonPrimary from "@/shared/ButtonPrimary";
import StartRating from "@/components/StartRating";
import NcModal from "@/shared/NcModal";
import ModalSelectDate from "@/components/ModalSelectDate";
import converSelectedDateToString from "@/utils/converSelectedDateToString";
import ModalSelectGuests from "@/components/ModalSelectGuests";
import { GuestsObject } from "@/app/(client-components)/type";
import reservationService, { ReservationBackendRequest } from "@/lib/api/services/reservationService";
import paymentService from "@/lib/api/services/paymentService";
import Heading from "@/shared/Heading";
import { formatDate } from "@/utils/formatDate";
import Spinner from "@/shared/Spinner";
import { toast } from "react-hot-toast";
import Link from "next/link";

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const hotelId = params.id as string;
  const reservationId = searchParams.get("reservationId") || "";
  const roomId = searchParams.get("roomId") || "";
  const checkInString = searchParams.get("checkIn") || "";
  const checkOutString = searchParams.get("checkOut") || "";
  const guestsCount = parseInt(searchParams.get("guests") || "1", 10);
  const nightsCount = parseInt(searchParams.get("nights") || "1", 10);
  const totalPrice = parseFloat(searchParams.get("total") || "0");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [reservation, setReservation] = useState<any>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    specialRequests: "",
    paymentMethod: "credit_card",
    cardDetails: {
      cardNumber: "",
      nameOnCard: "",
      expiryMonth: "",
      expiryYear: "",
      cvv: "",
    },
  });

  const [startDate, setStartDate] = useState<Date | null>(
    checkInString ? new Date(checkInString) : new Date()
  );
  const [endDate, setEndDate] = useState<Date | null>(
    checkOutString ? new Date(checkOutString) : new Date(Date.now() + 86400000)
  );
  const [guests, setGuests] = useState<GuestsObject>({
    guestAdults: guestsCount || 1,
    guestChildren: 0,
    guestInfants: 0,
  });

  const [hotel, setHotel] = useState<any>(null);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    const fetchData = async () => {
      if (hasFetchedRef.current) return;
      hasFetchedRef.current = true;
      
      try {
        setIsLoading(true);
        
        // Check if user is logged in
        const token = typeof window !== 'undefined' ? localStorage.getItem('amr_auth_token') : null;
        setIsLoggedIn(!!token);

        // If not logged in, don't proceed with fetching hotel data
        if (!token) {
          setIsLoading(false);
          return;
        }

        // Step 1: If we have a reservation ID, fetch the reservation details
        if (reservationId && reservationId !== 'undefined') {
          console.log('Fetching existing reservation:', reservationId);
          try {
            const reservationData = await reservationService.getReservation(reservationId);
            setReservation(reservationData);
            console.log("Loaded reservation:", reservationData);
            
            // Pre-fill the form with reservation data if available
            if (reservationData.guestDetails) {
              setFormData(prev => ({
                ...prev,
                fullName: reservationData.guestDetails.fullName || "",
                email: reservationData.guestDetails.email || "",
                phoneNumber: reservationData.guestDetails.phoneNumber || "",
                specialRequests: reservationData.guestDetails.specialRequests || ""
              }));
            }
          } catch (error) {
            console.error('Error loading reservation:', error);
            // Continue with hotel fetch even if reservation fetch fails
          }
        } else {
          console.log('No valid reservation ID found, skipping reservation fetch');
        }
        
        // Step 2: Fetch hotel details
        const baseURL = process.env.NEXT_PUBLIC_AMR_API_URL || 'https://amrbooking.onrender.com/api';

        // Create headers with authentication token
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        };
        
        if (token) {
          headers['Authorization'] = `Token ${token}`;
        }
        
        const response = await fetch(`${baseURL}/hotels/${hotelId}`, {
          headers
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch hotel: ${response.status}`);
        }
        
        const hotelData = await response.json();
        setHotel(hotelData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load booking information");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [hotelId, reservationId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Double check if user is logged in before submitting
    const token = typeof window !== 'undefined' ? localStorage.getItem('amr_auth_token') : null;
    if (!token) {
      toast.error("You must be logged in to complete a booking");
      router.push(`/${params.locale}/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: If we don't have a reservation yet, create one
      let currentReservation = reservation;
      
      if (!currentReservation) {
        // Format dates in the expected format (DD/MM/YYYY)
        const formatDateForBE = (date: Date | null) => {
          if (!date) return "";
          const day = date.getDate().toString().padStart(2, '0');
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const year = date.getFullYear();
          return `${day}/${month}/${year}`;
        };

        // Create using the backend format
        const reservationData: ReservationBackendRequest = {
          room_id: roomId,
          childs: guests.guestChildren?.toString() || "0",
          adults: guests.guestAdults?.toString() || "1",
          price_per_night: (totalPrice / nightsCount).toFixed(0),
          payment_method: formData.paymentMethod,
          currency: "USD",
          special_requests: formData.specialRequests,
          check_in_date: formatDateForBE(startDate),
          check_out_date: formatDateForBE(endDate),
          notes: "Booking from checkout page"
        };

        currentReservation = await reservationService.createReservation(reservationData);
        toast.success("Reservation created");
      } else {
        // Update the existing reservation with guest details
        const updateData = {
          guestDetails: {
            fullName: formData.fullName,
            email: formData.email,
            phoneNumber: formData.phoneNumber,
            specialRequests: formData.specialRequests
          }
        };
        
        currentReservation = await reservationService.patchReservation(currentReservation.id, updateData);
        toast.success("Reservation updated");
      }

      // Step 2: Process payment
      const paymentData = {
        reservationId: currentReservation.id,
        amount: totalPrice,
        currency: "USD",
        paymentMethod: formData.paymentMethod as any,
        cardDetails: formData.paymentMethod === "credit_card" ? {
          cardNumber: formData.cardDetails.cardNumber,
          expiryMonth: formData.cardDetails.expiryMonth,
          expiryYear: formData.cardDetails.expiryYear,
          cvv: formData.cardDetails.cvv,
          nameOnCard: formData.cardDetails.nameOnCard
        } : undefined,
        notes: "Booking from website"
      };

      const payment = await paymentService.processPayment(paymentData);
      toast.success("Payment processed successfully");

      // Step 3: Update reservation status to confirmed
      if (payment.status === 'completed' || payment.status === 'pending') {
        // Type assertion to preserve compatibility with the API interface
        const paymentStatus = payment.status === 'completed' ? 'paid' : 'pending' as 'paid' | 'pending';

        const updateReservationData = {
          status: 'confirmed' as const,
          paymentStatus
        };
        
        await reservationService.patchReservation(currentReservation.id, updateReservationData);
        toast.success("Booking confirmed!");
        
        // Step 4: Make a GET request to /reservation/{id}/ to get the latest reservation data
        if (currentReservation.id && currentReservation.id !== 'undefined') {
          console.log(`Making GET request to /reservation/${currentReservation.id}/ after payment success`);
          try {
            const updatedReservation = await reservationService.getReservation(currentReservation.id);
            console.log("Updated reservation data after payment:", updatedReservation);
            // We don't need to do anything with this data, just making the request
          } catch (error) {
            console.error("Error getting updated reservation details:", error);
            // Don't block the flow if this request fails
          }
        } else {
          console.error("Invalid reservation ID after payment, cannot make GET request:", currentReservation.id);
        }
      }

      // Step 5: Navigate to success page with reservation and payment IDs
      router.push(`/${params.locale}/booking-confirmation/${currentReservation.id}?paymentId=${payment.id}`);
    } catch (error: any) {
      console.error("Booking error:", error);
      toast.error(error.message || "Failed to complete booking");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container relative pt-10 pb-20 lg:pt-20 lg:pb-28">
        <div className="flex justify-center items-center h-60">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="container relative pt-10 pb-20 lg:pt-20 lg:pb-28">
        <div className="bg-white dark:bg-neutral-900 shadow-xl rounded-2xl p-10">
          <Heading>Login Required</Heading>
          <p className="mt-4 text-lg">You need to be logged in to make a reservation.</p>
          <div className="mt-8">
            <Link
              href={`/${params.locale}/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`}
              className="nc-Button relative h-auto inline-flex items-center justify-center rounded-full transition-colors text-sm sm:text-base font-medium py-3 px-4 sm:py-3.5 sm:px-6 disabled:bg-opacity-90 bg-primary-6000 hover:bg-primary-700 text-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-6000 dark:focus:ring-offset-0"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="container relative pt-10 pb-20 lg:pt-20 lg:pb-28">
        <Heading>Hotel not found</Heading>
        <p className="mt-4">The hotel you are looking for could not be found.</p>
      </div>
    );
  }

  const renderSidebar = () => {
    const totalGuests = (guests.guestAdults || 0) + (guests.guestChildren || 0);
    const pricePerNight = totalPrice / nightsCount;
    
    return (
      <div className="w-full flex flex-col sm:rounded-2xl lg:border border-neutral-200 dark:border-neutral-700 space-y-6 sm:space-y-8 px-0 sm:p-6 xl:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center">
          <div className="flex-shrink-0 w-full sm:w-40">
            <div className="aspect-w-4 aspect-h-3 sm:aspect-h-4 rounded-2xl overflow-hidden">
              <Image
                alt={hotel.name}
                fill
                sizes="200px"
                src={hotel.featuredImage || "https://images.pexels.com/photos/6373478/pexels-photo-6373478.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"}
              />
            </div>
          </div>
          <div className="py-5 sm:px-5 space-y-3">
            <div>
              <span className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-1">
                {hotel.location?.city}, {hotel.location?.country}
              </span>
              <span className="text-base font-medium mt-1 block">
                {hotel.name}
              </span>
            </div>
            <span className="block text-sm text-neutral-500 dark:text-neutral-400">
              {hotel.roomTypes?.[0]?.beds || 1} beds · {hotel.roomTypes?.[0]?.bathrooms || 1} baths
            </span>
            <div className="w-10 border-b border-neutral-200 dark:border-neutral-700"></div>
            <StartRating defaultValue={hotel.rating || 4.5} />
          </div>
        </div>
        <div className="flex flex-col space-y-4">
          <h3 className="text-2xl font-semibold">Price detail</h3>
          <div className="flex justify-between text-neutral-6000 dark:text-neutral-300">
            <span>${pricePerNight.toFixed(2)} x {nightsCount} {nightsCount > 1 ? 'nights' : 'night'}</span>
            <span>${(pricePerNight * nightsCount).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-neutral-6000 dark:text-neutral-300">
            <span>Service charge</span>
            <span>$0.00</span>
          </div>

          <div className="border-b border-neutral-200 dark:border-neutral-700"></div>
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container relative pt-10 pb-20 lg:pt-20 lg:pb-28">
      <div className="gap-10 lg:flex">
        <div className="w-full lg:w-3/5 xl:w-2/3 space-y-10 lg:space-y-14">
          <form onSubmit={handleSubmit}>
            <div className="space-y-10">
              <div className="bg-white dark:bg-neutral-900 shadow-xl rounded-2xl p-6 xl:p-8">
                <h2 className="text-3xl lg:text-4xl font-semibold">
                  Confirm and payment
                </h2>
                <div className="border-b border-neutral-200 dark:border-neutral-700 my-6"></div>
                
                <div className="space-y-8">
                  <div>
                    <h3 className="text-2xl font-semibold">Your trip</h3>
                    <NcModal
                      renderTrigger={(openModal) => (
                        <span
                          onClick={() => openModal()}
                          className="block lg:hidden underline mt-1 cursor-pointer"
                        >
                          View booking details
                        </span>
                      )}
                      renderContent={renderSidebar}
                      modalTitle="Booking details"
                    />
                  </div>

                  <div className="mt-6 border border-neutral-200 dark:border-neutral-700 rounded-3xl flex flex-col sm:flex-row divide-y sm:divide-x sm:divide-y-0 divide-neutral-200 dark:divide-neutral-700 overflow-hidden z-10">
                    <ModalSelectDate
                      defaultValue={[startDate, endDate]}
                      onSelectDate={({ startDate, endDate }) => {
                        setStartDate(startDate);
                        setEndDate(endDate);
                      }}
                      renderChildren={({ openModal }) => (
                        <button
                          onClick={openModal}
                          className="text-left flex-1 p-5 flex justify-between space-x-5 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                          type="button"
                        >
                          <div className="flex flex-col">
                            <span className="text-sm text-neutral-400">Date</span>
                            <span className="mt-1.5 text-lg font-semibold">
                              {converSelectedDateToString([startDate, endDate])}
                            </span>
                          </div>
                          <PencilSquareIcon className="w-6 h-6 text-neutral-6000 dark:text-neutral-400" />
                        </button>
                      )}
                    />

                    <ModalSelectGuests
                      defaultValue={guests}
                      onChangeGuests={setGuests}
                      renderChildren={({ openModal }) => (
                        <button
                          type="button"
                          onClick={openModal}
                          className="text-left flex-1 p-5 flex justify-between space-x-5 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                        >
                          <div className="flex flex-col">
                            <span className="text-sm text-neutral-400">Guests</span>
                            <span className="mt-1.5 text-lg font-semibold">
                              <span className="line-clamp-1">
                                {`${
                                  (guests.guestAdults || 0) +
                                  (guests.guestChildren || 0)
                                } Guests, ${guests.guestInfants || 0} Infants`}
                              </span>
                            </span>
                          </div>
                          <PencilSquareIcon className="w-6 h-6 text-neutral-6000 dark:text-neutral-400" />
                        </button>
                      )}
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-neutral-900 shadow-xl rounded-2xl p-6 xl:p-8">
                <h3 className="text-2xl font-semibold">Guest information</h3>
                <div className="border-b border-neutral-200 dark:border-neutral-700 my-6"></div>
                
                <div className="space-y-6">
                  <div className="space-y-1">
                    <Label>Full name</Label>
                    <Input 
                      name="fullName" 
                      value={formData.fullName} 
                      onChange={handleInputChange} 
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Email</Label>
                    <Input 
                      type="email" 
                      name="email" 
                      value={formData.email} 
                      onChange={handleInputChange} 
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Phone number</Label>
                    <Input 
                      type="tel" 
                      name="phoneNumber" 
                      value={formData.phoneNumber} 
                      onChange={handleInputChange} 
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Special requests</Label>
                    <Textarea 
                      name="specialRequests" 
                      value={formData.specialRequests} 
                      onChange={handleInputChange} 
                      placeholder="Any special requests or needs..."
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-neutral-900 shadow-xl rounded-2xl p-6 xl:p-8">
                <h3 className="text-2xl font-semibold">Payment method</h3>
                <div className="border-b border-neutral-200 dark:border-neutral-700 my-6"></div>
                
                <div className="mt-6">
                  <Tab.Group>
                    <Tab.List className="flex my-5 gap-1">
                      <Tab>
                        {({ selected }) => (
                          <button
                            type="button"
                            onClick={() => setFormData({...formData, paymentMethod: "credit_card"})}
                            className={`px-4 py-1.5 sm:px-6 sm:py-2.5 rounded-full flex items-center justify-center focus:outline-none ${
                              selected || formData.paymentMethod === "credit_card"
                                ? "bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900"
                                : " text-neutral-6000 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                            }`}
                          >
                            <span>Credit card</span>
                          </button>
                        )}
                      </Tab>
                      <Tab>
                        {({ selected }) => (
                          <button
                            type="button"
                            onClick={() => setFormData({...formData, paymentMethod: "paypal"})}
                            className={`px-4 py-1.5 sm:px-6 sm:py-2.5 rounded-full focus:outline-none ${
                              selected || formData.paymentMethod === "paypal"
                                ? "bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900"
                                : "text-neutral-6000 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                            }`}
                          >
                            Paypal
                          </button>
                        )}
                      </Tab>
                    </Tab.List>

                    <Tab.Panels>
                      <Tab.Panel className="space-y-5">
                        <div className="space-y-1">
                          <Label>Card number</Label>
                          <Input 
                            name="cardDetails.cardNumber" 
                            value={formData.cardDetails.cardNumber} 
                            onChange={handleInputChange} 
                            placeholder="1234 5678 9012 3456"
                            required={formData.paymentMethod === "credit_card"}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>Name on card</Label>
                          <Input 
                            name="cardDetails.nameOnCard" 
                            value={formData.cardDetails.nameOnCard} 
                            onChange={handleInputChange} 
                            placeholder="JOHN DOE"
                            required={formData.paymentMethod === "credit_card"}
                          />
                        </div>
                        <div className="flex space-x-5">
                          <div className="flex-1 space-y-1">
                            <Label>Expiry month</Label>
                            <Input 
                              name="cardDetails.expiryMonth" 
                              value={formData.cardDetails.expiryMonth} 
                              onChange={handleInputChange} 
                              placeholder="MM"
                              required={formData.paymentMethod === "credit_card"}
                            />
                          </div>
                          <div className="flex-1 space-y-1">
                            <Label>Expiry year</Label>
                            <Input 
                              name="cardDetails.expiryYear" 
                              value={formData.cardDetails.expiryYear} 
                              onChange={handleInputChange} 
                              placeholder="YY"
                              required={formData.paymentMethod === "credit_card"}
                            />
                          </div>
                          <div className="flex-1 space-y-1">
                            <Label>CVC</Label>
                            <Input 
                              name="cardDetails.cvv" 
                              value={formData.cardDetails.cvv} 
                              onChange={handleInputChange} 
                              placeholder="123"
                              required={formData.paymentMethod === "credit_card"}
                            />
                          </div>
                        </div>
                      </Tab.Panel>
                      <Tab.Panel className="space-y-5">
                        <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                          <p>You will be redirected to PayPal to complete your payment</p>
                        </div>
                      </Tab.Panel>
                    </Tab.Panels>
                  </Tab.Group>
                  <div className="pt-8">
                    <ButtonPrimary type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Processing..." : "Confirm and pay"}
                    </ButtonPrimary>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
        
        <div className="hidden lg:block flex-grow mt-14 lg:mt-0">
          <div className="sticky top-28">{renderSidebar()}</div>
        </div>
      </div>
    </div>
  );
} 