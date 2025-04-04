"use client";

import { FC } from "react";
import dynamic from "next/dynamic";

// Dynamically import the original listing-stay page component to prevent hydration errors
const OriginalListingStayPage = dynamic(
  () => import("@/app/(stay-listings)/listing-stay/page"),
  { ssr: false }
);

export interface PageProps {
  params: { locale: string };
}

const ListingStayPage: FC<PageProps> = ({ params }) => {
  return <OriginalListingStayPage />;
};

export default ListingStayPage; 