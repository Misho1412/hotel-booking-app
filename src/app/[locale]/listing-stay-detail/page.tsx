"use client";

import { FC } from "react";
import dynamic from "next/dynamic";

// Dynamically import the original listing-stay-detail page component to prevent hydration errors
const OriginalListingStayDetailPage = dynamic(
  () => import("@/app/(listing-detail)/listing-stay-detail/page"),
  { ssr: false }
);

export interface PageProps {
  params: { locale: string };
}

const ListingStayDetailPage: FC<PageProps> = ({ params }) => {
  return <OriginalListingStayDetailPage />;
};

export default ListingStayDetailPage; 