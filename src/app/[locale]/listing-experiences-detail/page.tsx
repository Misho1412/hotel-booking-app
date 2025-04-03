"use client";

import { FC } from "react";
import dynamic from "next/dynamic";

// Dynamically import the original listing-experiences-detail page component to prevent hydration errors
const OriginalListingExperiencesDetailPage = dynamic(
  () => import("@/app/(listing-detail)/listing-experiences-detail/page"),
  { ssr: false }
);

export interface PageProps {
  params: { locale: string };
}

const ListingExperiencesDetailPage: FC<PageProps> = ({ params }) => {
  return <OriginalListingExperiencesDetailPage />;
};

export default ListingExperiencesDetailPage; 