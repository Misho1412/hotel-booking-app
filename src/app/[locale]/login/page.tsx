"use client";

import { FC } from "react";
import dynamic from "next/dynamic";

// Dynamically import the original login page component to prevent hydration errors
const OriginalLoginPage = dynamic(() => import("@/app/login/page"), {
  ssr: false,
});

export interface PageProps {
  params: { locale: string };
}

const LoginPage: FC<PageProps> = ({ params }) => {
  return <OriginalLoginPage />;
};

export default LoginPage; 