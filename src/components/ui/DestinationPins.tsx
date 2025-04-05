"use client";
import React from "react";
import { PinContainer } from "@/components/ui/3d-pin";
import useTranslation from "@/hooks/useTranslation";
import { usePathname } from "next/navigation";

export function DestinationPins() {
  const t = useTranslation('home');
  const pathname = usePathname();
  const isArabic = pathname?.startsWith('/ar');
  
  return (
    <div className="py-16">
      <div className="container px-4 mx-auto">
        <div className="flex flex-col items-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold text-center mb-4">
            {t('featuredPlaces.title') || "Featured Destinations"}
          </h2>
          <span className="text-base sm:text-lg text-neutral-500 dark:text-neutral-400 text-center">
            {t('featuredPlaces.subtitle') || "Popular places to stay that we recommend for you"}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-24 my-8">
          {/* First 3D Pin - Makkah */}
          <div 
            className="h-[30rem] flex items-center justify-center"
            data-aos="fade-up"
            data-aos-delay="200"
            data-aos-duration="1000"
          >
            <PinContainer title={isArabic ? "استكشف مكة المكرمة" : "Explore Makkah"} href="/listing-stay?category=religious" 
              containerClassName="group/makkah transition-transform duration-300"
            >
              <div className="flex flex-col p-4 tracking-tight text-slate-100/90 w-[20rem] h-[20rem] rounded-2xl overflow-hidden relative shadow-xl transition-all duration-300 group-hover/makkah:shadow-amber-400/30">
                {/* Background Image */}
                <div 
                  className="absolute inset-0 z-0 rounded-2xl bg-cover bg-center bg-no-repeat" 
                  style={{
                    backgroundImage: `url("/images/makah.jpg")`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  {/* Dark overlay */}
                  <div 
                    className="absolute inset-0 bg-black/30 rounded-2xl border-2 border-amber-400 shadow-lg shadow-amber-400/20"
                  ></div>
                </div>
                
                {/* Content overlay for Makkah */}
                <div className="relative z-10 flex flex-col h-full backdrop-blur-[2px]">
                  {/* Header */}
                  <div className="flex items-center gap-2 bg-black/40 px-3 py-2 rounded-lg self-start border-r-2 border-amber-500">
                    <div className="size-3 rounded-full bg-amber-500 animate-pulse" />
                    <div className="text-xs text-amber-100">
                      {isArabic ? t('featuredPlaces.destinations.makkah.title') : "Spiritual Stay in Makkah"}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 mt-4 space-y-4">
                    <div className="text-2xl font-bold text-amber-100 drop-shadow-md">
                      {isArabic ? t('featuredPlaces.destinations.makkah.name') : "Makkah"}
                    </div>
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1 bg-black/30 rounded-lg p-2 border border-amber-500/30">
                        <div className="text-3xl font-bold text-amber-400">100+</div>
                        <div className="text-xs text-slate-200">
                          {isArabic ? t('featuredPlaces.destinations.makkah.hotelsNearHaram') : "Hotels Near Haram"}
                        </div>
                      </div>
                      <div className="space-y-1 bg-black/30 rounded-lg p-2 border border-amber-500/30">
                        <div className="text-3xl font-bold text-amber-400">4.8★</div>
                        <div className="text-xs text-slate-200">
                          {isArabic ? t('featuredPlaces.destinations.makkah.avgRating') : "Avg. Rating"}
                        </div>
                      </div>
                    </div>

                    {/* Spacer instead of waves */}
                    <div className="h-8"></div>

                    {/* Footer */}
                    <div className="flex justify-between items-end">
                      <div className="text-xs text-white bg-black/30 px-3 py-1 rounded-lg border-l-2 border-amber-500">
                        {isArabic ? t('featuredPlaces.destinations.makkah.secureSpot') : "Secure your spot early for Hajj & Umrah"}
                      </div>
                      <div className="text-amber-300 font-medium bg-black/30 px-3 py-1 rounded-lg hover:bg-amber-500/20 transition-colors">
                        {isArabic ? t('featuredPlaces.destinations.makkah.explore') : "Explore"} →
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </PinContainer>
          </div>

          {/* Second 3D Pin - Madina Destination */}
          <div 
            className="h-[30rem] flex items-center justify-center"
            data-aos="fade-up"
            data-aos-delay="400"
            data-aos-duration="1000"
          >
            <PinContainer title={isArabic ? "اكتشف المدينة المنورة" : "Explore Madina"} href="/listing-stay?category=religious"
              containerClassName="group/madina transition-transform duration-300"
            >
              <div className="flex flex-col p-4 tracking-tight text-slate-100/90 w-[20rem] h-[20rem] rounded-2xl overflow-hidden relative shadow-xl transition-all duration-300 group-hover/madina:shadow-amber-400/30">
                {/* Background Image */}
                <div 
                  className="absolute inset-0 z-0 rounded-2xl bg-cover bg-center bg-no-repeat" 
                  style={{
                    backgroundImage: `url("/images/madena.jpg")`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    height: '100%',
                    width: '100%'
                  }}
                >
                  {/* Dark overlay */}
                  <div 
                    className="absolute inset-0 bg-black/30 rounded-2xl border-2 border-amber-400 shadow-lg shadow-amber-400/20"
                  ></div>
                </div>
                
                {/* Content overlay for Madina */}
                <div className="relative z-10 flex flex-col h-full backdrop-blur-[2px]">
                  {/* Header */}
                  <div className="flex items-center gap-2 bg-black/40 px-3 py-2 rounded-lg self-start border-r-2 border-amber-500">
                    <div className="size-3 rounded-full bg-amber-500 animate-pulse" />
                    <div className="text-xs text-amber-100">
                      {isArabic ? t('featuredPlaces.destinations.madina.title') : "Peaceful Stay in Madina"}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 mt-4 space-y-4">
                    <div className="text-2xl font-bold text-amber-100 drop-shadow-md">
                      {isArabic ? t('featuredPlaces.destinations.madina.name') : "Madina"}
                    </div>
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1 bg-black/30 rounded-lg p-2 border border-amber-500/30">
                        <div className="text-3xl font-bold text-amber-400">75+</div>
                        <div className="text-xs text-slate-200">
                          {isArabic ? t('featuredPlaces.destinations.madina.hotelsAvailable') : "Hotels Available"}
                        </div>
                      </div>
                      <div className="space-y-1 bg-black/30 rounded-lg p-2 border border-amber-500/30">
                        <div className="text-3xl font-bold text-amber-400">4.7★</div>
                        <div className="text-xs text-slate-200">
                          {isArabic ? t('featuredPlaces.destinations.madina.avgRating') : "Avg. Rating"}
                        </div>
                      </div>
                    </div>

                    {/* Spacer */}
                    <div className="h-8"></div>

                    {/* Footer */}
                    <div className="flex justify-between items-end">
                      <div className="text-xs text-white bg-black/30 px-3 py-1 rounded-lg border-l-2 border-amber-500">
                        {isArabic ? t('featuredPlaces.destinations.madina.visitProphetsMosque') : "Visit Prophet's Mosque"}
                      </div>
                      <div className="text-amber-300 font-medium bg-black/30 px-3 py-1 rounded-lg hover:bg-amber-500/20 transition-colors">
                        {isArabic ? t('featuredPlaces.destinations.madina.discover') : "Discover"} →
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </PinContainer>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes wave {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        @keyframes pulse {
          0% {
            opacity: 0.4;
            transform: scale(0.8);
          }
          100% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
      `}</style>
    </div>
  );
} 