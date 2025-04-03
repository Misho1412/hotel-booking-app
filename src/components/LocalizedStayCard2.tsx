"use client";

import React, { FC, useEffect, useState } from "react";
import StayCard2, { StayCard2Props } from "./StayCard2";
import { getLocalizedUrl } from "@/utils/getLocalizedUrl";
import { useParams } from "next/navigation";

export interface LocalizedStayCard2Props extends StayCard2Props {
  locale?: string;
}

const LocalizedStayCard2: FC<LocalizedStayCard2Props> = ({ 
  data, 
  className, 
  size,
  locale: propLocale 
}) => {
  const params = useParams();
  const [mounted, setMounted] = useState(false);
  
  // Get locale from props or from URL params
  const locale = propLocale || (params?.locale as string);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // If not mounted yet (server-side), return original component
  if (!mounted) {
    return <StayCard2 data={data} className={className} size={size} />;
  }
  
  // Create a copy of the data with localized href
  const localizedData = data ? {
    ...data,
    href: getLocalizedUrl(data.href, locale)
  } : undefined;
  
  return <StayCard2 data={localizedData} className={className} size={size} />;
};

export default LocalizedStayCard2; 