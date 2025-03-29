"use client";

import React, { FC, Fragment, useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import SectionSubscribe2 from "@/components/SectionSubscribe2";
import SocialsList from "@/shared/SocialsList";
import Label from "@/components/Label";
import Input from "@/shared/Input";
import Textarea from "@/shared/Textarea";
import ButtonPrimary from "@/shared/ButtonPrimary";
import BackgroundSection from "@/components/BackgroundSection";
import SectionClientSay from "@/components/SectionClientSay";
import useTranslation from "@/hooks/useTranslation";

export interface PageContactProps {
  params: { locale: string };
}

const PageContact: FC<PageContactProps> = ({ params }) => {
  const [isMounted, setIsMounted] = useState(false);
  const t = useTranslation('header');
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // If not mounted yet, show a loading state
  if (!isMounted) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse bg-gray-200 h-40 w-40 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className={`nc-PageContact overflow-hidden`}>
      <Helmet>
        <title>Contact || Booking React Template</title>
      </Helmet>
      <div className="mb-24 lg:mb-32">
        <div className="container py-16 lg:py-28 space-y-16 lg:space-y-28">
          <div data-aos="fade-up" data-aos-duration="1000">
            <h2 className="font-semibold text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
              {t('contact')}
            </h2>
            <span className="block mt-3 mb-10 text-neutral-500 dark:text-neutral-400 md:px-0 text-sm sm:text-base">
              Drop us message and we will get back for you.
            </span>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">
            <div data-aos="fade-right" data-aos-duration="1000" data-aos-delay="200">
              <form className="grid grid-cols-1 gap-6" action="#" method="post">
                <Label>
                  <span className="text-neutral-800 dark:text-neutral-200">
                    Full name
                  </span>
                  <Input
                    type="text"
                    placeholder="Example Doe"
                    className="mt-1"
                  />
                </Label>
                <Label>
                  <span className="text-neutral-800 dark:text-neutral-200">
                    Email address
                  </span>
                  <Input
                    type="email"
                    placeholder="example@example.com"
                    className="mt-1"
                  />
                </Label>
                <Label>
                  <span className="text-neutral-800 dark:text-neutral-200">
                    Message
                  </span>
                  <Textarea className="mt-1" rows={6} />
                </Label>
                <ButtonPrimary type="submit">Send Message</ButtonPrimary>
              </form>
            </div>
            
            <div data-aos="fade-left" data-aos-duration="1000" data-aos-delay="400">
              <div className="max-w-sm space-y-6">
                <div>
                  <h3 className="uppercase font-semibold text-sm dark:text-neutral-200 tracking-wider">
                    🗺 ADDRESS
                  </h3>
                  <span className="block mt-2 text-neutral-500 dark:text-neutral-400">
                    Photo booth tattooed prism, portland taiyaki hoodie neutra
                    typewriter
                  </span>
                </div>
                <div>
                  <h3 className="uppercase font-semibold text-sm dark:text-neutral-200 tracking-wider">
                    💌 EMAIL
                  </h3>
                  <span className="block mt-2 text-neutral-500 dark:text-neutral-400">
                    example@example.com
                  </span>
                </div>
                <div>
                  <h3 className="uppercase font-semibold text-sm dark:text-neutral-200 tracking-wider">
                    ☎ PHONE
                  </h3>
                  <span className="block mt-2 text-neutral-500 dark:text-neutral-400">
                    000-123-456-7890
                  </span>
                </div>
                <div>
                  <h3 className="uppercase font-semibold text-sm dark:text-neutral-200 tracking-wider">
                    🌏 SOCIALS
                  </h3>
                  <SocialsList className="mt-2" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative py-16" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="300">
          <BackgroundSection />
          <SectionClientSay />
        </div>

        <div className="container" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="400">
          <SectionSubscribe2 className="py-24 lg:py-32" />
        </div>
      </div>
    </div>
  );
};

export default PageContact; 