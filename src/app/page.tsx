import React from "react";
import SectionHero from "@/components/SectionHero";
import SectionSliderNewCategories from "@/components/SectionSliderNewCategories";
import BackgroundSection from "@/components/BackgroundSection";
import SectionGridFeaturePlaces from "@/components/SectionGridFeaturePlaces";
import SectionHowItWork from "@/components/SectionHowItWork";
import SectionSubscribe2 from "@/components/SectionSubscribe2";
import BgGlassmorphism from "@/components/BgGlassmorphism";
import { FEATURED_CITIES } from "@/data/cities";

function Page() {
  return (
    <main className="nc-PageHome relative overflow-hidden">
      {/* GLASSMORPHISM */}
      <BgGlassmorphism />

      {/* SECTION HERO */}
      <div className="container px-4 mx-auto">
        <SectionHero className="pt-10 pb-16 md:pt-16 md:pb-24" />
      </div>

      {/* SECTION POPULAR CATEGORIES */}
      <div className="container px-4 mx-auto relative space-y-24 mb-24 lg:space-y-32 lg:mb-32">
        <SectionSliderNewCategories
          categories={FEATURED_CITIES}
          uniqueClassName="PageHome_s1"
        />

        {/* SECTION FEATURED HOTELS */}
        <div className="relative py-16">
          <BackgroundSection />
          <SectionGridFeaturePlaces />
        </div>

        {/* SECTION HOW IT WORK */}
        <SectionHowItWork />

        {/* SECTION SUBSCRIPTION */}
        <div className="relative py-16">
          <BackgroundSection className="bg-neutral-100/70 dark:bg-black/20" />
          <SectionSubscribe2 />
        </div>
      </div>
    </main>
  );
}

export default Page;