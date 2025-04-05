"use client";

import React, { FC, useEffect, useState } from "react";
import imagePng from "@/images/hero-right.png";
import HeroSearchForm from "../(client-components)/(HeroSearchForm)/HeroSearchForm";
import Image from "next/image";
import ButtonPrimary from "@/shared/ButtonPrimary";
import useTranslation from "@/hooks/useTranslation";
import { getLocalizedUrl } from "@/utils/getLocalizedUrl";
import { useParams } from "next/navigation";
import { Route } from "next";

export interface SectionHeroProps {
  className?: string;
}

const SectionHero: FC<SectionHeroProps> = ({ className = "" }) => {
  const t = useTranslation('home');
  const [mounted, setMounted] = useState(false);
  const params = useParams();
  const locale = params?.locale as string;

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className={`nc-SectionHero flex flex-col-reverse lg:flex-col relative ${className}`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center">
        <div 
          className="flex-shrink-0 lg:w-1/2 flex flex-col items-start space-y-8 sm:space-y-10 pb-14 lg:pb-64 xl:pr-14 lg:mr-10 xl:mr-0"
          data-aos="fade-right"
          data-aos-delay="200"
          data-aos-duration="800"
        >
          <h2 className="font-medium text-4xl md:text-5xl xl:text-7xl !leading-[114%] ">
            {t('hero.title')}
          </h2>
          <span 
            className="text-base md:text-lg text-neutral-500 dark:text-neutral-400"
            data-aos="fade-up"
            data-aos-delay="400"
          >
            {t('hero.subtitle')}
          </span>
          <ButtonPrimary 
            href={getLocalizedUrl("/listing-stay-map", locale) as Route}
            sizeClass="px-5 py-4 sm:px-7"
            data-aos="fade-up"
            data-aos-delay="600"
          >
            {t('hero.search')}
          </ButtonPrimary>
        </div>
        <div 
          className="flex-grow"
          data-aos="fade-left"
          data-aos-delay="300"
          data-aos-duration="1000"
        >
          <Image className="w-half" src={imagePng} alt="hero" priority />
        </div>
      </div>

      <div 
        className="hidden lg:block z-10 mb-12 lg:mb-0 lg:-mt-40 w-full"
        data-aos="fade-up"
        data-aos-delay="500"
        data-aos-duration="1000"
      >
        <HeroSearchForm />
      </div>
    </div>
  );
};

export default SectionHero;
