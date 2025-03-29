"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import "@/fonts/line-awesome-1.3.0/css/line-awesome.css";
import "@/styles/index.scss";
import "rc-slider/assets/index.css";

const ClientCommons = () => {
  const pathname = usePathname();

  useEffect(() => {
    // Close search modal when route change
    document.querySelector("body")?.classList.remove("overflow-hidden");
    document.querySelector("html")?.classList.remove("overflow-hidden");
  }, [pathname]);

  return null;
};

export default ClientCommons; 