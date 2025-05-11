'use client';

import Image from "next/image";
import heroRightImg from "@/images/hero-right.png";
import SectionFounder from "@/components/SectionFounder";
import SectionStatistic from "@/components/SectionStatistic";
import SectionHero from "@/app/about/SectionHero";
import BgGlassmorphism from "@/components/BgGlassmorphism";
import SectionClientSay from "@/components/SectionClientSay";
import SectionSubscribe2 from "@/components/SectionSubscribe2";

export default function PageAbout() {
  return (
    <div className={`nc-PageAbout overflow-hidden relative`}>
      {/* ======== BG GLASS ======== */}
      <BgGlassmorphism />

      <div className="container py-16 lg:py-28 space-y-16 lg:space-y-28">
        <SectionHero
          rightImg={heroRightImg}
          heading="👋 About Us."
          btnText=""
          subHeading="We're impartial and independent, and every day we create distinctive, world-class programmes and content which inform, educate and entertain millions of people in the around the world."
        />

        <SectionFounder />
        <SectionStatistic />
        <SectionClientSay />
        <SectionSubscribe2 />
      </div>
    </div>
  );
}
