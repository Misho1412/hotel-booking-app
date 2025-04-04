"use client";

import React from "react";
import HotelListing from "@/components/HotelListing";
import BgGlassmorphism from "@/components/BgGlassmorphism";
import SectionSubscribe2 from "@/components/SectionSubscribe2";

export default function HotelsPage() {
  return (
    <div className="nc-HotelsPage relative">
      {/* GLASSMORPHISM */}
      <BgGlassmorphism />

      <div className="container relative pt-10 pb-16 lg:pt-20 lg:pb-28">
        {/* MAIN CONTENT */}
        <div className="relative">
          <HotelListing 
            heading="All Available Hotels" 
            subHeading="Find your perfect stay from our carefully selected properties"
            initialParams={{ page: 1, page_size: 16 }}
          />
        </div>
        
        {/* SECTION SUBSCRIPTION */}
        <div className="relative py-16 mt-16 lg:mt-24">
          <SectionSubscribe2 />
        </div>
      </div>
    </div>
  );
} 