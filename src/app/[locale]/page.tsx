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
      <div className="relative ">
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