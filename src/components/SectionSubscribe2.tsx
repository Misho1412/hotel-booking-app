"use client";

import React, { FC, useState, useEffect } from "react";
import ButtonCircle from "@/shared/ButtonCircle";
import rightImg from "@/images/SVG-subcribe2.png";
import Badge from "@/shared/Badge";
import Input from "@/shared/Input";
import Image from "next/image";
import useTranslation from "@/hooks/useTranslation";

export interface SectionSubscribe2Props {
  className?: string;
}

const SectionSubscribe2: FC<SectionSubscribe2Props> = ({ className = "" }) => {
  const [mounted, setMounted] = useState(false);
  const t = useTranslation('home');

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className={`nc-SectionSubscribe2 relative flex flex-col lg:flex-row lg:items-center ${className}`}
      data-nc-id="SectionSubscribe2"
      data-aos="fade-up"
      data-aos-duration="1000"
    >
      <div 
        className="flex-shrink-0 mb-10 lg:mb-0 lg:mr-10 lg:w-2/5"
        data-aos="fade-right"
        data-aos-delay="200"
      >
        <h2 
          className="font-semibold text-4xl"
          data-aos="fade-up"
          data-aos-delay="300"
        >
          {t('newsletter.title')}
        </h2>
        <span 
          className="block mt-5 text-neutral-500 dark:text-neutral-400"
          data-aos="fade-up"
          data-aos-delay="400"
        >
          {t('newsletter.subtitle')}
        </span>
        <ul className="space-y-4 mt-10">
          <li 
            className="flex items-center space-x-4"
            data-aos="fade-up"
            data-aos-delay="500"
          >
            <Badge name="01" />
            <span className="font-medium text-neutral-700 dark:text-neutral-300">
              {t('newsletter.discount')}
            </span>
          </li>
          <li 
            className="flex items-center space-x-4"
            data-aos="fade-up"
            data-aos-delay="600"
          >
            <Badge color="red" name="02" />
            <span className="font-medium text-neutral-700 dark:text-neutral-300">
              {t('newsletter.premium')}
            </span>
          </li>
        </ul>
        <form 
          className="mt-10 relative max-w-sm"
          data-aos="fade-up"
          data-aos-delay="700"
        >
          <Input
            required
            aria-required
            placeholder={t('newsletter.emailPlaceholder')}
            type="email"
            rounded="rounded-full"
            sizeClass="h-12 px-5 py-3"
          />
          <ButtonCircle
            type="submit"
            className="absolute transform top-1/2 -translate-y-1/2 right-1.5"
            size="w-10 h-10"
          >
            <i className="las la-arrow-right text-xl"></i>
          </ButtonCircle>
        </form>
      </div>
      <div 
        className="flex-grow"
        data-aos="fade-left"
        data-aos-delay="500"
        data-aos-duration="1000"
      >
        <Image alt="" src={rightImg} />
      </div>
    </div>
  );
};

export default SectionSubscribe2;
