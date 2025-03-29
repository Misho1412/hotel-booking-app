"use client";

import { FC, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import useTranslation from "@/hooks/useTranslation";
import MenuBar from "@/shared/MenuBar";
import { Listbox } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { GlobeAltIcon } from "@heroicons/react/24/solid";

// Function to determine the current locale from pathname
function getCurrentLocale(pathname: string): string {
  if (pathname.startsWith('/ar')) {
    return 'ar';
  }
  return 'en';
}

export interface LangDropdownProps {
  panelClassName?: string;
  className?: string;
}

const LangDropdown: FC<LangDropdownProps> = ({
  panelClassName = "",
  className = "",
}) => {
  const t = useTranslation('header');
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = getCurrentLocale(pathname);
  
  const languages = [
    { id: "en", name: "English", nativeName: "English" },
    { id: "ar", name: "Arabic", nativeName: "العربية" },
  ];

  const [selectedLang, setSelectedLang] = useState(
    languages.find((item) => item.id === currentLocale) || languages[0]
  );

  const handleLanguageChange = (lang: typeof languages[number]) => {
    setSelectedLang(lang);
    
    // Remove the locale prefix from the current pathname
    let newPathname = pathname;
    if (newPathname.startsWith('/en') || newPathname.startsWith('/ar')) {
      newPathname = newPathname.substring(3);
    }
    if (!newPathname) newPathname = '/';
    
    // Navigate to the new locale path
    router.push(`/${lang.id}${newPathname}`);
  };

  return (
    <div className={`LangDropdown relative ${className}`}>
      <Listbox value={selectedLang} onChange={handleLanguageChange}>
        <div className="relative inline-block text-left">
          <Listbox.Button className="inline-flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
            <div className="flex items-center">
              <GlobeAltIcon className="w-5 h-5 mr-1" />
              <span className="mx-1">{selectedLang.nativeName}</span>
            </div>
            <ChevronDownIcon className="w-4 h-4 ml-1" />
          </Listbox.Button>
          <Listbox.Options
            className={`absolute z-40 mt-1 min-w-[160px] rounded-lg bg-white dark:bg-neutral-800 shadow-lg ring-1 ring-black/5 dark:ring-white/10 ${panelClassName}`}
          >
            <div className="py-1 px-1">
              {languages.map((item) => (
                <Listbox.Option key={item.id} value={item}>
                  {({ active }) => (
                    <div
                      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                        active
                          ? "bg-gray-100 dark:bg-neutral-700 text-gray-900 dark:text-gray-100"
                          : ""
                      } ${
                        item.id === selectedLang.id
                          ? "bg-gray-100 dark:bg-neutral-700 text-gray-900 dark:text-gray-100"
                          : "text-gray-600 dark:text-gray-300"
                      }`}
                    >
                      {item.nativeName}
                    </div>
                  )}
                </Listbox.Option>
              ))}
            </div>
          </Listbox.Options>
        </div>
      </Listbox>
    </div>
  );
};

export default LangDropdown;
