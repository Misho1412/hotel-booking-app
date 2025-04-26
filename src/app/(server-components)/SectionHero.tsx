"use client";

import React, { FC, useEffect, useState } from "react";
import HeroSearchForm from "../(client-components)/(HeroSearchForm)/HeroSearchForm";
import ButtonPrimary from "@/shared/ButtonPrimary";
import useTranslation from "@/hooks/useTranslation";
import { useParams } from "next/navigation";

export interface SectionHeroProps {
  className?: string;
}

const SectionHero: FC<SectionHeroProps> = ({ className = "" }) => {
  const t = useTranslation('home');
  const [mounted, setMounted] = useState(false);
  const params = useParams();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={`nc-SectionHero relative pt-10 pb-24 ${className}`}>
      {/* Main hero text */}
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-start max-w-4xl">
          <h2 
            className="font-normal text-5xl md:text-7xl xl:text-[80px] leading-tight text-white"
            style={{
              background: 'linear-gradient(90deg, rgba(255, 255, 255, 1) 0%, rgba(204, 204, 204, 1) 77%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0px 4px 5px rgba(0, 0, 0, 0.3)'
            }}
          >
            Explore your place<br />to stay
          </h2>
          
          <div className="mt-10 md:mt-20 w-full">
            <HeroSearchForm />
          </div>
        </div>
      </div>
      
      {/* Text on the right - smaller version */}
      <div className="hidden lg:block absolute right-3 bottom-1 , max-w-[200px]">
        <div className="relative pl-6">
          {/* Vertical line - thinner */}
          <div className="absolute left-0 top-2 bottom-2 w-px bg-white"></div>
          <p className="text-white text-xl font-bold leading-snug">{t('hero.subtitle')}</p>
          <p className="text-white text-base mt-2">{t('hero.subTitle')}</p>
        </div>
      </div>
    </div>
  );
};

export default SectionHero;
