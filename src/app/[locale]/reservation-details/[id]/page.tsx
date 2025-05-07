"use client";

import React from "react";
import { useParams } from "next/navigation";
import ReservationDetail from "@/components/ReservationDetail";

export default function ReservationDetailsPage() {
  const params = useParams();
  const reservationId = params.id as string;
  const locale = params.locale as string;
  
  return (
    <div className="container relative pt-10 pb-20 lg:pt-20 lg:pb-28">
      <ReservationDetail reservationId={reservationId} locale={locale} />
    </div>
  );
} 