import React from "react";
import SectionHero from "@/app/(server-components)/SectionHero";
import BgGlassmorphism from "@/components/BgGlassmorphism";
import { TaxonomyType } from "@/data/types";
import SectionOurFeatures from "@/components/SectionOurFeatures";
import BackgroundSection from "@/components/BackgroundSection";
import SectionHowItWork from "@/components/SectionHowItWork";
import SectionSubscribe2 from "@/components/SectionSubscribe2";
import SectionVideos from "@/components/SectionVideos";
import SectionBecomeAnAuthor from "@/components/SectionBecomeAnAuthor";
import { getTranslations } from 'next-intl/server';
import SectionHeroArchivePage from "@/app/(server-components)/SectionHeroArchivePage";
import SectionGridFilterCard from "@/components/SectionGridFilterCard";
import { DEMO_STAY_LISTINGS } from "@/data/listings";
import SectionHero2ArchivePage from "@/app/(server-components)/SectionHero2ArchivePage";
import { DestinationPins } from "@/components/ui/DestinationPins";
import SectionGridFeaturePlaces from "@/components/SectionGridFeaturePlaces";

interface Props {
  params: { locale: string }
}

export default async function PageHome({ params: { locale } }: Props) {
  // Get translations - using getTranslations from server instead of useTranslations
  const t = await getTranslations({ locale, namespace: 'home' });

  return (
    <main className="nc-PageHome relative overflow-hidden">
      {/* GLASSMOPHIN */}
      <BgGlassmorphism />

      <div className="container relative space-y-24 mb-24 lg:space-y-28 lg:mb-28">
        {/* SECTION HERO */}
        
        <SectionHero className="pt-10 lg:pt-16 lg:pb-16" />
        <div data-aos="fade-up" data-aos-duration="1000">
          <DestinationPins />
        </div>
        <SectionOurFeatures />
        <SectionGridFeaturePlaces />
        {/* FEATURED PLACES */}


        <SectionHowItWork />

        <SectionSubscribe2 />

        <SectionVideos />

        <div className="relative py-16">
          <BackgroundSection />
          <SectionBecomeAnAuthor />
        </div>
      </div>
    </main>
  );
} 