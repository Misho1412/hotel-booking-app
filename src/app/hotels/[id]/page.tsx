"use client";

import React, { useEffect, useState, useRef, Fragment } from "react";
import { useRouter } from "next/navigation";
import { StaticImageData } from "next/image";
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
import SectionDateRange from "@/app/(listing-detail)/SectionDateRange";
import GuestsInput from "@/app/(listing-detail)/listing-stay-detail/GuestsInput";
import StayDatesRangeInput from "@/app/(listing-detail)/listing-stay-detail/StayDatesRangeInput";
import DateRangePickerWrapper from "./DateRangePickerWrapper";
import GuestPickerWrapper from "./GuestPickerWrapper";

// API and Services
import useHotels from "@/hooks/useHotels";
import { useRooms } from "@/hooks/useRooms";
import { useAuth } from "@/context/AuthContext";
import { IHotel } from "@/lib/api/schemas/hotel";
import { StayDataType } from "@/data/types";
import reservationService, { ReservationBackendRequest } from "@/lib/api/services/reservationService";
import roomService, { RoomReservationOption, MealPlan } from "@/lib/api/services/roomService";

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
  tomorrow.setDate(today.getDate() + 1);
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
      
      // Fetch room reservation options
      try {
        setIsLoadingRoomOptions(true);
        setRoomOptionsError(null);
        
        console.log('Fetching room options with dates:', {
          checkInDate: checkInDate?.toISOString(),
          checkOutDate: checkOutDate?.toISOString()
        });
        
        // Always fetch all available rooms first without date filtering
        let roomOptionsData = await roomService.getRoomReservationOptions(id);
        
        // If dates are selected, filter the rooms again
        if (checkInDate && checkOutDate) {
          try {
            const filteredOptions = await roomService.getRoomReservationOptions(id, checkInDate, checkOutDate);
            if (filteredOptions && filteredOptions.options && filteredOptions.options.length > 0) {
              roomOptionsData = filteredOptions;
            } else {
              toast("No rooms available for selected dates. Showing all rooms instead.");
            }
          } catch (error) {
            console.error("Error filtering rooms by date:", error);
            toast("Could not filter rooms by date. Showing all available rooms.");
          }
        }
        
        console.log('Room options data:', roomOptionsData);
        
        if (roomOptionsData && roomOptionsData.options) {
          // Filter options based on guest count if specified
          let filteredOptions = roomOptionsData.options;
          if (guestCount > 0) {
            filteredOptions = roomOptionsData.options.filter(option => option.max_occupancy >= guestCount);
            
            // If no rooms match guest count, show all options with a warning
            if (filteredOptions.length === 0) {
              toast("No rooms available for this number of guests. Showing all rooms.");
              filteredOptions = roomOptionsData.options;
            }
          }
          
          setRoomOptions(filteredOptions);
          // Pre-select the first option if available
          if (filteredOptions.length > 0) {
            setSelectedRoomOption(filteredOptions[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching room options:', error);
        setRoomOptionsError(error instanceof Error ? error : new Error('Failed to fetch room options'));
      } finally {
        setIsLoadingRoomOptions(false);
      }
      
      // Fetch meal plans
      try {
        setIsLoadingMealPlans(true);
        setMealPlansError(null);
        
        const mealPlansData = await roomService.getMealPlans(id);
        console.log('Meal plans data:', mealPlansData);
        
        if (mealPlansData && mealPlansData.length > 0) {
          setMealPlans(mealPlansData);
          // Pre-select the first meal plan if available
          setSelectedMealPlan(mealPlansData[0]);
        } else {
          // Add a default meal plan if none are returned
          const defaultMealPlan = {
            id: "1",
            name: "Standard Breakfast",
            description: "Continental breakfast included",
            price: 15,
            currency: "USD",
            included_meals: ["Breakfast"]
          };
          setMealPlans([defaultMealPlan]);
          setSelectedMealPlan(defaultMealPlan);
        }
      } catch (error) {
        console.error('Error fetching meal plans:', error);
        setMealPlansError(error instanceof Error ? error : new Error('Failed to fetch meal plans'));
        
        // Add a default meal plan if fetch fails
        const defaultMealPlan = {
          id: "1",
          name: "Standard Breakfast",
          description: "Continental breakfast included",
          price: 15,
          currency: "USD",
          included_meals: ["Breakfast"]
        };
        setMealPlans([defaultMealPlan]);
        setSelectedMealPlan(defaultMealPlan);
      } finally {
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
    // Use fallback values for any missing data
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    // Format required date values
    const fromDate = checkInDate ? formatDateForAPI(checkInDate) : formatDateForAPI(today);
    const toDate = checkOutDate ? formatDateForAPI(checkOutDate) : formatDateForAPI(tomorrow);
    
    // Create meal plan counts with default fallback
    const mealPlanCounts: Record<string, number> = {};
    if (mealPlan && mealPlan.id) {
      mealPlanCounts[mealPlan.id] = Math.max(1, guestCount);
    } else {
      // Default meal plan ID if none is provided
      mealPlanCounts["1"] = Math.max(1, guestCount);
    }
    
    // Set fallback values for all required fields
    return {
      hotel_id: hotelId || "1",
      room_type_id: roomOption?.room_type_id || "1",
      room_view_id: roomOption?.room_view_id || "1",
      num_rooms: "1", // Default to 1 room
      meal_plan_counts: mealPlanCounts,
      from_date: fromDate,
      to_date: toDate,
      adults: Math.max(1, guestCount).toString(),
      children: "0", // API expects "children" not "childs"
      special_requests: ""
    };
  };

  // Update handleRoomBookNow function to use the helper for more robust data preparation
  const handleRoomBookNow = async (roomOption: RoomReservationOption) => {
    console.log('[HotelPage] handleRoomBookNow clicked', roomOption);
    
    // First select this room
    await handleRoomTypeSelect(roomOption);
    
    // Ensure meal plan is selected
    const mealPlan = selectedMealPlan || (mealPlans.length > 0 ? mealPlans[0] : null);
    if (!mealPlan) {
      toast("No meal plans available. Using default meal plan.");
    }
    
    // Validate guest count
    if (!guestCount || guestCount < 1) {
      toast("Guest count must be at least 1. Using default value.");
    }
    
    // Check authentication
    const isUserAuthenticated = isAuthenticated || manualAuthCheck;
    console.log("handleRoomBookNow called, authentication status:", isUserAuthenticated);
    
    if (!isUserAuthenticated) {
      // Save current URL for later redirect
      const currentUrl = window.location.pathname;
      localStorage.setItem('amr_redirect_after_login', currentUrl);
      
      toast("Please sign in to make a reservation");
      
      // Redirect to login page
      router.push(`/${params.locale}/login?redirect=${encodeURIComponent(currentUrl)}`);
      return;
    }
    
    try {
      setIsBookingLoading(true);
      
      // Prepare reservation data with fallbacks for any missing values
      const reservationData = prepareReservationData(
        params.id,
        roomOption,
        mealPlan,
        checkInDate,
        checkOutDate,
        guestCount || 1
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
      
      // Display error message
      if (error instanceof Error) {
        toast(error.message);
      } else {
        toast("Failed to create reservation. Please try again.");
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
        if (errorMessage.includes('Reservation creation failed')) {
          try {
            // Try to extract and format the API error for better user feedback
            const errorJson = errorMessage.replace('Reservation creation failed: ', '');
            const parsedError = JSON.parse(errorJson);
            let formattedError = "Reservation failed: ";
            
            // Extract specific field errors
            Object.entries(parsedError).forEach(([field, errors]) => {
              formattedError += `${field} - ${errors} `;
            });
            
            toast(formattedError);
          } catch (e) {
            toast(errorMessage);
          }
        } else {
          toast(errorMessage);
        }
      } else {
        toast("Failed to create reservation. Please try again.");
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
  
  return (
    <div className="nc-ListingStayDetailPage relative">
      {/* Authentication Status Indicator */}
      <div className="mb-4 mt-4 max-w-md mx-auto">
        <AuthStatusIndicator />
      </div>
      
      {/* Debug Auth Status */}
      <div className="bg-green-100 dark:bg-green-900 p-4 text-green-800 dark:text-green-200 text-center">
        <p>Auth Status from Context: <strong>{isAuthenticated ? 'Logged In' : 'Not Logged In'}</strong></p>
        <p>Auth Status from Manual Check: <strong>{manualAuthCheck ? 'Token Found' : 'No Token'}</strong></p>
        {isAuthenticated && user && (
          <span className="ml-2">as {user.email || user.username}</span>
        )}
      </div>

      <BgGlassmorphism />

      {/* SINGLE HEADER */}
      <header className="container 2xl:px-14 rounded-md sm:rounded-xl mt-10">
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-2">
          {/* Main large image on the left */}
          <div 
            className="md:col-span-2 h-[400px] md:h-[500px] relative rounded-l-xl overflow-hidden cursor-pointer"
            onClick={() => {
              setActivePhotoIndex(0);
              setIsGalleryOpen(true);
            }}
          >
            {data.galleryImgs && data.galleryImgs[0] ? (
              <img 
                src={typeof data.galleryImgs[0] === 'string' ? data.galleryImgs[0] : data.galleryImgs[0].toString()} 
                alt={hotel.name} 
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <img src="/placeholder.jpg" alt="Featured" className="absolute inset-0 object-cover h-full w-full" />
            )}
          </div>
          
          {/* Grid of smaller images on the right */}
          <div className="hidden md:grid md:grid-rows-2 gap-2">
            {/* Top row images */}
            <div className="grid grid-cols-2 gap-2">
              <div 
                className="relative h-[245px] rounded-tr-xl overflow-hidden cursor-pointer"
                onClick={() => {
                  setActivePhotoIndex(1);
                  setIsGalleryOpen(true);
                }}
              >
                {data.galleryImgs && data.galleryImgs[1] ? (
                  <img 
                    src={typeof data.galleryImgs[1] === 'string' ? data.galleryImgs[1] : data.galleryImgs[1].toString()} 
                    alt={`${hotel.name} image 2`} 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <img src="/placeholder.jpg" alt="Image 2" className="absolute inset-0 object-cover h-full w-full" />
                )}
              </div>
              <div 
                className="relative h-[245px] overflow-hidden cursor-pointer"
                onClick={() => {
                  setActivePhotoIndex(2);
                  setIsGalleryOpen(true);
                }}
              >
                {data.galleryImgs && data.galleryImgs[2] ? (
                  <img 
                    src={typeof data.galleryImgs[2] === 'string' ? data.galleryImgs[2] : data.galleryImgs[2].toString()} 
                    alt={`${hotel.name} image 3`} 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <img src="/placeholder.jpg" alt="Image 3" className="absolute inset-0 object-cover h-full w-full" />
                )}
              </div>
            </div>
            
            {/* Bottom row images */}
            <div className="grid grid-cols-2 gap-2">
              <div 
                className="relative h-[245px] overflow-hidden cursor-pointer"
                onClick={() => {
                  setActivePhotoIndex(3);
                  setIsGalleryOpen(true);
                }}
              >
                {data.galleryImgs && data.galleryImgs[3] ? (
                  <img 
                    src={typeof data.galleryImgs[3] === 'string' ? data.galleryImgs[3] : data.galleryImgs[3].toString()} 
                    alt={`${hotel.name} image 4`} 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <img src="/placeholder.jpg" alt="Image 4" className="absolute inset-0 object-cover h-full w-full" />
                )}
              </div>
              <div 
                className="relative h-[245px] rounded-br-xl overflow-hidden cursor-pointer"
                onClick={() => {
                  setActivePhotoIndex(4);
                  setIsGalleryOpen(true);
                }}
              >
                {data.galleryImgs && data.galleryImgs[4] ? (
                  <img 
                    src={typeof data.galleryImgs[4] === 'string' ? data.galleryImgs[4] : data.galleryImgs[4].toString()} 
                    alt={`${hotel.name} image 5`} 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <img src="/placeholder.jpg" alt="Image 5" className="absolute inset-0 object-cover h-full w-full" />
                )}
              </div>
            </div>
          </div>

          {/* Show all photos button */}
          <button 
            onClick={() => {
              setIsGalleryOpen(true);
              setActivePhotoIndex(0);
            }}
            className="absolute bottom-4 left-4 py-2 px-4 bg-white dark:bg-neutral-900 text-sm rounded-full shadow-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            Show all photos
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="container relative z-10 pt-12 pb-24 lg:pt-16 lg:pb-32">
        <div className="flex flex-col lg:flex-row">
          {/* MAIN */}
          <div className="w-full lg:w-3/5 xl:w-2/3 space-y-8 lg:space-y-10 lg:pr-10">
            {/* HEADING */}
            <div className="space-y-4">
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                {hotel.address?.city || ''}, {hotel.address?.country || ''}
              </span>
              <h2 className="text-3xl sm:text-4xl font-semibold">{hotel.name}</h2>
              
              {/* META */}
              <div className="flex items-center space-x-4">
                <Badge name={`${hotel.star_rating}-star Hotel`} className="bg-blue-100 text-blue-800" />
                <div className="flex items-center space-x-2">
                  <FiveStartIconForRate defaultPoint={data.reviewStart} />
                  <span className="text-sm text-neutral-500">{`${data.reviewCount} reviews`}</span>
                </div>
              </div>
            </div>
            
            {/* DESCRIPTION */}
            <div className="border-b border-neutral-200 dark:border-neutral-700 pb-8">
              <h3 className="text-2xl font-semibold">Description</h3>
              <div className="prose prose-sm sm:prose mt-4 text-neutral-700 dark:text-neutral-300">
                <p>{hotel.description}</p>
              </div>
            </div>
            
            {/* AMENITIES */}
            <div className="border-b border-neutral-200 dark:border-neutral-700 pb-8">
              <h3 className="text-2xl font-semibold mb-6">Amenities</h3>
              {isLoadingAmenities ? (
                <div className="flex items-center">
                  <Spinner className="h-5 w-5" />
                  <span className="ml-2">Loading amenities...</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                  {hotelAmenities && hotelAmenities.length > 0 ? (
                    hotelAmenities.map((amenity, index) => {
                      const name = typeof amenity === 'string' ? amenity : 
                            (amenity && typeof amenity === 'object' && amenity.name) ? amenity.name : 
                            (amenity && typeof amenity === 'object' && amenity.amenity_name) ? amenity.amenity_name : 'Amenity';
                        
                      const icon = (amenity && typeof amenity === 'object' && amenity.icon) ? amenity.icon : undefined;
                        
                      return (
                        <Amenity key={index} name={name} icon={icon} />
                      );
                    })
                  ) : hotel.amenities && Array.isArray(hotel.amenities) && hotel.amenities.length > 0 ? (
                    hotel.amenities.map((amenity, index) => {
                      const name = typeof amenity === 'string' ? amenity : 
                            (amenity && typeof amenity === 'object' && amenity.name) ? amenity.name : 'Amenity';
                      const icon = (amenity && typeof amenity === 'object' && amenity.icon) ? amenity.icon : undefined;
                        
                      return (
                        <Amenity key={index} name={name} icon={icon} />
                      );
                    })
                  ) : (
                    [
                      "Wi-Fi", "Air Conditioning", "TV", "Free Parking", 
                      "Room Service", "Swimming Pool", "Restaurant", "24/7 Front Desk",
                      "Fitness Center"
                    ].map((amenity, index) => (
                      <Amenity key={index} name={amenity} />
                    ))
                  )}
                </div>
              )}
            </div>
            
            {/* LOCATION */}
            <div className="border-b border-neutral-200 dark:border-neutral-700 pb-8">
              <h3 className="text-2xl font-semibold mb-6">Location</h3>
              <div className="aspect-w-16 aspect-h-9 sm:aspect-h-6 rounded-xl overflow-hidden bg-neutral-200">
                <iframe 
                  src={`https://maps.google.com/maps?q=${hotel.address?.latitude || 0},${hotel.address?.longitude || 0}&hl=en&z=14&output=embed`}
                  title="Hotel location"
                  className="w-full h-full"
                  loading="lazy"
                ></iframe>
              </div>
              <div className="mt-4 space-y-1 text-neutral-500 dark:text-neutral-400">
                <p className="font-medium text-neutral-900 dark:text-neutral-100">{hotel.name}</p>
                <p>{hotel.address?.address_line1 || ''}</p>
                {hotel.address?.address_line2 && <p>{hotel.address.address_line2}</p>}
                <p>{`${hotel.address?.city || ''}, ${hotel.address?.state || ''} ${hotel.address?.zip_code || ''}`}</p>
                <p>{hotel.address?.country || ''}</p>
              </div>
            </div>
            
            {/* HOST */}
            <div className="border-b border-neutral-200 dark:border-neutral-700 pb-8">
              <h3 className="text-2xl font-semibold mb-6">Hotel Information</h3>
              <div className="flex items-center space-x-4">
                <Avatar imgUrl={data.author.avatar} userName={data.author.displayName} />
              <div>
                  <h4 className="text-base font-medium">{data.author.displayName}</h4>
                  {hotel.email && <p className="text-sm text-neutral-500 dark:text-neutral-400">{hotel.email}</p>}
                  {hotel.phone && <p className="text-sm text-neutral-500 dark:text-neutral-400">{hotel.phone}</p>}
                  {hotel.website && (
                      <a
                        href={hotel.website}
                        target="_blank"
                        rel="noopener noreferrer"
                      className="text-sm text-primary-500 hover:text-primary-600"
                      >
                        {hotel.website}
                      </a>
                  )}
                </div>
              </div>
            </div>

            {/* ROOMS */}
            <div className="border-b border-neutral-200 dark:border-neutral-700 pb-8">
              <h3 className="text-2xl font-semibold mb-6">Available Rooms</h3>
              
              {/* Filter Status Panel */}
              <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 p-4 rounded-lg mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>
                      <strong>Current Filters:</strong>
                      {checkInDate && checkOutDate ? (
                        <span className="ml-1">
                          {checkInDate.toLocaleDateString()} - {checkOutDate.toLocaleDateString()} 
                          ({stayDuration} night{stayDuration !== 1 ? 's' : ''})
                        </span>
                      ) : (
                        <span className="ml-1">No dates selected</span>
                      )}
                      <span className="mx-1">•</span>
                      <span>{guestCount} guest{guestCount !== 1 ? 's' : ''}</span>
                    </span>
                  </div>
                  <button 
                    onClick={() => setIsDatePickerOpen(true)}
                    className="mt-2 sm:mt-0 inline-flex items-center px-3 py-1 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    Update Filters
                  </button>
                </div>
              </div>
              
              {isLoadingRooms ? (
                <div className="flex items-center justify-center py-10">
                  <Spinner className="h-10 w-10" />
                  <span className="ml-3">Loading rooms...</span>
                </div>
              ) : roomsError ? (
                <Alert type="error">
                  <span className="font-medium">Error loading rooms:</span> {roomsError.message}
                </Alert>
              ) : rooms.length === 0 ? (
                <Alert>
                  <span>No rooms available for this hotel.</span>
                </Alert>
              ) : (
                <div className="space-y-6">
                  {rooms.map((room: Room) => (
                    <div key={room.id || `room-${Math.random()}`} className="mb-8 border border-neutral-200 dark:border-neutral-700 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-300">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                        {/* Room Image */}
                        <div className="md:col-span-1">
                          <div className="relative w-full h-52 md:h-full mb-4 md:mb-0 rounded-lg overflow-hidden">
                            {room.images && room.images.length > 0 ? (
                              <GallerySlider
                                uniqueID={`room-${room.id}-${room.roomNumber || ''}`}
                                galleryImgs={room.images.map((img: any) => 
                                  typeof img === 'string' ? img : (img && img.image) || ''
                                ).filter(Boolean)}
                                ratioClass="aspect-w-12 aspect-h-8"
                              />
                            ) : (
                              <div className="w-full h-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center">
                                <span className="text-neutral-500">No image available</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Room Details */}
                        <div className="md:col-span-2">
                          <div className="flex flex-col h-full justify-between">
                            <div>
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h3 className="text-xl font-bold">
                                    {room.name || room.roomType?.name || `Room ${room.roomNumber || 'Standard'}`}
                                  </h3>
                                  <p className="text-sm text-neutral-500">
                                    {room.bedrooms || 1} Bedroom • Sleeps {room.capacity || 2}
                                  </p>
                                </div>
                                <div className="text-xl font-semibold text-primary-600">
                                  ${room.defaultPrice || room.roomType?.defaultPrice || 99}
                                  <span className="text-sm font-normal text-neutral-500">/night</span>
                                </div>
                              </div>
                              
                              <p className="text-neutral-600 dark:text-neutral-300 mb-3 line-clamp-2">
                                {room.description || room.roomType?.description || 'Comfortable room with all essential amenities for a pleasant stay.'}
                              </p>
                              
                              {/* Room Amenities */}
                              <div className="flex flex-wrap gap-2 mb-3">
                                {room.amenities && room.amenities.length > 0 ? (
                                  room.amenities.map((amenity: any, idx: number) => {
                                    const name = typeof amenity === 'string' ? amenity : 
                                          (amenity && typeof amenity === 'object' && amenity.name) ? amenity.name : 
                                          (amenity && typeof amenity === 'object' && amenity.amenity_name) ? amenity.amenity_name : '';
                                    
                                    return name ? (
                                      <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
                                        {name}
                                      </span>
                                    ) : null;
                                  }).filter(Boolean)
                                ) : (
                                  // Default amenities when none are provided
                                  <>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
                                      WiFi
                                    </span>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
                                      Air Conditioning
                                    </span>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
                                      TV
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                            
                            {/* Check availability section */}
                            <div className="flex flex-col sm:flex-row justify-between items-stretch pt-4 border-t border-dashed border-neutral-200 dark:border-neutral-700 mt-4">
                              <div className="flex flex-col">
                                <span className="text-sm text-neutral-500">Price for {stayDuration} night{stayDuration !== 1 ? 's' : ''}</span>
                                <span className="text-lg font-bold text-primary-700">
                                  ${(room.defaultPrice || room.roomType?.defaultPrice || 99) * stayDuration}
                                </span>
                                <span className="text-xs text-neutral-500 mt-1">
                                  {guestCount} guest{guestCount !== 1 ? 's' : ''} 
                                  {selectedMealPlan && ` • ${selectedMealPlan.name}`}
                                </span>
                              </div>
                              
                              <div className="flex mt-3 sm:mt-0">
                                <ButtonSecondary 
                                  onClick={() => fetchRoomDetails(room.id ? room.id.toString() : '')}
                                  className="mr-2"
                                >
                                  {roomDetails[room.id?.toString() || ''] ? 'Hide Details' : 'View Details'}
                                </ButtonSecondary>
                                
                                <ButtonPrimary 
                                  onClick={() => {
                                    // Find the corresponding room option from available options
                                    const roomOption = roomOptions.find(
                                      option => 
                                        option.room_type_id === (room.roomType?.id?.toString() || '') || 
                                        option.room_type_name === (room.roomType?.name || room.name || '')
                                    );
                                    
                                    if (roomOption) {
                                      handleRoomBookNow(roomOption);
                                    } else {
                                      toast("Could not find room option. Please select from the sidebar.");
                                    }
                                  }}
                                  disabled={isBookingLoading}
                                >
                                  {isBookingLoading ? (
                                    <div className="flex items-center">
                                      <Spinner className="h-4 w-4 mr-2" />
                                      <span>Booking...</span>
                                    </div>
                                  ) : (
                                    <span>Book Now</span>
                                  )}
                                </ButtonPrimary>
                              </div>
                            </div>
                            
                            {/* Room details expansion */}
                            {roomDetails[room.id?.toString() || ''] && (
                              <div className="mt-4 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                                <h4 className="text-lg font-medium mb-2">Room Details</h4>
                                <p className="mb-2">{roomDetails[room.id?.toString() || ''].description || room.description}</p>
                                
                                <div className="grid grid-cols-2 gap-3 mt-3">
                                  <div>
                                    <h5 className="text-sm font-medium">Room Features</h5>
                                    <ul className="list-disc list-inside text-sm mt-1 ml-2 text-neutral-600 dark:text-neutral-400">
                                      {roomDetails[room.id?.toString() || ''].features ? (
                                        roomDetails[room.id?.toString() || ''].features.map((feature: string, i: number) => (
                                          <li key={i}>{feature}</li>
                                        ))
                                      ) : (
                                        <>
                                          <li>Air conditioning</li>
                                          <li>Private bathroom</li>
                                          <li>Flat-screen TV</li>
                                        </>
                                      )}
                                    </ul>
                                  </div>
                                  <div>
                                    <h5 className="text-sm font-medium">Bed Options</h5>
                                    <ul className="list-disc list-inside text-sm mt-1 ml-2 text-neutral-600 dark:text-neutral-400">
                                      {roomDetails[room.id?.toString() || ''].bed_options ? (
                                        roomDetails[room.id?.toString() || ''].bed_options.map((bed: string, i: number) => (
                                          <li key={i}>{bed}</li>
                                        ))
                                      ) : (
                                        <>
                                          <li>1 King bed</li>
                                          <li>Or 2 Twin beds</li>
                                        </>
                                      )}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* REVIEWS */}
            <div>
              <h3 className="text-2xl font-semibold">Reviews ({data.reviewCount})</h3>
              <CommentListing />
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="hidden lg:block w-full lg:w-2/5 xl:w-1/3 space-y-8 lg:pl-10">
            {/* PRICE CARD */}
            <div className="listingSectionSidebar__wrap shadow-xl dark:shadow-2xl">
              {/* PRICE */}
              <div className="flex justify-between">
                <span className="text-3xl font-semibold">
                  ${priceBreakdown.basePrice}
                  <span className="ml-1 text-base font-normal text-neutral-500 dark:text-neutral-400">
                    /night
                  </span>
                </span>
                <StartRating point={hotel?.star_rating || 4.5} reviewCount={data.reviewCount || 28} />
              </div>

              {/* FORM */}
              <form className="flex flex-col border border-neutral-200 dark:border-neutral-700 rounded-3xl mt-4">
                <DateRangePickerWrapper 
                  className="flex-1 z-[11]"
                  initialStartDate={checkInDate}
                  initialEndDate={checkOutDate}
                  onDateChange={(startDate, endDate) => {
                    setCheckInDate(startDate);
                    setCheckOutDate(endDate);
                    
                    // Calculate nights difference
                    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    setStayDuration(diffDays > 0 ? diffDays : 1);
                  }}
                />
                <div className="w-full border-b border-neutral-200 dark:border-neutral-700"></div>
                <GuestPickerWrapper 
                  className="flex-1"
                  onGuestChange={(count) => {
                    setGuestCount(count);
                  }}
                />
              </form>

              {/* SUM - Add useEffect to recalculate when inputs change */}
              <div className="flex flex-col space-y-4 mt-6">
                <div className="flex justify-between text-neutral-6000 dark:text-neutral-300">
                  <span>${priceBreakdown.basePrice} x {stayDuration} night{stayDuration !== 1 ? 's' : ''}</span>
                  <span>${priceBreakdown.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-neutral-6000 dark:text-neutral-300">
                  <span>Service charge</span>
                  <span>${priceBreakdown.serviceCharge.toFixed(2)}</span>
                </div>
                <div className="border-b border-neutral-200 dark:border-neutral-700"></div>
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${priceBreakdown.total.toFixed(2)}</span>
                </div>
              </div>

              {/* SUBMIT */}
              <div className="mt-6">
                <ButtonPrimary
                  onClick={handleBookNow}
                  className="w-full"
                  disabled={isBookingLoading}
                >
                  {isBookingLoading ? (
                    <div className="flex items-center justify-center">
                      <Spinner size="sm" className="mr-2" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <span>
                      {isAuthenticated || manualAuthCheck ? "Reserve" : "Sign in to reserve"}
                    </span>
                  )}
                </ButtonPrimary>
                <div className="mt-4 text-center">
                  {isAuthenticated || manualAuthCheck ? (
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">
                      You won't be charged yet
                    </span>
                  ) : (
                    <Link
                      href={`/${params.locale}/login?redirect=${encodeURIComponent(window.location.pathname)}`}
                      className="text-sm text-primary-600 hover:underline"
                    >
                      Sign in to make a reservation
                    </Link>
                  )}
                </div>
              </div>
            </div>
            
            {/* POLICIES */}
            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-xl border border-neutral-200 dark:border-neutral-800">
              <h3 className="text-xl font-semibold mb-4">Policies</h3>
              <div className="space-y-5 text-sm text-neutral-500 dark:text-neutral-400">
                <div className="flex space-x-3">
                  <i className="las la-calendar-check text-xl"></i>
                  <div>
                    <div className="font-medium text-neutral-900 dark:text-neutral-200">Cancellation policy</div>
                    <p>Free cancellation up to 48 hours before check-in.</p>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <i className="las la-clock text-xl"></i>
                  <div>
                    <div className="font-medium text-neutral-900 dark:text-neutral-200">Check-in</div>
                    <p>{hotel.check_in_time || "3:00 PM"} - Check in with front desk</p>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <i className="las la-door-open text-xl"></i>
                  <div>
                    <div className="font-medium text-neutral-900 dark:text-neutral-200">Check-out</div>
                    <p>Before {hotel.check_out_time || "11:00 AM"}</p>
                  </div>
                </div>
                
                {(hotel as any).policy && (
                  <div className="flex space-x-3">
                    <i className="las la-info-circle text-xl"></i>
                    <div>
                      <div className="font-medium text-neutral-900 dark:text-neutral-200">House Rules</div>
                      <p>{(hotel as any).policy}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ROOM OPTIONS & RESERVATION */}
            <div className="border-b border-neutral-200 dark:border-neutral-700 pb-8">
              <h3 className="text-2xl font-semibold mb-6">Rooms & Reservation</h3>
              
              {/* Date Selection Notice */}
              <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 p-3 rounded-lg mb-4 text-sm">
                <p className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Room availability is based on your selected dates: 
                  <strong className="ml-1">
                    {checkInDate.toLocaleDateString()} - {checkOutDate.toLocaleDateString()}
                  </strong>
                </p>
              </div>
              
              {/* Room Options */}
              <div className="mb-6">
                <h4 className="text-lg font-medium mb-3">Select Room Type & View</h4>
                
                {isLoadingRoomOptions ? (
                  <div className="flex items-center justify-center py-5">
                    <Spinner className="h-8 w-8" />
                    <span className="ml-2">Loading room options...</span>
                  </div>
                ) : roomOptionsError ? (
                  <Alert type="error" className="mb-4">
                    <span className="font-medium">Error!</span> {roomOptionsError.message}
                  </Alert>
                ) : roomOptions.length === 0 ? (
                  <Alert>No room options available for this hotel.</Alert>
                ) : (
                  <div className="grid gap-4">
                    {roomOptions.map((option) => (
                      <div 
                        key={`${option.room_type_id}-${option.room_view_id}`}
                        className={`border p-4 rounded-lg cursor-pointer transition-all ${
                          selectedRoomOption && 
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
                )}
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

      {/* DATE PICKER MODAL */}
      <Transition appear show={isDatePickerOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsDatePickerOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-neutral-800 p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                  >
                    Select Dates
                  </Dialog.Title>
                  <div className="mt-4">
                    <StayDatesRangeInput className="w-full" />
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-neutral-200 dark:bg-neutral-700 px-4 py-2 text-sm font-medium text-neutral-900 dark:text-neutral-100 hover:bg-neutral-300 dark:hover:bg-neutral-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                      onClick={() => setIsDatePickerOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                      onClick={() => {
                        const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        setStayDuration(diffDays);
                        setIsDatePickerOpen(false);
                      }}
                    >
                      Apply
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* GUEST PICKER MODAL */}
      <Transition appear show={isGuestPickerOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsGuestPickerOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-neutral-800 p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                  >
                    Guest Count
                  </Dialog.Title>
                  <div className="mt-4">
                    <GuestsInput className="w-full" />
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-neutral-200 dark:bg-neutral-700 px-4 py-2 text-sm font-medium text-neutral-900 dark:text-neutral-100 hover:bg-neutral-300 dark:hover:bg-neutral-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                      onClick={() => setIsGuestPickerOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                      onClick={() => setIsGuestPickerOpen(false)}
                    >
                      Apply
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      
      {/* PHOTO GALLERY MODAL */}
      <Transition appear show={isGalleryOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsGalleryOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-90" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-hidden">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full h-full transform overflow-hidden text-left flex flex-col justify-between">
                  {/* Header with close button */}
                  <div className="fixed top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-4 flex justify-between items-center">
                    <h3 className="text-lg text-white font-medium">
                      {hotel.name} - {activePhotoIndex + 1}/{data.galleryImgs?.length || 0} Photos
                    </h3>
                    <button
                      onClick={() => setIsGalleryOpen(false)}
                      className="text-white p-1 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Main image container */}
                  <div className="flex-1 flex items-center justify-center h-full">
                    {data.galleryImgs && data.galleryImgs[activePhotoIndex] && (
                      <img 
                        src={typeof data.galleryImgs[activePhotoIndex] === 'string' 
                          ? data.galleryImgs[activePhotoIndex] 
                          : data.galleryImgs[activePhotoIndex].toString()
                        } 
                        alt={`${hotel.name} photo ${activePhotoIndex + 1}`} 
                        className="max-h-[85vh] max-w-full object-contain"
                      />
                    )}
                  </div>
                  
                  {/* Navigation arrows */}
                  {activePhotoIndex > 0 && (
                    <button 
                      onClick={() => setActivePhotoIndex(prev => prev - 1)}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                  )}
                  
                  {data.galleryImgs && activePhotoIndex < data.galleryImgs.length - 1 && (
                    <button 
                      onClick={() => setActivePhotoIndex(prev => prev + 1)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}
                  
                  {/* Thumbnail navigation */}
                  <div className="fixed bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <div className="flex overflow-x-auto space-x-2 pb-2 px-4">
                      {data.galleryImgs && data.galleryImgs.map((img, idx) => (
                        <button 
                          key={idx} 
                          onClick={() => setActivePhotoIndex(idx)}
                          className={`flex-shrink-0 h-16 w-24 rounded-md overflow-hidden border-2 transition-all ${
                            idx === activePhotoIndex ? 'border-white opacity-100 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img 
                            src={typeof img === 'string' ? img : img.toString()} 
                            alt={`Thumbnail ${idx + 1}`} 
                            className="h-full w-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
} 