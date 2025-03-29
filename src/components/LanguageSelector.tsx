"use client";

import React, { FC } from "react";
import { usePathname, useRouter } from "next/navigation";
import useTranslation from "@/hooks/useTranslation";
import { GlobeAltIcon } from "@heroicons/react/24/outline";

// Function to determine the current locale from pathname
function getCurrentLocale(pathname: string): string {
  if (pathname.startsWith('/ar')) {
    return 'ar';
  }
  return 'en';
}

interface LanguageSelectorProps {
  className?: string;
}

const LanguageSelector: FC<LanguageSelectorProps> = ({
  className = "",
}) => {
  const pathname = usePathname();
  const locale = getCurrentLocale(pathname);
  const router = useRouter();
  const t = useTranslation('header');

  // Available languages
  const languages = [
    { id: "en", name: "English", nativeName: "English" },
    { id: "ar", name: "Arabic", nativeName: "العربية" },
  ];

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = e.target.value;
    // Navigate to the same page but with the new locale
    const newPathname = pathname.replace(/^\/[^\/]+/, `/${newLocale}`);
    router.push(newPathname);
  };

  return (
    <div className={`inline-flex items-center ${className}`}>
      <GlobeAltIcon className="w-5 h-5 mr-2" />
      <select
        value={locale}
        onChange={handleLanguageChange}
        className="bg-transparent border-none focus:outline-none text-sm font-medium"
        aria-label={t('language')}
      >
        {languages.map((lang) => (
          <option key={lang.id} value={lang.id}>
            {lang.nativeName}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;