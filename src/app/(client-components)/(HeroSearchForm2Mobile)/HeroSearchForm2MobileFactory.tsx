"use client";

import React, { FC } from "react";
import { PathName } from "@/routers/types";
import { usePathname } from "next/navigation";
import HeroSearchForm2Mobile from "./HeroSearchForm2Mobile";
import HeroSearchForm2RealEstateMobile from "./HeroSearchForm2RealEstateMobile";

const PAGES_REAL_ESTATE = [
  "/home-2" as PathName,
  "/listing-real-estate" as PathName,
  "/listing-real-estate-map" as PathName,
];

const PAGES_CAR = [
  "/listing-car" as PathName,
  "/listing-car-map" as PathName,
];

const PAGES_EXPERIENCES = [
  "/listing-experiences" as PathName,
  "/listing-experiences-map" as PathName,
  "/listing-experiences-detail" as PathName,
];

export interface HeroSearchForm2MobileFactoryProps { }

const HeroSearchForm2MobileFactory: FC<HeroSearchForm2MobileFactoryProps> = () => {
  const pathname = usePathname() as PathName;

  if (PAGES_REAL_ESTATE.includes(pathname)) {
    return <HeroSearchForm2RealEstateMobile />;
  }

  return <HeroSearchForm2Mobile />;
};

export default HeroSearchForm2MobileFactory;
