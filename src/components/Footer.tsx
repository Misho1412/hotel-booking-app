"use client";

import Logo from "@/shared/Logo";
import SocialsList1 from "@/shared/SocialsList1";
import { CustomLink } from "@/data/types";
import React, { useEffect, useState } from "react";
import useTranslation from "@/hooks/useTranslation";

export interface WidgetFooterMenu {
  id: string;
  title: string;
  menus: CustomLink[];
}

const Footer: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const t = useTranslation('footer');
  
  // Only render with translations once mounted on client side
  if (!mounted) {
    return (
      <div className="nc-Footer relative py-24 lg:py-28 border-t border-neutral-200 dark:border-neutral-700">
        <div className="container">Loading...</div>
      </div>
    );
  }
  
  const widgetMenus: WidgetFooterMenu[] = [
    {
      id: "5",
      title: t('gettingStarted'),
      menus: [
        { href: "#", label: t('installation') },
        { href: "#", label: t('releaseNotes') },
        { href: "#", label: t('upgradeGuide') },
        { href: "#", label: t('browserSupport') },
        { href: "#", label: t('editorSupport') },
      ],
    },
    {
      id: "1",
      title: t('about'),
      menus: [
        { href: "#", label: t('designFeatures') },
        { href: "#", label: t('prototyping') },
        { href: "#", label: t('designSystems') },
        { href: "#", label: t('pricing') },
        { href: "#", label: t('security') },
      ],
    },
    {
      id: "2",
      title: t('resources'),
      menus: [
        { href: "#", label: t('bestPractices') },
        { href: "#", label: t('support') },
        { href: "#", label: t('developers') },
        { href: "#", label: t('learnDesign') },
        { href: "#", label: t('releases') },
      ],
    },
    {
      id: "4",
      title: t('contact'),
      menus: [
        { href: "#", label: t('discussionForums') },
        { href: "#", label: t('codeOfConduct') },
        { href: "#", label: t('communityResources') },
        { href: "#", label: t('terms') },
        { href: "#", label: t('privacy') },
      ],
    },
  ];

  const renderWidgetMenuItem = (menu: WidgetFooterMenu, index: number) => {
    return (
      <div key={index} className="text-sm">
        <h2 className="font-semibold text-neutral-700 dark:text-neutral-200">
          {menu.title}
        </h2>
        <ul className="mt-5 space-y-4">
          {menu.menus.map((item, index) => (
            <li key={index}>
              <a
                key={index}
                className="text-neutral-6000 dark:text-neutral-300 hover:text-black dark:hover:text-white"
                href={item.href}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="nc-Footer relative py-24 lg:py-28 border-t border-neutral-200 dark:border-neutral-700">
      <div className="container grid grid-cols-2 gap-y-10 gap-x-5 sm:gap-x-8 md:grid-cols-4 lg:grid-cols-5 lg:gap-x-10 ">
        <div className="grid grid-cols-4 gap-5 col-span-2 md:col-span-4 lg:md:col-span-1 lg:flex lg:flex-col">
          <div className="col-span-2 md:col-span-1">
            <Logo />
          </div>
          <div className="col-span-2 flex items-center md:col-span-3">
            <SocialsList1 className="flex items-center space-x-3 lg:space-x-0 lg:flex-col lg:space-y-2.5 lg:items-start" />
          </div>
        </div>
        {widgetMenus.map(renderWidgetMenuItem)}
      </div>
      <div className="container mt-10 text-sm text-center text-neutral-500">
        {t('copyright')}
      </div>
    </div>
  );
};

export default Footer;
