"use client";

import { FC } from "react";
import dynamic from "next/dynamic";

// Dynamically import the original signup page component to prevent hydration errors
const OriginalSignupPage = dynamic(() => import("@/app/signup/page"), {
  ssr: false,
});

export interface PageProps {
  params: { locale: string };
}

const SignupPage: FC<PageProps> = ({ params }) => {
  return <OriginalSignupPage />;
};

export default SignupPage; 