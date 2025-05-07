"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import Heading from "@/shared/Heading";
import BookingForm from "@/components/BookingForm";
import { useRouter } from "next/navigation";
import Image from "next/image";
import StartRating from "@/components/StartRating";
import Spinner from "@/shared/Spinner";

export default function ReservationPage() {
  const searchParams = useSearchParams();
  const hotelId = searchParams.get("hotelId") || "";
  const roomId = searchParams.get("roomId") || "";
  const pricePerNight = parseFloat(searchParams.get("price") || "0");
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(true);
  const [hotel, setHotel] = useState<any>(null);
  const [room, setRoom] = useState<any>(null);

  useEffect(() => {
    const fetchHotelAndRoom = async () => {
      if (!hotelId || !roomId) {
        toast.error("Missing hotel or room information");
        return;
      }

      try {
        setIsLoading(true);
        
        // Get token for authentication
        const token = typeof window !== 'undefined' ? localStorage.getItem('amr_auth_token') : null;
        
        // Create headers with token if available
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        };
        
        if (token) {
          headers['Authorization'] = `Token ${token}`;
        }
        
        const baseURL = process.env.NEXT_PUBLIC_AMR_API_URL || 'https://amrbooking.onrender.com/api';
        
        // Fetch hotel details
        const hotelResponse = await fetch(`${baseURL}/hotels/${hotelId}`, { headers });
        if (!hotelResponse.ok) {
          throw new Error(`Failed to fetch hotel: ${hotelResponse.status}`);
        }
        const hotelData = await hotelResponse.json();
        setHotel(hotelData);
        
        // Fetch room details
        const roomResponse = await fetch(`${baseURL}/rooms/${roomId}`, { headers });
        if (!roomResponse.ok) {
          throw new Error(`Failed to fetch room: ${roomResponse.status}`);
        }
        const roomData = await roomResponse.json();
        setRoom(roomData);
        
      } catch (error: any) {
        console.error("Error fetching data:", error);
        toast.error(error.message || "Failed to load hotel and room information");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHotelAndRoom();
  }, [hotelId, roomId]);

  const handleReservationSuccess = (reservationId: string) => {
    // Redirect to the booking confirmation page
    router.push(`/booking-confirmation/${reservationId}`);
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

  if (!hotel || !room) {
    return (
      <div className="container relative pt-10 pb-20 lg:pt-20 lg:pb-28">
        <Heading>Information not found</Heading>
        <p className="mt-4">We couldn't find the hotel or room information. Please check your selection.</p>
      </div>
    );
  }

  return (
    <div className="container relative pt-10 pb-20 lg:pt-20 lg:pb-28">
      <div className="max-w-4xl mx-auto">
        <Heading>Make a Reservation</Heading>
        
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-8">
            <div className="bg-white dark:bg-neutral-900 shadow-xl rounded-2xl p-6 xl:p-8">
              <h3 className="text-2xl font-semibold mb-5">Hotel Information</h3>
              
              <div className="flex flex-col sm:flex-row items-start gap-5">
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
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-1">
                      {hotel.location?.city}, {hotel.location?.country}
                    </span>
                    <span className="text-xl font-medium mt-1 block">
                      {hotel.name}
                    </span>
                  </div>
                  <StartRating defaultValue={hotel.rating || 4.5} />
                  <div className="text-sm text-neutral-500 dark:text-neutral-400">
                    {hotel.description?.substring(0, 150)}...
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-neutral-900 shadow-xl rounded-2xl p-6 xl:p-8">
              <h3 className="text-2xl font-semibold mb-5">Room Details</h3>
              
              <div className="space-y-4">
                <div className="aspect-w-4 aspect-h-3 rounded-2xl overflow-hidden">
                  <Image
                    alt={room.name}
                    fill
                    sizes="(max-width: 640px) 100vw, 50vw"
                    src={room.images?.[0] || "https://images.pexels.com/photos/6373478/pexels-photo-6373478.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"}
                  />
                </div>
                
                <h4 className="text-lg font-medium">{room.name}</h4>
                
                <div className="flex flex-wrap gap-3">
                  <span className="px-3 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-full text-sm">
                    {room.capacity || 2} Guests
                  </span>
                  <span className="px-3 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-full text-sm">
                    {room.beds || 1} {room.beds === 1 ? 'Bed' : 'Beds'}
                  </span>
                  <span className="px-3 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-full text-sm">
                    {room.bathrooms || 1} {room.bathrooms === 1 ? 'Bathroom' : 'Bathrooms'}
                  </span>
                </div>
                
                <div className="text-sm text-neutral-500 dark:text-neutral-400">
                  {room.description?.substring(0, 150)}...
                </div>
                
                <div className="text-2xl font-semibold text-primary-500">
                  ${pricePerNight.toFixed(2)} <span className="text-sm text-neutral-500 font-normal">/ night</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-neutral-900 shadow-xl rounded-2xl p-6 xl:p-8">
            <h3 className="text-2xl font-semibold mb-5">Reservation Details</h3>
            
            <BookingForm
              hotelId={hotelId}
              roomId={roomId}
              pricePerNight={pricePerNight}
              onSuccess={handleReservationSuccess}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 