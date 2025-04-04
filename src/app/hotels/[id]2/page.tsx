'use client';

import React from "react";
import HotelDetail from "@/components/HotelDetail";
import BgGlassmorphism from "@/components/BgGlassmorphism";

interface HotelDetailPageProps {
  params: {
    id: string;
  };
}

export default function HotelDetailPage({ params }: HotelDetailPageProps) {
  const { id } = params;
  
  return (
    <div className="nc-HotelDetailPage relative">
      {/* GLASSMORPHISM */}
      <BgGlassmorphism />

      <div className="container relative">
        {/* HOTEL DETAIL COMPONENT */}
        <HotelDetail slug={id} />
      </div>
    </div>
  );
} 