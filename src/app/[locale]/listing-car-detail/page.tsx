"use client";

import { FC } from "react";
import dynamic from "next/dynamic";

// Dynamically import the original listing-car-detail page component to prevent hydration errors
const OriginalListingCarDetailPage = dynamic(
  () => import("@/app/(listing-detail)/listing-car-detail/page"),
  { ssr: false }
);

export interface PageProps {
  params: { locale: string };
}

const ListingCarDetailPage: FC<PageProps> = ({ params }) => {
  return <OriginalListingCarDetailPage />;
};

export default ListingCarDetailPage; 