import React from "react";
import SectionHero from "@/app/(server-components)/SectionHero";
import { getTranslations } from 'next-intl/server';
import SectionHowItWork from "@/components/SectionHowItWork";
import SectionSubscribe2 from "@/components/SectionSubscribe2";
import SectionBecomeAnAuthor from "@/components/SectionBecomeAnAuthor";
import SectionGridFeaturePlacesV2 from "@/components/SectionGridFeaturePlacesV2";

interface Props {
  params: { locale: string }
}

export default async function PageHome({ params: { locale } }: Props) {
  // Get translations - using getTranslations from server instead of useTranslations
  const t = await getTranslations({ locale, namespace: 'home' });

  return (
    <main className="nc-PageHome relative overflow-hidden">
      {/* Full-page background image with overlay */}
      <div className="fixed inset-0 z-0">
        <img 
          src="/images/back.jpg" 
          alt="Islamic Background" 
          className="absolute inset-0 w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-black bg-opacity-50" />
      </div>

      {/* Main content */}
      <div className="relative">
        {/* Decorative SVG */}
        <div className="absolute top-[728px] left-[32%] transform -translate-x-1/2 rotate-180 w-full max-w-[1012px] z-[9999] pointer-events-none">
  <svg 
   width="50%" 
   height="40%" 
   viewBox="0 0 1012 108" 
   fill="none" 
   xmlns="http://www.w3.org/2000/svg" 
   preserveAspectRatio="none"
  >
    <path 
      fillRule="evenodd" 
      clipRule="evenodd" 
      d="M448.195 9.82477e-06C671.116 -1.10291e-05 1044.73 -3.55688e-05 1009 3.8554e-05C953.621 0.000153433 935.083 30.4789 917.706 59.0483C902.378 84.2491 887.954 107.964 849.945 107.964L722.845 107.964L161.443 107.964C123.434 107.964 109.01 84.2491 93.6817 59.0483C76.3049 30.4789 57.7666 0.00016321 2.38801 4.83307e-05C-27.686 -1.40559e-05 232.223 -6.54995e-06 448.195 9.82477e-06Z" 
      fill="#FFFFFF" 
    />
  </svg>
</div>
        {/* Hero section taking up most of the viewport */}
        <div className="min-h-screen">
          <SectionHero className="pt-28 lg:pt-36" />
        </div>

        {/* Rest of content with white background cards */}
        {/* Featured Hotel Cards with new design */}
        <div className="bg-white dark:bg-neutral-900 backdrop-blur-sm p-5 shadow-xl z-40">
          <SectionGridFeaturePlacesV2 />
        </div>
        
        <div className="bg-[#252525] backdrop-blur-sm p-5 shadow-xl">
          <SectionHowItWork />
        </div>
        {/* RoomTypes section with its own background */}
        <SectionSubscribe2 />
        <div className="bg-[#252525] backdrop-blur-sm p-5 shadow-xl">
          <SectionBecomeAnAuthor />
        </div>
      </div>
    </main>
  );
} 