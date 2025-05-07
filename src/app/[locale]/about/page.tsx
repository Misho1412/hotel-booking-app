"use client";

import rightImg from "@/images/hero-right.png";
import React, { FC, useState, useEffect } from "react";
import BgGlassmorphism from "@/components/BgGlassmorphism";
import BackgroundSection from "@/components/BackgroundSection";
import SectionClientSay from "@/components/SectionClientSay";
import SectionSubscribe2 from "@/components/SectionSubscribe2";
import dynamic from "next/dynamic";
import useTranslation from "@/hooks/useTranslation";

// Dynamically import components to prevent hydration errors
const SectionHero = dynamic(() => import("@/app/about/SectionHero"), {
  ssr: false,
});
const SectionFounder = dynamic(() => import("@/app/about/SectionFounder"), {
  ssr: false,
});
const SectionStatistic = dynamic(() => import("@/app/about/SectionStatistic"), {
  ssr: false,
});

export interface PageAboutProps {
  params: { locale: string };
}

const PageAbout: FC<PageAboutProps> = ({ params }) => {
  const [isMounted, setIsMounted] = useState(false);
  const t = useTranslation('about');
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // If not mounted yet, show a loading state
  if (!isMounted) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse bg-gray-200 h-40 w-40 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className={`nc-PageAbout overflow-hidden relative`}>
      {/* ======== BG GLASS ======== */}
      <BgGlassmorphism />

      <div className="container py-16 lg:py-28 space-y-16 lg:space-y-28">
        <div data-aos="fade-up" data-aos-duration="1000">
          <SectionHero
            rightImg={rightImg}
            heading={t('hero.greeting')}
            btnText=""
            subHeading={t('hero.subHeading')}
          />
        </div>

        <div data-aos="fade-up" data-aos-duration="1000" data-aos-delay="200">
          <SectionFounder />
        </div>
        
        <div className="relative py-16" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="300">
          <BackgroundSection />
          <SectionClientSay />
        </div>

        <div data-aos="fade-up" data-aos-duration="1000" data-aos-delay="400">
          <SectionStatistic />
        </div>

        <div data-aos="fade-up" data-aos-duration="1000" data-aos-delay="500">
          <SectionSubscribe2 />
        </div>
      </div>
    </div>
  );
};

export default PageAbout; 