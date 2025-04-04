"use client";

import { FC } from "react";
import dynamic from "next/dynamic";

// Dynamically import the original hotels page component to prevent hydration errors
const OriginalHotelsPage = dynamic(() => import("@/app/hotels/page"), {
  ssr: false,
});

export interface PageProps {
  params: { locale: string };
}

const HotelsPage: FC<PageProps> = ({ params }) => {
  return <OriginalHotelsPage />;
};

export default HotelsPage; 