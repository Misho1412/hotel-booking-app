"use client";

import React, { useEffect, useState, useRef, Fragment } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from 'next/dynamic';
import { Dialog, Transition } from '@headlessui/react';
import { toast } from "react-hot-toast";

// Components
import BgGlassmorphism from "@/components/BgGlassmorphism";
import GallerySlider from "@/components/GallerySlider";
import Avatar from "@/shared/Avatar";
import StartRating from "@/components/StartRating";
import Badge from "@/shared/Badge";
import ButtonPrimary from "@/shared/ButtonPrimary";
import ButtonSecondary from "@/shared/ButtonSecondary";
import FiveStartIconForRate from "@/components/FiveStartIconForRate";
import CommentListing from "@/components/CommentListing";
import Spinner from "@/shared/Spinner";
import Alert from "@/shared/Alert";
import Amenity from "@/components/Amenity";
import GuestsInput from "@/app/(listing-detail)/listing-stay-detail/GuestsInput";
import StayDatesRangeInput from "@/app/(listing-detail)/listing-stay-detail/StayDatesRangeInput";
import DateRangePickerWrapper from "./DateRangePickerWrapper";
import GuestPickerWrapper from "./GuestPickerWrapper";

// API and Services
import useHotels from "@/hooks/useHotels";
import { useRooms } from "@/hooks/useRooms";
import { useAuth } from "@/context/AuthContext";
import { IHotel } from "@/lib/api/schemas/hotel";
import roomService, { RoomReservationOption, MealPlan } from "@/lib/api/services/roomService";
import reservationService from "@/lib/api/services/reservationService";

// Dynamically import components
const AuthStatusIndicator = dynamic(
  () => import('@/components/auth/AuthStatusIndicator'),
  { ssr: false }
);

export interface HotelPageProps {
  params: {
    id: string;
    locale: string;
  };
}

// Add interface for Room type
interface Room {
  id?: string | number;
  name?: string;
  description?: string;
  capacity?: number;
  bedrooms?: number;
  roomNumber?: string;
  defaultPrice?: number;
  images?: Array<{image: string} | string>;
  amenities?: Array<{name: string} | string>;
  roomType?: {
    id?: string | number;
    name?: string;
    description?: string;
    capacity?: number;
    defaultPrice?: number;
  };
}

interface RoomType {
  id: number;
  name: string;
  description: string;
  max_occupancy: number;
  external_system_id: string;
  created_at: string;
  updated_at: string;
}

interface RoomView {
  id: number;
  name: string;
  description: string;
  external_system_id: string;
  created_at: string;
  updated_at: string;
}

interface RoomOptionResponse {
  room_type: RoomType;
  room_view: RoomView;
  price_per_night: string;
  total_price: string;
  rooms_needed: number;
  nights: number;
  max_occupancy: number;
}

export default function HotelPage({ params }: HotelPageProps) {
  const { id } = params;
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [manualAuthCheck, setManualAuthCheck] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isGuestPickerOpen, setIsGuestPickerOpen] = useState(false);
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [stayDuration, setStayDuration] = useState(3); // Default to 3 nights
  const [guestCount, setGuestCount] = useState(4); // Default to 4 guests
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 30);
  const [checkInDate, setCheckInDate] = useState(today);
  const [checkOutDate, setCheckOutDate] = useState(tomorrow);
  const [priceBreakdown, setPriceBreakdown] = useState({
    basePrice: 0,
    subtotal: 0,
    serviceCharge: 0,
    total: 0
  });
  
  const { isLoading: hotelsLoading, error, stayData, hotels, fetchHotelById, fetchHotelAmenities } = useHotels({
    autoFetch: false,
  });

  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [roomsError, setRoomsError] = useState<Error | null>(null);
  const [roomDetails, setRoomDetails] = useState<Record<string, any>>({});
  const [loadingRoomDetails, setLoadingRoomDetails] = useState<Record<string, boolean>>({});
  const [hotelAmenities, setHotelAmenities] = useState<any[]>([]);
  const [isLoadingAmenities, setIsLoadingAmenities] = useState(false);
  const authCheckedRef = useRef(false);
  
  // Get all room-related hooks
  const roomHooks = useRooms();
  const { 
    getRoomsByType 
  } = roomHooks;

  // Add new state for dynamic pricing
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // Add new state for room reservation options and meal plans
  const [roomOptions, setRoomOptions] = useState<RoomReservationOption[]>([]);
  const [selectedRoomOption, setSelectedRoomOption] = useState<RoomReservationOption | null>(null);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [selectedMealPlan, setSelectedMealPlan] = useState<MealPlan | null>(null);
  const [isLoadingRoomOptions, setIsLoadingRoomOptions] = useState(false);
  const [isLoadingMealPlans, setIsLoadingMealPlans] = useState(false);
  const [roomOptionsError, setRoomOptionsError] = useState<Error | null>(null);
  const [mealPlansError, setMealPlansError] = useState<Error | null>(null);
  
  // Calculate price breakdown when inputs change
  useEffect(() => {
    if (!selectedRoom && rooms.length > 0) {
      setSelectedRoom(rooms[0]); // Default to first room if none selected
    }

    if (selectedRoom) {
      const basePrice = selectedRoom.defaultPrice || selectedRoom.roomType?.defaultPrice || 119;
      const subtotal = basePrice * stayDuration;
      const serviceCharge = subtotal * 0.1; // 10% service charge
      const total = subtotal + serviceCharge;

      setPriceBreakdown({
        basePrice,
        subtotal,
        serviceCharge,
        total
      });
    }
  }, [selectedRoom, stayDuration, rooms]);

  // Fetch hotel data when component mounts
  useEffect(() => {
    const fetchHotelData = async () => {
      if (id) {
        try {
          await fetchHotelById(id);
        } catch (error) {
          console.error("Failed to fetch hotel details:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchHotelData();
  }, [id, fetchHotelById]);

  // Fetch rooms data - moved to top level
  useEffect(() => {
    const fetchRooms = async () => {
      // Only proceed if we have hotels data and the first hotel is loaded
      if (!id || !hotels || hotels.length === 0) return;
      
      // Get the hotel from the loaded hotels
      const hotel = hotels[0] as IHotel;
      if (!hotel || !hotel.id) return;
      
      try {
        setIsLoadingRooms(true);
        setRoomsError(null);

        // Get token for authentication
        const token = typeof window !== 'undefined' ? localStorage.getItem('amr_auth_token') : null;
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        };
        
        if (token) {
          headers['Authorization'] = `Token ${token}`;
        }
        
        // Get API base URL from env or use default
        const baseURL = process.env.NEXT_PUBLIC_AMR_API_URL || 'https://bookingengine.onrender.com/';
        const roomsURL = `${baseURL}rooms/api/v1/${id}`;
        
        console.log('Fetching rooms from:', roomsURL);
        
        const response = await fetch(roomsURL, { headers });
        console.log('Rooms API response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch rooms: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`Found ${data.length || (data.results && data.results.length) || 0} rooms`);
        
        // Check if response has results property (pagination) or is a direct array
        const roomsData = data.results || data;
        setRooms(roomsData);
      } catch (error) {
        console.error("Error fetching rooms:", error);
        setRoomsError(error instanceof Error ? error : new Error('Failed to fetch rooms'));
      } finally {
        setIsLoadingRooms(false);
      }
    };
    
    // Only fetch rooms if hotels have been loaded
    if (!hotelsLoading && hotels && hotels.length > 0) {
      fetchRooms();
    }
  }, [id, hotels, hotelsLoading]);

  // Fetch room details when a room is clicked or shown
  const fetchRoomDetails = async (roomId: string) => {
    if (!roomId) return; // Skip if no valid room ID
    
    // Toggle details if already loaded
    if (roomDetails[roomId]) {
      // If details already exist, remove them (toggle behavior)
      const newDetails = { ...roomDetails };
      delete newDetails[roomId];
      setRoomDetails(newDetails);
      return;
    }
    
    try {
      setLoadingRoomDetails(prev => ({ ...prev, [roomId]: true }));
      
      // Call the room details API directly using roomService
      console.log(`Fetching details for room ID: ${roomId}`);
      const data = await roomService.getRoomDetails(roomId);
      
      if (data) {
        setRoomDetails(prev => ({ 
          ...prev, 
          [roomId]: data 
        }));
        console.log(`Loaded detailed information for room ${roomId}:`, data);
      }
    } catch (error) {
      console.error(`Error fetching details for room ${roomId}:`, error);
    } finally {
      setLoadingRoomDetails(prev => ({ ...prev, [roomId]: false }));
    }
  };

  // Fetch amenities when we have a hotel ID
  useEffect(() => {
    const fetchAmenities = async () => {
      if (!id) return;
      
      try {
        setIsLoadingAmenities(true);
        const amenities = await fetchHotelAmenities(id);
        setHotelAmenities(amenities);
      } catch (error) {
        console.error("Error fetching amenities:", error);
      } finally {
        setIsLoadingAmenities(false);
      }
    };
    
    fetchAmenities();
  }, [id, fetchHotelAmenities]);

  // Add a useEffect to perform a manual auth check
  useEffect(() => {
    // Check for token in localStorage
    const token = localStorage.getItem('amr_auth_token');
    console.log('Manual token check:', !!token);
    setManualAuthCheck(!!token);
  }, []);

  // Fetch room reservation options and meal plans when hotel is selected
  useEffect(() => {
    const fetchRoomOptionsAndMealPlans = async () => {
      if (!id) return;

      try {
        setIsLoadingRoomOptions(true);
        setRoomOptionsError(null);
        
        // Fetch room options with query parameters
        const response = (await roomService.getRoomReservationOptions(
          id,
          checkInDate,
          checkOutDate,
          guestCount,
          0 // Default to 0 children
        ) as unknown) as RoomOptionResponse[];
        const options = response.map(item => ({
          room_type_id: item.room_type.id.toString(),
          room_type_name: item.room_type.name,
          room_view_id: item.room_view.id.toString(),
          room_view_name: item.room_view.name,
          price: parseFloat(item.price_per_night),
          currency: 'USD',
          available: true,
          max_occupancy: item.max_occupancy,
          description: item.room_type.description
        }));
        setRoomOptions(options);
        
        // Set default room option if none selected
        if (!selectedRoomOption && options.length > 0) {
          setSelectedRoomOption(options[0]);
          updatePriceBreakdown(options[0].price);
        }

        // Fetch meal plans
        setIsLoadingMealPlans(true);
        setMealPlansError(null);
        const plans = await roomService.getMealPlans(id);
        setMealPlans(plans);
        
        // Set default meal plan if none selected
        if (!selectedMealPlan && plans.length > 0) {
          setSelectedMealPlan(plans[0]);
        }
      } catch (error) {
        console.error('Error fetching room options and meal plans:', error);
        setRoomOptionsError(error instanceof Error ? error : new Error('Failed to fetch room options'));
        setMealPlansError(error instanceof Error ? error : new Error('Failed to fetch meal plans'));
      } finally {
        setIsLoadingRoomOptions(false);
        setIsLoadingMealPlans(false);
      }
    };
    
    fetchRoomOptionsAndMealPlans();
  }, [id, checkInDate, checkOutDate, guestCount]);
  
  // Update handleRoomTypeSelect function to automatically select the room
  const handleRoomTypeSelect = async (roomOption: RoomReservationOption) => {
    console.log("Room option selected:", roomOption);
    setSelectedRoomOption(roomOption);
    
    // Default to the first meal plan if none selected
    if (!selectedMealPlan && mealPlans.length > 0) {
      handleMealPlanSelect(mealPlans[0]);
    }
    
    // Update price breakdown
    updatePriceBreakdown(roomOption.price, selectedMealPlan?.price || 0);
  };
  
  // Improved helper function to format dates for the API in the required "DD/MM/YYYY" format
  const formatDateForAPI = (date: Date): string => {
    // Ensure valid date input
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      // Fallback to today's date if invalid
      date = new Date();
    }
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  };

  // Add a helper function to provide fallbacks for any missing reservation data
  const prepareReservationData = (
    hotelId: string,
    roomOption: RoomReservationOption | null,
    mealPlan: MealPlan | null,
    checkInDate: Date | null,
    checkOutDate: Date | null,
    guestCount: number
  ): ReservationBackendRequest => {
    // Validate required data
    if (!roomOption) {
      throw new Error('Room option is required');
    }
    if (!mealPlan) {
      throw new Error('Meal plan is required');
    }
    if (!checkInDate || !checkOutDate) {
      throw new Error('Check-in and check-out dates are required');
    }
    if (!guestCount || guestCount < 1) {
      throw new Error('Guest count must be at least 1');
    }

    // Format dates
    const fromDate = formatDateForAPI(checkInDate);
    const toDate = formatDateForAPI(checkOutDate);
    
    // Create meal plan counts using the actual meal plan ID
    const mealPlanCounts: Record<string, number> = {
      [mealPlan.id]: guestCount
    };

    return {
      hotel_id: hotelId,
      room_type_id: roomOption.room_type_id,
      room_view_id: roomOption.room_view_id,
      num_rooms: "1",
      meal_plan_counts: {}, // keep empty for now TODO: fix later
      from_date: fromDate,
      to_date: toDate,
      adults: guestCount.toString(),
      children: "0",
      special_requests: ""
    };
  };

  // Update handleRoomBookNow function to use the helper for more robust data preparation
  const handleRoomBookNow = async (roomOption: RoomReservationOption) => {
    console.log("Room option selected:", roomOption);
    
    // First select this room
    await handleRoomTypeSelect(roomOption);
    
    // Ensure meal plan is selected
    const mealPlan = selectedMealPlan || (mealPlans.length > 0 ? mealPlans[0] : null);
    if (!mealPlan) {
      toast.error("No meal plans available. Please select a meal plan.");
      return;
    }
    
    // Validate guest count
    if (!guestCount || guestCount < 1) {
      toast.error("Guest count must be at least 1.");
      return;
    }
    
    // Check authentication
    const isUserAuthenticated = isAuthenticated || manualAuthCheck;
    console.log("handleRoomBookNow called, authentication status:", isUserAuthenticated);
    
    if (!isUserAuthenticated) {
      // Save current URL for later redirect
      const currentUrl = window.location.pathname;
      localStorage.setItem('amr_redirect_after_login', currentUrl);
      
      toast.error("Please sign in to make a reservation");
      
      // Redirect to login page
      router.push(`/${params.locale}/login?redirect=${encodeURIComponent(currentUrl)}`);
      return;
    }
    
    try {
      setIsBookingLoading(true);
      
      // Prepare reservation data with validation
      const reservationData = prepareReservationData(
        params.id,
        roomOption,
        mealPlan,
        checkInDate,
        checkOutDate,
        guestCount
      );
      
      console.log("Creating reservation with data:", reservationData);
      
      // Make the API call to /reservations/api/v1/
      const reservation = await reservationService.createReservation(reservationData);
      console.log("Created reservation:", reservation);
      
      toast.success("Reservation created successfully!");
      
      // Redirect to payment page
      router.push(`/${params.locale}/payment/${reservation.id}` as any);
    } catch (error) {
      console.error("Booking error:", error);
      
      // Display the specific error message from the API if available
      if (error instanceof Error) {
        const errorMessage = error.message;
        if (errorMessage.includes('{')) {
          try {
            // Try to parse the error message as JSON
            const errorJson = errorMessage.replace(/'/g, '"'); // Replace single quotes with double quotes
            const parsedError = JSON.parse(errorJson);

            // Format each error field
            Object.entries(parsedError).forEach(([field, errors]) => {
              if (Array.isArray(errors)) {
                errors.forEach(err => {
                  if (typeof err === 'string') {
                    toast.error(`${field}: ${err}`);
                  } else if (err.detail) {
                    toast.error(`${field}: ${err.detail}`);
                  }
                });
              } else if (typeof errors === 'string') {
                toast.error(`${field}: ${errors}`);
              }
            });
          } catch (e) {
            toast.error(errorMessage);
          }
        } else {
          toast.error(errorMessage);
        }
      } else {
        toast.error("Failed to create reservation. Please try again.");
      }
      
      // Check if error is due to authentication
      if (error instanceof Error && 
          (error.message.includes('auth') || 
           error.message.includes('token') || 
           error.message.includes('unauthorized'))) {
        
        localStorage.setItem('amr_redirect_after_login', window.location.pathname);
        router.push(`/${params.locale}/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      }
    } finally {
      setIsBookingLoading(false);
    }
  };

  // Add a handler for meal plan selection
  const handleMealPlanSelect = (mealPlan: MealPlan) => {
    setSelectedMealPlan(mealPlan);
    
    // Update price breakdown to include meal plan cost
    if (selectedRoomOption) {
      updatePriceBreakdown(selectedRoomOption.price, mealPlan.price);
    }
  };
  
  // Improve price calculation to reflect all factors
  const updatePriceBreakdown = (roomPrice: number, mealPlanPrice: number = 0) => {
    // Ensure valid nights calculation (minimum 1 night)
    const nights = Math.max(1, stayDuration);
    
    // Calculate room subtotal
    const roomSubtotal = roomPrice * nights;
    
    // Calculate meal plan total based on guests and nights
    const mealPlanTotal = mealPlanPrice * (guestCount || 1) * nights;
    
    // Calculate service charge (10% of subtotal)
    const subtotal = roomSubtotal + mealPlanTotal;
    const serviceCharge = subtotal * 0.1;
    
    // Calculate total
    const total = subtotal + serviceCharge;
    
    // Update state
    setPriceBreakdown({
      basePrice: roomPrice,
      subtotal,
      serviceCharge,
      total
    });
  };

  // Update the main handleBookNow to use the helper for more robust data preparation
  const handleBookNow = async () => {
    // Check authentication more reliably using both the context and manual token check
    const isUserAuthenticated = isAuthenticated || manualAuthCheck;
    console.log("HandleBookNow called, authentication status:", isUserAuthenticated);
    
    if (!isUserAuthenticated) {
      // Save current URL including id parameter for later redirect
      const currentUrl = window.location.pathname;
      console.log(`User not authenticated, redirecting to login with return URL: ${currentUrl}`);
      
      // Store the current URL in localStorage for more reliable redirection after login
      localStorage.setItem('amr_redirect_after_login', currentUrl);
      
      // Redirect to login page with redirect param
      router.push(`/${params.locale}/login?redirect=${encodeURIComponent(currentUrl)}`);
      return;
    }

    try {
      setIsBookingLoading(true);
      
      // Prepare reservation data with fallbacks for any missing values
      const reservationData = prepareReservationData(
        params.id,
        selectedRoomOption,
        selectedMealPlan, 
        checkInDate,
        checkOutDate,
        guestCount || 1
      );
      
      console.log("Creating reservation with data:", reservationData);
      
      // Create reservation with the new format
      const reservation = await reservationService.createReservation(reservationData);
      console.log("Created reservation:", reservation);
      
      toast.success("Reservation created successfully!");
      
      // Redirect to payment page
      router.push(`/${params.locale}/payment/${reservation.id}` as any);
    } catch (error) {
      console.error("Booking error:", error);
      
      // Display the specific error message from the API if available
      if (error instanceof Error) {
        const errorMessage = error.message;
        if (errorMessage.includes('{')) {
          try {
            // Try to parse the error message as JSON
            const errorJson = errorMessage.replace(/'/g, '"'); // Replace single quotes with double quotes
            const parsedError = JSON.parse(errorJson);
            
            // Format each error field
            Object.entries(parsedError).forEach(([field, errors]) => {
              if (Array.isArray(errors)) {
                errors.forEach(err => {
                  if (typeof err === 'string') {
                    toast.error(`${field}: ${err}`);
                  } else if (err.detail) {
                    toast.error(`${field}: ${err.detail}`);
                  }
                });
              } else if (typeof errors === 'string') {
                toast.error(`${field}: ${errors}`);
              }
            });
          } catch (e) {
            toast.error(errorMessage);
          }
        } else {
          toast.error(errorMessage);
        }
      } else {
        toast.error("Failed to create reservation. Please try again.");
      }
      
      // Check if error is due to authentication
      if (error instanceof Error && 
          (error.message.includes('auth') || 
           error.message.includes('token') || 
           error.message.includes('unauthorized'))) {
        
        console.log("Authentication error during reservation, redirecting to login");
        localStorage.setItem('amr_redirect_after_login', window.location.pathname);
        router.push(`/${params.locale}/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      }
    } finally {
      setIsBookingLoading(false);
    }
  };

  // Update handleDateChange to properly re-fetch room options without creating a circular reference
  const handleDateChange = (startDate: Date, endDate: Date) => {
    if (!startDate || !endDate) {
      toast.error("Please select valid dates");
      return;
    }
    
    // Validate dates (ensure start is before end and not in the past)
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    if (startDate < now) {
      toast.error("Check-in date cannot be in the past");
      return;
    }
    
    if (endDate <= startDate) {
      toast.error("Check-out date must be after check-in date");
      return;
    }
    
    setCheckInDate(startDate);
    setCheckOutDate(endDate);
    
    // Calculate nights difference
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setStayDuration(diffDays);
    
    // Close the date picker
    setIsDatePickerOpen(false);
    
    // Provide feedback to the user
    toast.success(`Updating room availability for ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`);
    
    // The useEffect tied to checkInDate and checkOutDate will trigger a refresh automatically
  };
  
  // Update handleGuestChange to filter rooms based on capacity
  const handleGuestChange = (count: number) => {
    if (count <= 0) {
      toast.error("Please select at least one guest");
      return;
    }
    
    setGuestCount(count);
    setIsGuestPickerOpen(false);
    
    toast.success(`Updating room availability for ${count} guests`);
    
    // Room filtering will happen in the useEffect
  };

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <Alert type="error">
          <span className="font-medium">Error!</span> {error.message}
        </Alert>
      </div>
    );
  }

  if (isLoading || hotelsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Spinner size="lg" />
        <span className="ml-4 text-lg">Loading hotel details...</span>
      </div>
    );
  }

  if (!stayData || !stayData.length || !hotels || !hotels.length) {
    return (
      <div className="container mx-auto py-10">
        <Alert>No hotel details found for this id.</Alert>
      </div>
    );
  }

  const hotel = hotels[0] as IHotel;
  const data = stayData[0] || {
    galleryImgs: [],
    reviewStart: 0,
    reviewCount: 0,
    price: "N/A",
    author: {
      displayName: "Hotel Staff",
      avatar: ""
    }
  };
  
  // Add this before the return statement
  const RoomOptionSelector = () => {
    if (isLoadingRoomOptions) {
      return (
        <div className="flex items-center justify-center py-5">
          <Spinner className="h-8 w-8" />
          <span className="ml-2">Loading room options...</span>
        </div>
      );
    }

    if (roomOptionsError) {
      return (
        <Alert type="error" className="mb-4">
          <span className="font-medium">Error!</span> {roomOptionsError.message}
        </Alert>
      );
    }

    if (roomOptions.length === 0) {
      return <Alert>No room options available for this hotel.</Alert>;
    }

    return (
      <div className="grid gap-4">
        {roomOptions.map((option) => (
          <div
            key={`${option.room_type_id}-${option.room_view_id}`}
            className={`border p-4 rounded-lg cursor-pointer transition-all ${selectedRoomOption &&
              selectedRoomOption.room_type_id === option.room_type_id &&
              selectedRoomOption.room_view_id === option.room_view_id
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
              : 'border-neutral-200 hover:border-primary-300 dark:border-neutral-700'
              }`}
            onClick={() => handleRoomTypeSelect(option)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h5 className="font-medium">{option.room_type_name}</h5>
                <p className="text-sm text-neutral-500">{option.room_view_name} View</p>
                <p className="text-sm mt-2">Max guests: {option.max_occupancy}</p>
                {option.amenities && option.amenities.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-neutral-500">Amenities:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {option.amenities.map((amenity, idx) => (
                        <span
                          key={idx}
                          className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="text-lg font-bold text-primary-600">
                {option.currency === 'USD' ? '$' : option.currency}
                {option.price}
                <span className="text-sm font-normal text-neutral-500">/night</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="nc-ListingStayDetailPage relative">
      <BgGlassmorphism />


      {/* SINGLE HEADER */}
      <header className="container 2xl:px-14 rounded-md sm:rounded-xl mt-10">
        <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="md:col-span-1 lg:col-span-2 h-[300px] md:h-[400px]">
            <div className="relative h-full w-full">
              {data.galleryImgs && data.galleryImgs[0] ? (
                typeof data.galleryImgs[0] === 'string' ? (
                  <img src={data.galleryImgs[0]} alt="Featured" className="absolute inset-0 object-cover rounded-xl h-full w-full" />
                ) : (
                  <img src={data.galleryImgs[0].toString()} alt="Featured" className="absolute inset-0 object-cover rounded-xl h-full w-full" />
                )
              ) : (
                <img src="/placeholder.jpg" alt="Featured" className="absolute inset-0 object-cover rounded-xl h-full w-full" />
              )}
            </div>
          </div>
          <div className="hidden md:grid md:col-span-1 grid-rows-2 gap-4">
            <div className="relative h-[190px]">
              {data.galleryImgs && data.galleryImgs[1] ? (
                typeof data.galleryImgs[1] === 'string' ? (
                  <img src={data.galleryImgs[1]} alt="Featured" className="absolute inset-0 object-cover rounded-xl h-full w-full" />
                ) : (
                  <img src={data.galleryImgs[1].toString()} alt="Featured" className="absolute inset-0 object-cover rounded-xl h-full w-full" />
                )
              ) : (
                <img src="/placeholder.jpg" alt="Featured" className="absolute inset-0 object-cover rounded-xl h-full w-full" />
              )}
            </div>
            <div className="relative h-[190px]">
              {data.galleryImgs && data.galleryImgs[2] ? (
                typeof data.galleryImgs[2] === 'string' ? (
                  <img src={data.galleryImgs[2]} alt="Featured" className="absolute inset-0 object-cover rounded-xl h-full w-full" />
                ) : (
                  <img src={data.galleryImgs[2].toString()} alt="Featured" className="absolute inset-0 object-cover rounded-xl h-full w-full" />
                )
              ) : (
                <img src="/placeholder.jpg" alt="Featured" className="absolute inset-0 object-cover rounded-xl h-full w-full" />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="container relative z-10 pt-12 pb-24 lg:pt-16 lg:pb-32">
        <div className="flex flex-col lg:flex-row">
          {/* MAIN */}
          <div className="w-full lg:w-3/5 xl:w-2/3 space-y-8 lg:space-y-10 lg:pr-10">
            {/* ... existing main content ... */}
          </div>

          {/* SIDEBAR */}
          <div className="hidden lg:block w-full lg:w-2/5 xl:w-1/3 space-y-8 lg:pl-10">
            {/* ROOM OPTIONS & RESERVATION */}
            <div className="listingSectionSidebar__wrap shadow-xl dark:shadow-2xl">
              <h3 className="text-2xl font-semibold mb-6">Room Options & Reservation</h3>

              {/* Room Options */}
              <div className="mb-6">
                <h4 className="text-lg font-medium mb-3">Select Room Type & View</h4>
                <RoomOptionSelector />
              </div>

              {/* Meal Plans */}
              <div className="mb-6">
                <h4 className="text-lg font-medium mb-3">Select Meal Plan</h4>
                {isLoadingMealPlans ? (
                  <div className="flex items-center justify-center py-5">
                    <Spinner className="h-8 w-8" />
                    <span className="ml-2">Loading meal plans...</span>
                  </div>
                ) : mealPlansError ? (
                  <Alert type="error" className="mb-4">
                    <span className="font-medium">Error!</span> {mealPlansError.message}
                  </Alert>
                ) : mealPlans.length === 0 ? (
                  <Alert>No meal plans available for this hotel.</Alert>
                ) : (
                  <div className="grid gap-4">
                    {mealPlans.map((plan) => (
                      <div 
                        key={plan.id}
                        className={`border p-4 rounded-lg cursor-pointer transition-all ${
                          selectedMealPlan && selectedMealPlan.id === plan.id
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-neutral-200 hover:border-primary-300 dark:border-neutral-700'
                        }`}
                        onClick={() => handleMealPlanSelect(plan)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-medium">{plan.name}</h5>
                            <p className="text-sm text-neutral-500">{plan.description}</p>
                            {plan.included_meals && plan.included_meals.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs text-neutral-500">Includes:</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {plan.included_meals.map((meal: string, idx: number) => (
                                    <span 
                                      key={idx}
                                      className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800"
                                    >
                                      {meal}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="text-lg font-bold text-primary-600">
                            {plan.currency === 'USD' ? '$' : plan.currency} 
                            {plan.price}
                            <span className="text-sm font-normal text-neutral-500">/person</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* CURRENT RESERVATION DETAILS */}
              <div className="bg-neutral-50 dark:bg-neutral-800 rounded-2xl p-4 mt-4">
                <h4 className="text-base font-semibold mb-4">Your Reservation</h4>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-neutral-600 dark:text-neutral-300">
                    <span>
                      ${priceBreakdown.basePrice} x {stayDuration} nights
                      {selectedRoomOption && ` (${selectedRoomOption.room_type_name})`}
                    </span>
                    <span>${priceBreakdown.basePrice * stayDuration}</span>
                  </div>

                  {selectedMealPlan && (
                    <div className="flex justify-between text-neutral-600 dark:text-neutral-300">
                      <span>
                        {selectedMealPlan.name} x {guestCount} guests
                      </span>
                      <span>${selectedMealPlan.price * guestCount}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-neutral-600 dark:text-neutral-300">
                    <span>Service fee</span>
                    <span>${priceBreakdown.serviceCharge.toFixed(2)}</span>
                  </div>
                  
                  <div className="border-t border-neutral-200 dark:border-neutral-700 pt-3 flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${priceBreakdown.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* BOOK NOW BUTTON */}
              <div className="mt-6">
                <ButtonPrimary 
                  onClick={handleBookNow}
                  disabled={isBookingLoading || !selectedRoomOption || !selectedMealPlan}
                  className="w-full"
                >
                  {isBookingLoading ? (
                    <>
                      <Spinner className="h-5 w-5 mr-2" /> Processing...
                    </>
                  ) : (isAuthenticated || manualAuthCheck) ? (
                    "Book Now"
                  ) : (
                    "Sign in to reserve"
                  )}
                </ButtonPrimary>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 