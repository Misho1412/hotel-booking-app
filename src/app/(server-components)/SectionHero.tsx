"use client";

import React, { FC, useEffect, useState } from "react";
import HeroSearchForm from "../(client-components)/(HeroSearchForm)/HeroSearchForm";
import useTranslation from "@/hooks/useTranslation";
import { useParams } from "next/navigation";
import Link from "next/link";

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
    <div className="nc-SectionHero relative h-screen">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/images/back.jpg" 
          alt="Islamic Background" 
          className="absolute inset-0 w-full h-full object-cover" 
        />
      </div>
      
      {/* Black overlay with 50% opacity */}
      <div className="absolute inset-0 z-0 bg-black opacity-50"></div>

      {/* Main content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center">
        {/* Main heading - Left aligned */}
        <div className="container px-6 mx-auto flex flex-col items-start mt-[-100px] mb-12">
          <h1 
            className="font-normal text-5xl md:text-6xl xl:text-7xl leading-tight text-left max-w-3xl"
            style={{
              background: 'linear-gradient(90deg, rgba(255, 255, 255, 1) 0%, rgba(204, 204, 204, 1) 77%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0px 4px 5px rgba(0, 0, 0, 0.3)',
              marginLeft: '0.5rem'
            }}
          >
            Explore your place<br/>to stay
          </h1>
        </div>
        
        {/* Search form - Left-aligned */}
        <div className="w-full px-6 relative z-20 mt-8 self-start">
          <HeroSearchForm className="ml-6" />
        </div>
        
        {/* Right side text info */}
        <div className="hidden lg:block absolute right-6 bottom-32 max-w-[500px] z-10">
          <div className="relative pl-6">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#C49C74]"></div>
            <div className="text-white">
              <p className="text-2xl font-semibold mb-3">
                Book your perfect accommodation<br />
                for a spiritual journey to Makkah or<br />
                Madinah
              </p>
              <p className="text-lg font-light opacity-90">Peaceful stays, spiritual days.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionHero; 