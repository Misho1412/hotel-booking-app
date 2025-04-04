"use client";

import { FC } from "react";
import dynamic from "next/dynamic";
import BgGlassmorphism from "@/components/BgGlassmorphism";

// Dynamically import components to prevent hydration errors
const HotelPageContent = dynamic(() => import("@/app/hotels/[id]/page"), {
  ssr: false,
});

export interface PageProps {
  params: { locale: string; id: string };
}

const HotelPage: FC<PageProps> = ({ params }) => {
  const { id, locale } = params;
  
  return <HotelPageContent params={{ id, locale }} />;
};

export default HotelPage; 