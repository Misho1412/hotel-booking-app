"use client";

import React, { FC, useState, useEffect } from "react";
import rightImgDemo from "@/images/BecomeAnAuthorImg.png";
import ButtonPrimary from "@/shared/ButtonPrimary";
import Logo from "@/shared/Logo";
import Image from "next/image";
import useTranslation from "@/hooks/useTranslation";

export interface SectionBecomeAnAuthorProps {
  className?: string;
  rightImg?: string;
}

const SectionBecomeAnAuthor: FC<SectionBecomeAnAuthorProps> = ({
  className = "",
  rightImg = rightImgDemo,
}) => {
  const [mounted, setMounted] = useState(false);
  const t = useTranslation('home');

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className={`nc-SectionBecomeAnAuthor relative flex flex-col lg:flex-row items-center  ${className}`}
      data-nc-id="SectionBecomeAnAuthor"
    >
      <div className="flex-shrink-0 mb-16 lg:mb-0 lg:mr-10 lg:w-2/5">
        <Logo className="w-20" />
        <h2 className="font-semibold text-3xl sm:text-4xl mt-6 sm:mt-11">
          {t('whyChooseUs.title')}
        </h2>
        <span className="block mt-6 text-neutral-500 dark:text-neutral-400">
          {t('whyChooseUs.description')}
        </span>
        <ButtonPrimary className="mt-6 sm:mt-11">
          {t('whyChooseUs.becomeAuthor')}
        </ButtonPrimary>
      </div>
      <div className="flex-grow">
        <Image alt="" src={rightImg} />
      </div>
    </div>
  );
};

export default SectionBecomeAnAuthor;
