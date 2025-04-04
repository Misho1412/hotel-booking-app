"use client";

import { FC } from "react";
import dynamic from "next/dynamic";

// Dynamically import the original listing-stay-map page component to prevent hydration errors
const OriginalListingStayMapPage = dynamic(
  () => import("@/app/(stay-listings)/listing-stay-map/page"),
  { ssr: false }
);

export interface PageProps {
  params: { locale: string };
}

const ListingStayMapPage: FC<PageProps> = ({ params }) => {
  return <OriginalListingStayMapPage />;
};

export default ListingStayMapPage; 