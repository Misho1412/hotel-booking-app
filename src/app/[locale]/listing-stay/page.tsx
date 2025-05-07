"use client";

import { FC } from "react";
import dynamic from "next/dynamic";
import SectionHero from "@/app/(server-components)/SectionHero";
import { getTranslations } from 'next-intl/server';
import SectionHowItWork from "@/components/SectionHowItWork";
import SectionSubscribe2 from "@/components/SectionSubscribe2";
import SectionBecomeAnAuthor from "@/components/SectionBecomeAnAuthor";
import SectionGridFeaturePlacesV2 from "@/components/SectionGridFeaturePlacesV2";


// Dynamically import the original listing-stay page component
const OriginalListingStayPage = dynamic(
  () => import("@/app/(stay-listings)/listing-stay/page"),
  { ssr: false }
);

export interface PageProps {
  params: { locale: string };
}

const ListingStayPage: FC<PageProps> = ({ params }) => {
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
        {/* Hero section taking up most of the viewport */}
        <div className="min-h-screen">
          <SectionHero className="pt-28 lg:pt-36" />
        </div>
        {/* Example: Rest of content with white background cards */}
        <div className="bg-white dark:bg-neutral-900 backdrop-blur-sm p-5 shadow-xl z-40">
        <OriginalListingStayPage />
        </div>

        <div className="bg-[#252525] backdrop-blur-sm p-5 shadow-xl">
          <SectionHowItWork />
        </div>

        <SectionSubscribe2 />

        <div className="bg-[#252525] backdrop-blur-sm p-5 shadow-xl">
          <SectionBecomeAnAuthor />
        </div>
      </div>
    </main>
  );
};

export default ListingStayPage;
