'use client';

import React, { FC } from "react";
import Heading from "@/shared/Heading";
import useTranslation from "@/hooks/useTranslation";
import { usePathname } from "next/navigation";

export interface Statistic {
  id: string;
  heading: string;
  subHeading: string;
}

const FOUNDER_DEMO: Statistic[] = [
  {
    id: "1",
    heading: "10 million",
    subHeading:
      "Articles have been public around the world (as of Sept. 30, 2021)",
  },
  {
    id: "2",
    heading: "100,000",
    subHeading: "Registered users account (as of Sept. 30, 2021)",
  },
  {
    id: "3",
    heading: "220+",
    subHeading:
      "Countries and regions have our presence (as of Sept. 30, 2021)",
  },
];

export interface SectionStatisticProps {
  className?: string;
}

const SectionStatistic: FC<SectionStatisticProps> = ({ className = "" }) => {
  const t = useTranslation('about');
  const pathname = usePathname();
  const isArabic = pathname?.startsWith('/ar');
  
  // Get translated stats data
  const getTranslatedStats = () => {
    if (!isArabic) return FOUNDER_DEMO;
    
    return t('statistics.stats')
      ? FOUNDER_DEMO.map((stat, index) => ({
          ...stat,
          heading: t(`statistics.stats.${index}.heading`) || stat.heading,
          subHeading: t(`statistics.stats.${index}.subHeading`) || stat.subHeading,
        }))
      : FOUNDER_DEMO;
  };
  
  const translatedStats = getTranslatedStats();

  return (
    <div className={`nc-SectionStatistic relative ${className}`}>
      <Heading
        desc={t('statistics.desc')}
      >
        {t('statistics.title')}
      </Heading>
      <div className="grid md:grid-cols-2 gap-6 lg:grid-cols-3 xl:gap-8">
        {translatedStats.map((item) => (
          <div
            key={item.id}
            className="p-6 bg-neutral-50 dark:bg-neutral-800 rounded-2xl dark:border-neutral-800"
          >
            <h3 className="text-2xl font-semibold leading-none text-neutral-900 md:text-3xl dark:text-neutral-200">
              {item.heading}
            </h3>
            <span className="block text-sm text-neutral-500 mt-3 sm:text-base dark:text-neutral-400">
              {item.subHeading}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SectionStatistic;
