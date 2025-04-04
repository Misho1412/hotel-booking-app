import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import GallerySlider from "@/components/GallerySlider";
import CommentListing from "@/components/CommentListing";
import FiveStartIconForRate from "@/components/FiveStartIconForRate";
import Avatar from "@/shared/Avatar";
import Badge from "@/shared/Badge";
import ButtonSecondary from "@/shared/ButtonSecondary";
import ButtonPrimary from "@/shared/ButtonPrimary";
import useHotels from "@/hooks/useHotels";
import { IHotel } from "@/lib/api/schemas/hotel";
import { Amenity } from "@/components/StayCard2";
import Spinner from "@/shared/Spinner";
import Alert from "@/shared/Alert";
import CheckAvailabilityForm, { BookingFormData } from "@/components/CheckAvailabilityForm";
import { useRouter } from "next/navigation";

export interface HotelDetailProps {
  slug: string;
}

const HotelDetail: React.FC<HotelDetailProps> = ({ slug }) => {
  const router = useRouter();
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const { isLoading, error, stayData, hotels, fetchHotelBySlug } = useHotels({
    autoFetch: false,
  });

  // Fetch hotel data when component mounts
  useEffect(() => {
    if (slug) {
      fetchHotelBySlug(slug).catch(error => {
        console.error("Failed to fetch hotel details:", error);
      });
    }
  }, [slug, fetchHotelBySlug]);

  // Handle error state
  if (error) {
    return (
      <div className="container mx-auto py-10">
        <Alert type="error">
          <span className="font-medium">Error!</span> {error.message}
        </Alert>
      </div>
    );
  }

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Spinner size="lg" />
        <span className="ml-4 text-lg">Loading hotel details...</span>
      </div>
    );
  }

  // If we have no data after loading, show message
  if (!stayData || !stayData.length || !hotels || !hotels.length) {
    return (
      <div className="container mx-auto py-10">
        <Alert>No hotel details found for this slug.</Alert>
      </div>
    );
  }

  const hotel = hotels[0] as IHotel;
  const data = stayData[0];
  
  const handleBookNow = async () => {
    try {
      setIsBookingLoading(true);
      // This would be replaced with actual booking logic when API is ready
      // For now we'll just simulate a delay and redirect
      await new Promise(resolve => setTimeout(resolve, 800));
      router.push(`/checkout/${hotel.slug}`);
    } catch (error) {
      console.error("Booking error:", error);
      alert("There was an error processing your booking request. Please try again later.");
    } finally {
      setIsBookingLoading(false);
    }
  };

  const handleCheckAvailability = (bookingData: BookingFormData) => {
    console.log("Booking data:", bookingData);
    // This would normally validate availability with an API call
    // For now, we'll just redirect to checkout with the booking data
  };

  return (
    <div className="nc-ListingStayDetailPage">
      {/* HEADER */}
      <header className="container 2xl:px-14 rounded-md sm:rounded-xl">
        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* GALLERY */}
          <div className="w-full lg:w-full xl:w-full 2xl:pr-10">
            <GallerySlider
              uniqueID={`stay-${hotel.id}`}
              ratioClass="aspect-w-1 aspect-h-1"
              galleryImgs={data.galleryImgs}
              className="rounded-md sm:rounded-xl overflow-hidden"
            />
          </div>
          
          {/* MAIN INFO */}
          <div className="p-4 bg-white shadow-md rounded-lg">
            <div className="flex flex-col">
              {/* PRICE AND RATING */}
              <div className="flex justify-between mb-4">
                <Badge name={`${hotel.star_rating}-star Hotel`} className="bg-blue-100 text-blue-800" />
                <span className="text-2xl font-bold text-primary-500">
                  {data.price}
                  <span className="text-base font-normal text-neutral-500">/night</span>
                </span>
              </div>
              
              {/* TITLE AND ADDRESS */}
              <h2 className="text-2xl font-bold mb-2">{hotel.name}</h2>
              <div className="flex items-center space-x-3 text-sm text-neutral-500 mb-4">
                <i className="las la-map-marker-alt text-lg"></i>
                <span>{data.address}</span>
              </div>
              
              {/* AMENITIES */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Amenities</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {hotel.amenities.map((amenity, index) => (
                    <Amenity key={index} name={amenity.name} icon={amenity.icon} />
                  ))}
                </div>
              </div>
              
              {/* CHECK IN/OUT TIMES */}
              <div className="flex justify-between mb-6 text-sm text-neutral-700">
                <div>
                  <span className="block font-medium">Check In</span>
                  <span>{hotel.check_in_time || "3:00 PM"}</span>
                </div>
                <div>
                  <span className="block font-medium">Check Out</span>
                  <span>{hotel.check_out_time || "11:00 AM"}</span>
                </div>
              </div>
              
              {/* RATING */}
              <div className="flex items-center space-x-2 mb-6">
                <FiveStartIconForRate defaultPoint={data.reviewStart} />
                <span className="text-sm text-neutral-500">{`${data.reviewCount} reviews`}</span>
              </div>
              
              {/* CTA BUTTONS */}
              <div className="flex space-x-3">
                <ButtonPrimary onClick={handleBookNow} className="flex-1 flex items-center justify-center">
                  {isBookingLoading ? <Spinner size="sm" className="mr-2" /> : <i className="las la-calendar-check mr-2"></i>}
                  Book now
                </ButtonPrimary>
                <ButtonSecondary className="flex-1 flex items-center justify-center">
                  <i className="las la-share mr-2"></i>
                  Share
                </ButtonSecondary>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* DETAIL SECTION */}
      <div className="container pb-24 mt-12 lg:mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* MAIN CONTENT */}
          <div className="lg:col-span-2">
            {/* DESCRIPTION */}
            <div className="border-b border-neutral-200 pb-8 mb-8">
              <h3 className="text-2xl font-semibold">Description</h3>
              <div className="prose prose-sm sm:prose mt-4 text-neutral-700">
                <p>{hotel.description}</p>
              </div>
            </div>
            
            {/* HOST INFORMATION */}
            <div className="border-b border-neutral-200 pb-8 mb-8">
              <h3 className="text-xl font-semibold mb-4">Hotel Contact</h3>
              <div className="flex items-center space-x-4">
                <Avatar imgUrl={data.author.avatar} userName={data.author.displayName} />
                <div>
                  <h4 className="text-base font-medium">{data.author.displayName}</h4>
                  {hotel.email && <p className="text-sm text-neutral-500">{hotel.email}</p>}
                  {hotel.phone && <p className="text-sm text-neutral-500">{hotel.phone}</p>}
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
            
            {/* LOCATION */}
            <div className="border-b border-neutral-200 pb-8 mb-8">
              <h3 className="text-xl font-semibold mb-4">Location</h3>
              <div className="aspect-w-16 aspect-h-9 sm:aspect-h-6 rounded-xl overflow-hidden bg-neutral-200">
                <iframe 
                  src={`https://maps.google.com/maps?q=${hotel.address.latitude || 0},${hotel.address.longitude || 0}&hl=en&z=14&output=embed`}
                  title="Hotel location"
                  className="w-full h-full"
                  loading="lazy"
                ></iframe>
              </div>
              <div className="mt-4 space-y-1 text-sm text-neutral-700">
                <p className="font-medium">{hotel.name}</p>
                <p>{hotel.address.address_line1}</p>
                {hotel.address.address_line2 && <p>{hotel.address.address_line2}</p>}
                <p>{`${hotel.address.city}, ${hotel.address.state} ${hotel.address.zip_code}`}</p>
                <p>{hotel.address.country}</p>
              </div>
            </div>
            
            {/* REVIEWS */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Reviews</h3>
              <CommentListing />
            </div>
          </div>
          
          {/* SIDEBAR */}
          <div className="lg:col-span-1">
            {/* CHECK AVAILABILITY FORM */}
            <div className="sticky top-24">
              <CheckAvailabilityForm 
                hotelId={hotel.id}
                hotelSlug={hotel.slug}
                pricePerNight={data.price}
                onCheckAvailability={handleCheckAvailability}
              />
              
              {/* POLICIES */}
              <div className="mt-6 bg-white rounded-xl p-6 border border-neutral-200 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Policies</h3>
                <div className="text-sm text-neutral-700 space-y-3">
                  <div className="flex items-start">
                    <i className="las la-calendar-check text-lg mr-2 text-neutral-600"></i>
                    <div>
                      <span className="font-medium block">Cancellation policy</span>
                      <span>Free cancellation up to 48 hours before check-in</span>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <i className="las la-check-circle text-lg mr-2 text-neutral-600"></i>
                    <div>
                      <span className="font-medium block">Check-in</span>
                      <span>{hotel.check_in_time || "3:00 PM"} - Check in with front desk</span>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <i className="las la-sign-out-alt text-lg mr-2 text-neutral-600"></i>
                    <div>
                      <span className="font-medium block">Check-out</span>
                      <span>Before {hotel.check_out_time || "11:00 AM"}</span>
                    </div>
                  </div>
                  {hotel.policy && (
                    <div className="flex items-start">
                      <i className="las la-info-circle text-lg mr-2 text-neutral-600"></i>
                      <div>
                        <span className="font-medium block">House rules</span>
                        <span>{hotel.policy}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelDetail; 