"use client";

import React from "react";
import { useParams } from "next/navigation";

export default function Page() {
  const params = useParams();

  return (
    <div className="container py-16">
      <h2 className="text-3xl font-semibold mb-8">Car Rental Details</h2>
      <p className="text-lg text-neutral-600">
        This page is currently being localized for {params.locale}.
        Please check back later for car rental details in your language.
      </p>
    </div>
  );
} 