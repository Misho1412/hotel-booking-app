"use client";

import React, { FC, useState, useEffect } from "react";
import HIW1img from "@/images/HIW1.png";
import HIW2img from "@/images/HIW2.png";
import HIW3img from "@/images/HIW3.png";
import VectorImg from "@/images/VectorHIW.svg";
import Image, { StaticImageData } from "next/image";
import Heading from "@/shared/Heading";
import useTranslation from "@/hooks/useTranslation";

export interface SectionHowItWorkProps {
  className?: string;
  data?: {
    id: number;
    title: string;
    desc: string;
    img: StaticImageData;
    imgDark?: StaticImageData;
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
      img: HIW1img,
      title: t('howItWorks.bookAndRelax.title'),
      desc: t('howItWorks.bookAndRelax.description'),
    },
    {
      id: 2,
      img: HIW2img,
      title: t('howItWorks.smartChecklist.title'),
      desc: t('howItWorks.smartChecklist.description'),
    },
    {
      id: 3,
      img: HIW3img,
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
      <Heading isCenter desc={t('howItWorks.subtitle')}>
        {t('howItWorks.title')}
      </Heading>
      <div className="mt-20 relative grid md:grid-cols-3 gap-20">
        <Image
          className="hidden md:block absolute inset-x-0 top-10"
          src={VectorImg}
          alt=""
          data-aos="fade-up"
          data-aos-delay="300"
        />
        {dataToUse.map((item, index) => (
          <div
            key={item.id}
            className="relative flex flex-col items-center max-w-xs mx-auto"
            data-aos="fade-up"
            data-aos-delay={400 + index * 100}
            data-aos-duration="800"
          >
            {item.imgDark ? (
              <>
                <Image
                  className="dark:hidden block mb-8 max-w-[180px] mx-auto"
                  src={item.img}
                  alt=""
                  data-aos="zoom-in"
                  data-aos-delay={500 + index * 100}
                />
                <Image
                  alt=""
                  className="hidden dark:block mb-8 max-w-[180px] mx-auto"
                  src={item.imgDark}
                  data-aos="zoom-in"
                  data-aos-delay={500 + index * 100}
                />
              </>
            ) : (
              <Image
                alt=""
                className="mb-8 max-w-[180px] mx-auto"
                src={item.img}
                data-aos="zoom-in"
                data-aos-delay={500 + index * 100}
              />
            )}
            <div className="text-center mt-auto">
              <h3 
                className="text-xl font-semibold"
                data-aos="fade-up"
                data-aos-delay={600 + index * 100}
              >
                {item.title}
              </h3>
              <span 
                className="block mt-5 text-neutral-500 dark:text-neutral-400"
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
