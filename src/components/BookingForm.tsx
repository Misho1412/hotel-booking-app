import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/shared/Input";
import Label from "@/components/Label";
import Textarea from "@/shared/Textarea";
import ButtonPrimary from "@/shared/ButtonPrimary";
import NcModal from "@/shared/NcModal";
import ModalSelectDate from "@/components/ModalSelectDate";
import converSelectedDateToString from "@/utils/converSelectedDateToString";
import ModalSelectGuests from "@/components/ModalSelectGuests";
import { GuestsObject } from "@/app/(client-components)/type";
import { toast } from "react-hot-toast";
import reservationService, { ReservationBackendRequest } from "@/lib/api/services/reservationService";

interface BookingFormProps {
  hotelId: string;
  roomId: string;
  pricePerNight: number;
  onSuccess?: (reservationId: string) => void;
  defaultCheckIn?: Date;
  defaultCheckOut?: Date;
  defaultGuests?: GuestsObject;
}

export default function BookingForm({
  hotelId,
  roomId,
  pricePerNight,
  onSuccess,
  defaultCheckIn,
  defaultCheckOut,
  defaultGuests = { guestAdults: 1, guestChildren: 0, guestInfants: 0 }
}: BookingFormProps) {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    specialRequests: "",
  });

  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const [startDate, setStartDate] = useState<Date | null>(defaultCheckIn || now);
  const [endDate, setEndDate] = useState<Date | null>(defaultCheckOut || tomorrow);
  const [guests, setGuests] = useState<GuestsObject>(defaultGuests);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if user is logged in
    const token = typeof window !== 'undefined' ? localStorage.getItem('amr_auth_token') : null;
    if (!token) {
      toast.error("You must be logged in to make a reservation");
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (!startDate || !endDate) {
      toast.error("Please select check-in and check-out dates");
      return;
    }

    // Calculate nights
    const nightsCount = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (nightsCount < 1) {
      toast.error("Check-out date must be after check-in date");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Format dates for the backend (DD/MM/YYYY)
      const formatDateForBE = (date: Date | null) => {
        if (!date) return "";
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      };

      // Create total guests count
      const totalGuests = (guests.guestAdults || 0) + (guests.guestChildren || 0);
      
      // Calculate total price
      const totalPrice = pricePerNight * nightsCount;

      // Create using the backend format
      const reservationData: ReservationBackendRequest = {
        room_id: roomId,
        childs: (guests.guestChildren || 0).toString(),
        adults: (guests.guestAdults || 1).toString(),
        price_per_night: pricePerNight.toString(),
        payment_method: "credit_card", // Default value
        currency: "USD",
        special_requests: formData.specialRequests,
        check_in_date: formatDateForBE(startDate),
        check_out_date: formatDateForBE(endDate),
        notes: "Booking from booking form"
      };

      // Call the /reservations/api/v1/ endpoint
      const currentReservation = await reservationService.createReservation(reservationData);
      
      toast.success("Reservation created successfully!");

      // Call the callback if provided
      if (onSuccess) {
        onSuccess(currentReservation.id);
      } else {
        // Redirect to checkout page
        router.push(`/checkout/${hotelId}?reservationId=${currentReservation.id}&roomId=${roomId}&checkIn=${startDate.toISOString()}&checkOut=${endDate.toISOString()}&guests=${totalGuests}&nights=${nightsCount}&total=${totalPrice}`);
      }
    } catch (error: any) {
      console.error("Reservation error:", error);
      toast.error(error.message || "Failed to create reservation");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="space-y-6">
        <div>
          <Label>Select dates</Label>
          <div className="mt-1 border border-neutral-200 dark:border-neutral-700 rounded-3xl">
            <ModalSelectDate
              defaultValue={[startDate, endDate]}
              onSelectDate={({ startDate, endDate }) => {
                setStartDate(startDate);
                setEndDate(endDate);
              }}
              renderChildren={({ openModal }) => (
                <button
                  onClick={openModal}
                  className="text-left flex justify-between w-full px-4 py-3"
                  type="button"
                >
                  <div className="flex flex-col">
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">Dates</span>
                    <span className="mt-1 font-semibold">
                      {converSelectedDateToString([startDate, endDate])}
                    </span>
                  </div>
                </button>
              )}
            />
          </div>
        </div>

        <div>
          <Label>Guests</Label>
          <div className="mt-1 border border-neutral-200 dark:border-neutral-700 rounded-3xl">
            <ModalSelectGuests
              defaultValue={guests}
              onChangeGuests={setGuests}
              renderChildren={({ openModal }) => (
                <button
                  type="button"
                  onClick={openModal}
                  className="text-left flex justify-between w-full px-4 py-3"
                >
                  <div className="flex flex-col">
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">Guests</span>
                    <span className="mt-1 font-semibold">
                      <span className="line-clamp-1">
                        {`${
                          (guests.guestAdults || 0) +
                          (guests.guestChildren || 0)
                        } Guests, ${guests.guestInfants || 0} Infants`}
                      </span>
                    </span>
                  </div>
                </button>
              )}
            />
          </div>
        </div>

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

        <ButtonPrimary type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Processing..." : "Reserve now"}
        </ButtonPrimary>
      </div>
    </form>
  );
} 