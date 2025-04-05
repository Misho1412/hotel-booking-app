"use client";

import React, { useEffect, useState, useRef } from "react";
import BgGlassmorphism from "@/components/BgGlassmorphism";
import useHotels from "@/hooks/useHotels";
import { IHotel } from "@/lib/api/schemas/hotel";
import { StayDataType } from "@/data/types";
import GallerySlider from "@/components/GallerySlider";
import Avatar from "@/shared/Avatar";
import SectionDateRange from "@/app/(listing-detail)/SectionDateRange";
import StartRating from "@/components/StartRating";
import Badge from "@/shared/Badge";
import ButtonPrimary from "@/shared/ButtonPrimary";
import ButtonSecondary from "@/shared/ButtonSecondary";
import FiveStartIconForRate from "@/components/FiveStartIconForRate";
import GuestsInput from "@/app/(listing-detail)/listing-stay-detail/GuestsInput";
import StayDatesRangeInput from "@/app/(listing-detail)/listing-stay-detail/StayDatesRangeInput";
import CommentListing from "@/components/CommentListing";
import Spinner from "@/shared/Spinner";
import Alert from "@/shared/Alert";
import Amenity from "@/components/Amenity";
import { useRouter } from "next/navigation";
import { StaticImageData } from "next/image";
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import DateRangePickerWrapper from "./DateRangePickerWrapper";
import GuestPickerWrapper from "./GuestPickerWrapper";
import reservationService, { ReservationBackendRequest } from "@/lib/api/services/reservationService";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { useRooms } from "@/hooks/useRooms";
import roomService from "@/lib/api/services/roomService";

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
  const [isLoading, setIsLoading] = useState(true);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isGuestPickerOpen, setIsGuestPickerOpen] = useState(false);
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
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
  
  // Get room service hooks
  const { getRoomDetails } = useRooms();

  // Check authentication status once on component mount
  useEffect(() => {
    // Only check auth once to prevent infinite loading
    if (!authCheckedRef.current) {
      const token = typeof window !== 'undefined' ? localStorage.getItem('amr_auth_token') : null;
      setIsLoggedIn(!!token);
      authCheckedRef.current = true;
    }
  }, []);

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

  // Calculate price breakdown when stay data changes
  useEffect(() => {
    if (!stayData || stayData.length === 0) return;
    
    const data = stayData[0];
    const basePrice = parseFloat(String(data?.price || '0').replace(/[^0-9.]/g, '')) || 119;
    const subtotal = basePrice * stayDuration;
    const serviceCharge = subtotal * 0.1; // 10% service charge
    const total = subtotal + serviceCharge;
    
    setPriceBreakdown({
      basePrice,
      subtotal,
      serviceCharge,
      total
    });
  }, [stayData, stayDuration, guestCount]);

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
        const baseURL = process.env.NEXT_PUBLIC_AMR_API_URL || 'https://amrbooking.onrender.com/api';
        const roomsURL = `${baseURL}/hotels-public/${id}/rooms/`;
        
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
  
  const handleBookNow = async () => {
    // Check if user is logged in first
    const token = typeof window !== 'undefined' ? localStorage.getItem('amr_auth_token') : null;

    if (!token) {
      toast.error("Please sign in to make a reservation");
      router.push(`/${params.locale}/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    // Check if a room has been selected
    if (rooms.length === 0) {
      toast.error("Please wait for rooms to load or try again later");
      return;
    }

    // Get the first available room if no specific room is selected
    // In a real implementation, you would want the user to explicitly select a room
    const selectedRoom = rooms[0];
    if (!selectedRoom || !selectedRoom.id) {
      toast.error("No rooms available for this hotel. Please try another hotel.");
      return;
    }

    try {
      setIsBookingLoading(true);
      // Format dates for URL parameters
      const checkIn = checkInDate.toISOString().split('T')[0];
      const checkOut = checkOutDate.toISOString().split('T')[0];
      
      // Format dates in the expected format (DD/MM/YYYY)
      const formatDateForBE = (dateStr: string) => {
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
      };

      // Step 1: Create a pending reservation using the reservationService with the backend format
      const reservationData: ReservationBackendRequest = {
        room_id: selectedRoom.id.toString(), // Use the selected room ID instead of hardcoded "1"
        childs: "0", // Default to 0 children
        adults: guestCount.toString(),
        price_per_night: priceBreakdown.basePrice.toString(),
        payment_method: "credit_card", // Default payment method
        currency: "USD",
        special_requests: "",
        check_in_date: formatDateForBE(checkIn),
        check_out_date: formatDateForBE(checkOut),
        notes: "Reservation from hotel page"
      };
      
      console.log("Creating reservation with room ID:", selectedRoom.id);
      
      // Create reservation with pending payment status
      const reservation = await reservationService.createReservation(reservationData);
      console.log("Created pending reservation:", reservation.id);
      
      // Show success toast
      toast.success("Reservation created successfully! Proceeding to checkout...");

      // Construct URL with reservation ID and other parameters
      const url = `/${params.locale}/checkout/${hotel.id}?reservationId=${reservation.id}&roomId=${selectedRoom.id}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guestCount}&nights=${stayDuration}&total=${priceBreakdown.total.toFixed(2)}`;
      
      // Redirect to the payment page
      router.push(url as any);
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Failed to create reservation. Please try again.");
    } finally {
      setIsBookingLoading(false);
    }
  };

  // Add these helper functions to update dates and calculate duration
  const handleDateChange = (startDate: Date, endDate: Date) => {
    setCheckInDate(startDate);
    setCheckOutDate(endDate);
    
    // Calculate nights difference
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setStayDuration(diffDays);
    
    setIsDatePickerOpen(false);
  };
  
  const handleGuestChange = (count: number) => {
    setGuestCount(count);
    setIsGuestPickerOpen(false);
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
                  {rooms.map((room, index) => (
                    <div key={room.id || index} className="border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden">
                      <div className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center">
                          {/* Room image */}
                          <div className="relative w-full sm:w-40 h-32 mb-4 sm:mb-0 sm:mr-6 rounded-lg overflow-hidden">
                            {room.images && room.images.length > 0 ? (
                              <img 
                                src={typeof room.images[0] === 'string' ? room.images[0] : 
                                  (room.images[0] as any)?.image || '/placeholder.jpg'} 
                                alt={room.name || 'Room'} 
                                className="absolute inset-0 w-full h-full object-cover"
                              />
                            ) : (
                              <img 
                                src="/placeholder.jpg" 
                                alt="Room placeholder" 
                                className="absolute inset-0 w-full h-full object-cover"
                              />
                            )}
                          </div>
                          
                          {/* Room details */}
                          <div className="flex-grow">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <h4 className="text-lg font-semibold">
                                  {room.name || room.roomType?.name || `Room ${room.roomNumber || index + 1}`}
                                </h4>
                                <p className="text-neutral-500 text-sm mt-1">
                                  {room.capacity || room.roomType?.capacity || 2} Guests • {room.bedrooms || 1} Bedroom
                                </p>
                              </div>
                              
                              <div className="text-right mt-3 sm:mt-0">
                                <div className="text-xl font-semibold text-primary-600">
                                  ${room.defaultPrice || room.roomType?.defaultPrice || 119}
                                  <span className="text-sm text-neutral-500 font-normal">/night</span>
                                </div>
                                <div className="mt-3">
                                  <ButtonPrimary 
                                    className="px-4 py-2 text-sm"
                                    onClick={async () => {
                                      // Existing booking click handler
                                    }}
                                  >
                                    {isLoggedIn ? "Book Now" : "Sign in to book"}
                                  </ButtonPrimary>
                                </div>
                              </div>
                            </div>
                            
                            {/* Room description and amenities */}
                            <div className="mt-4">
                              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                {room.description || room.roomType?.description || "Comfortable room with all amenities"}
                              </p>
                              
                              {/* Button to load room details */}
                              <button 
                                onClick={() => fetchRoomDetails(room.id as string)}
                                className="text-sm text-primary-600 hover:underline mt-2 flex items-center"
                                disabled={loadingRoomDetails[room.id as string]}
                              >
                                {loadingRoomDetails[room.id as string] ? (
                                  <>
                                    <Spinner size="sm" className="mr-2" />
                                    <span>Loading details...</span>
                                  </>
                                ) : roomDetails[room.id as string] ? (
                                  <span>Hide details</span>
                                ) : (
                                  <span>View detailed information</span>
                                )}
                              </button>
                              
                              {/* Room details section */}
                              {roomDetails[room.id as string] && (
                                <div className="mt-4 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                                  <h5 className="font-medium mb-2">Detailed Room Information</h5>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {Object.entries(roomDetails[room.id as string]).map(([key, value]) => {
                                      // Skip complex objects, arrays, or undefined values
                                      if (typeof value === 'object' || value === undefined) return null;
                                      // Format the key for display (remove underscores, capitalize)
                                      const formattedKey = key
                                        .replace(/_/g, ' ')
                                        .split(' ')
                                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                        .join(' ');
                                      const displayValue = String(value);
                                      return (
                                        <div key={key} className="text-sm">
                                          <span className="font-medium">{formattedKey}:</span> {displayValue}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                              
                              {/* Amenities */}
                              {room.amenities && room.amenities.length > 0 && (
                                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                                  {room.amenities.slice(0, 6).map((amenity, i) => (
                                    <span key={i} className="text-xs flex items-center text-neutral-500">
                                      <i className="las la-check text-primary-500 mr-1"></i>
                                      {typeof amenity === 'string' ? amenity : (amenity as any).name}
                                    </span>
                                  ))}
                                  {room.amenities.length > 6 && (
                                    <span className="text-xs text-primary-600 cursor-pointer hover:underline">
                                      +{room.amenities.length - 6} more
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
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
                      <span>{isLoggedIn ? "Reserve" : "Sign in to reserve"}</span>
                  )}
                </ButtonPrimary>
                <div className="mt-4 text-center">
                  {isLoggedIn ? (
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
    </div>
  );
} 