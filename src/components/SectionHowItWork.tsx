"use client";

import React, { FC, useState, useEffect } from "react";
import Image, { StaticImageData } from "next/image";
import useTranslation from "@/hooks/useTranslation";

export interface SectionHowItWorkProps {
  className?: string;
  data?: {
    id: number;
    title: string;
    desc: string;
  }[];
}

const SectionHowItWork: FC<SectionHowItWorkProps> = ({
  className = "",
  data,
}) => {
  const [mounted, setMounted] = useState(false);
  const t = useTranslation('home');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Default data translated within component
  const defaultData = [
    {
      id: 1,

      title: t('howItWorks.bookAndRelax.title'),
      desc: t('howItWorks.bookAndRelax.description'),
    },
    {
      id: 2,

      title: t('howItWorks.smartChecklist.title'),
      desc: t('howItWorks.smartChecklist.description'),
    },
    {
      id: 3,
      title: t('howItWorks.saveMore.title'),
      desc: t('howItWorks.saveMore.description'),
    },
  ];

  const dataToUse = data || defaultData;

  return (
    <div
      className={`nc-SectionHowItWork ${className}`}
      data-nc-id="SectionHowItWork"
      data-aos="fade-up"
      data-aos-duration="1000"
    >

      <div className="mt-20 relative grid md:grid-cols-3 gap-20">
        {dataToUse.map((item, index) => (
          <div
            key={item.id}
            className="relative flex flex-col items-center max-w-xs mx-auto"
            data-aos="fade-up"
            data-aos-delay={400 + index * 100}
            data-aos-duration="800"
          >
           <div className="text-center -translate-y-10">
              <h3 
                className="text-xl font-semibold text-white" 
                data-aos="fade-up"
                data-aos-delay={600 + index * 100}
              >
                {item.title}
              </h3>
              <span 
                className="block mt-3 text-white" 
                data-aos="fade-up"
                data-aos-delay={700 + index * 100}
              >
                {item.desc}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SectionHowItWork;
