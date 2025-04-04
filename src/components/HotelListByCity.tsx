"use client";

import React, { FC, useState, useEffect } from 'react';
import ButtonPrimary from "@/shared/ButtonPrimary";
import { useParams } from "next/navigation";
import hotelService from '@/lib/api/services/hotelService';
import { hotelsToStayData } from '@/lib/api/adapters';
import { StayDataType } from '@/data/types';
import LocalizedStayCard2 from './LocalizedStayCard2';
import Spinner from '@/shared/Spinner';
import Alert from '@/shared/Alert';
import Heading from '@/shared/Heading';
import useTranslation from '@/hooks/useTranslation';

export interface HotelListByCityProps {
  city: string;
  limit?: number;
  heading?: string;
  subHeading?: string;
  className?: string;
  viewAllLink?: string;
}

const HotelListByCity: FC<HotelListByCityProps> = ({
  city,
  limit = 4,
  heading,
  subHeading,
  className = "",
  viewAllLink = "/listing-stay",
}) => {
  const [hotels, setHotels] = useState<StayDataType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const params = useParams();
  const locale = params?.locale as string;
  const t = useTranslation('home');

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // Fetch hotels from the service
        const data = await hotelService.getHotelsByCity(city, limit);
        // Convert to StayDataType
        const stayData = hotelsToStayData(data);
        setHotels(stayData);
      } catch (err: any) {
        console.error(`Error fetching hotels for ${city}:`, err);
        setError(new Error(`Failed to load hotels for ${city}: ${err.message}`));
      } finally {
        setIsLoading(false);
      }
    };

    fetchHotels();
  }, [city, limit]);

  // Default values with translations if none provided
  const displayHeading = heading || `${t('featuredPlaces.title')} in ${city}`;
  const displaySubHeading = subHeading || t('featuredPlaces.subtitle');

  const renderCard = (stay: StayDataType, index: number) => {
    return (
      <div 
        key={stay.id}
        data-aos="fade-up"
        data-aos-delay={200 + index * 100}
        data-aos-duration="800"
      >
        <LocalizedStayCard2 data={stay} locale={locale} />
      </div>
    );
  };

  return (
    <div className={`nc-HotelListByCity relative ${className}`}>
      <Heading
        desc={displaySubHeading}
        isCenter={false}
      >
        {displayHeading}
      </Heading>

      {error && (
        <Alert type="error" className="my-5">
          {error.message}
          <button 
            className="underline ml-3 font-medium" 
            onClick={() => {
              setIsLoading(true);
              hotelService.getHotelsByCity(city, limit)
                .then(data => {
                  setHotels(hotelsToStayData(data));
                  setError(null);
                })
                .catch(err => {
                  setError(new Error(`Failed to load hotels for ${city}: ${err.message}`));
                })
                .finally(() => {
                  setIsLoading(false);
                });
            }}
          >
            Try again
          </button>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[300px]">
          <Spinner className="h-10 w-10" />
        </div>
      ) : hotels.length > 0 ? (
        <div className="grid gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {hotels.map((hotel, index) => renderCard(hotel, index))}
        </div>
      ) : (
        <div className="flex justify-center items-center min-h-[200px] bg-neutral-50 dark:bg-neutral-800 rounded-2xl">
          <p className="text-neutral-500 dark:text-neutral-400">
            No hotels found in {city}.
          </p>
        </div>
      )}

      {hotels.length > 0 && (
        <div className="flex justify-center mt-12">
          <ButtonPrimary href={viewAllLink}>
            {t('featured.viewAll')}
          </ButtonPrimary>
        </div>
      )}
    </div>
  );
};

export default HotelListByCity; 