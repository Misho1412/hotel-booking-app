import React from "react";
import SectionHero from "@/app/(server-components)/SectionHero";
import { getTranslations } from 'next-intl/server';
import HotelsInYourArea from "@/components/HotelsInYourArea";
import SectionHowItWork from "@/components/SectionHowItWork";
import SectionSubscribe2 from "@/components/SectionSubscribe2";
import SectionVideos from "@/components/SectionVideos";
import SectionBecomeAnAuthor from "@/components/SectionBecomeAnAuthor";
import BackgroundSection from "@/components/BackgroundSection";

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

      {/* Header is positioned fixed at the top */}
      
      {/* Main content */}
      <div className="relative z-10">
        {/* Hero section taking up most of the viewport */}
        <div className="min-h-screen">
          <SectionHero className="pt-36 lg:pt-48" />
        </div>
        
        {/* Rest of content with white background cards */}
  <div className="bg-white/100 dark:bg-neutral-900/80 backdrop-blur-sm p-3 shadow-xl h-[700px] z-20">
    <HotelsInYourArea />
  </div>
  
  <div className="bg-[#252525] backdrop-blur-sm p-5 shadow-xl"> {/* Added margin-top */}
    <SectionHowItWork />
  </div>
</div>
          <div className="bg-white/100 dark:bg-neutral-900/80 backdrop-blur-sm p-5  shadow-xl">
            <SectionSubscribe2 />
          </div>

          <div className="bg-white/100 dark:bg-neutral-900/80 backdrop-blur-sm p-5  shadow-xl">
            <SectionVideos />
          </div>

          <div className="relative py-16 bg-white/100 dark:bg-neutral-900/80 backdrop-blur-sm p-5  shadow-xl">
            <BackgroundSection />
            <SectionBecomeAnAuthor />
          </div>
    </main>
  );
} 