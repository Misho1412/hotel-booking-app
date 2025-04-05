"use client";

import React from "react";
import { useRouter } from "next/navigation";
import ButtonPrimary from "@/shared/ButtonPrimary";
import Link from "next/link";

export default function ReservationSuccessPage() {
    const router = useRouter();

    return (
        <div className="container mx-auto py-20">
            <div className="max-w-2xl mx-auto text-center">
                <div className="mb-8">
                    <svg
                        className="w-20 h-20 text-green-500 mx-auto"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                </div>
                <h1 className="text-3xl font-bold mb-4">Reservation Successful!</h1>
                <p className="text-gray-600 mb-8">
                    Your reservation has been confirmed. We've sent you a confirmation email with all the details.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <ButtonPrimary
                        onClick={() => router.push("/")}
                        className="w-full sm:w-auto"
                    >
                        Back to Home
                    </ButtonPrimary>
                    <Link href="/my-bookings" className="w-full sm:w-auto">
                        <ButtonPrimary className="w-full">View My Bookings</ButtonPrimary>
                    </Link>
                </div>
            </div>
        </div>
    );
} 