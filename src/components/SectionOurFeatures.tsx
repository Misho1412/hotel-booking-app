"use client";

import React, { FC, useState, useEffect } from "react";
import rightImgPng from "@/images/our-features.png";
import Image, { StaticImageData } from "next/image";
import Badge from "@/shared/Badge";
import useTranslation from "@/hooks/useTranslation";

export interface SectionOurFeaturesProps {
  className?: string;
  rightImg?: StaticImageData;
  type?: "type1" | "type2";
}

const SectionOurFeatures: FC<SectionOurFeaturesProps> = ({
  className = "lg:py-14",
  rightImg = rightImgPng,
  type = "type1",
}) => {
  const t = useTranslation('home');
  const searchT = useTranslation('search');
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // If component isn't mounted yet, show a loading state
  if (!isMounted) {
    return (
      <div className="animate-pulse bg-gray-200 h-80 w-full rounded"></div>
    );
  }

  return (
    <div
      className={`nc-SectionOurFeatures relative flex flex-col items-center ${
        type === "type1" ? "lg:flex-row" : "lg:flex-row-reverse"
      } ${className}`}
      data-nc-id="SectionOurFeatures"
      data-aos="fade-up"
      data-aos-duration="1000"
    >
      <div 
        className="flex-grow"
        data-aos={type === "type1" ? "fade-right" : "fade-left"}
        data-aos-delay="300"
      >
        <Image src={rightImg} alt="" />
      </div>
      <div
        className={`max-w-2xl flex-shrink-0 mt-10 lg:mt-0 lg:w-2/5 ${
          type === "type1" ? "lg:pl-16" : "lg:pr-16"
        }`}
        data-aos={type === "type1" ? "fade-left" : "fade-right"}
        data-aos-delay="400"
      >
        <span 
          className="uppercase text-sm text-gray-400 tracking-widest"
          data-aos="fade-up"
          data-aos-delay="500"
        >
          {t('benefits.title', 'Benefits')}
        </span>
        <h2 
          className="font-semibold text-4xl mt-5"
          data-aos="fade-up"
          data-aos-delay="600"
        >
          {t('benefits.subtitle', 'Happening Cities')}
        </h2>

        <ul className="space-y-10 mt-16">
          <li 
            className="space-y-4"
            data-aos="fade-up"
            data-aos-delay="700"
          >
            <Badge name={searchT('advanced', 'Advanced')} />
            <span className="block text-xl font-semibold">
              {t('benefits.advertising.title', 'Cost-effective advertising')}
            </span>
            <span className="block mt-5 text-neutral-500 dark:text-neutral-400">
              {t('benefits.advertising.description', 'With a free listing, you can advertise your rental with no upfront costs')}
            </span>
          </li>
          <li 
            className="space-y-4"
            data-aos="fade-up"
            data-aos-delay="800"
          >
            <Badge color="green" name={searchT('advanced', 'Advanced')} />
            <span className="block text-xl font-semibold">
              {t('benefits.exposure.title', 'Reach millions with Chisfis')}
            </span>
            <span className="block mt-5 text-neutral-500 dark:text-neutral-400">
              {t('benefits.exposure.description', 'Millions of people are searching for unique places to stay around the world')}
            </span>
          </li>
          <li 
            className="space-y-4"
            data-aos="fade-up"
            data-aos-delay="900"
          >
            <Badge color="red" name={searchT('advanced', 'Advanced')} />
            <span className="block text-xl font-semibold">
              {t('benefits.secure.title', 'Secure and simple')}
            </span>
            <span className="block mt-5 text-neutral-500 dark:text-neutral-400">
              {t('benefits.secure.description', 'A Holiday Lettings listing gives you a secure and easy way to take bookings and payments online')}
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SectionOurFeatures;
