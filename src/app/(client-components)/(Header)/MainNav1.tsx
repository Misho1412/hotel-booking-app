"use client";

import React, { FC, useState, useEffect } from "react";
import Logo from "@/shared/Logo";
import Navigation from "@/shared/Navigation/Navigation";
import SearchDropdown from "./SearchDropdown";
import ButtonPrimary from "@/shared/ButtonPrimary";
import MenuBar from "@/shared/MenuBar";
import HeroSearchForm2MobileFactory from "../(HeroSearchForm2Mobile)/HeroSearchForm2MobileFactory";
import LangDropdown from "./LangDropdown";
import useTranslation from "@/hooks/useTranslation";
import SwitchDarkMode from "@/shared/SwitchDarkMode";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { getLocalizedUrl } from "@/utils/getLocalizedUrl";
import { useParams } from "next/navigation";
import { Route } from "@/routers/types";

export interface MainNav1Props {
  className?: string;
}

const MainNav1: FC<MainNav1Props> = ({ className = "" }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const t = useTranslation('header');
  const [isMounted, setIsMounted] = useState(false);
  const params = useParams();
  const locale = params?.locale as string;
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className={`nc-MainNav1 relative z-10 ${className}`}>
      <div className="px-4 lg:container h-20 relative flex justify-between items-center">
        <div className="hidden md:flex justify-start flex-1 items-center space-x-6 sm:space-x-10">
          <Logo className="w-24" />
          <Navigation className="mx-4" />
        </div>

        <div className="flex lg:hidden flex-[3] max-w-lg !mx-auto md:px-3">
          <div className="self-center flex-1">
            <HeroSearchForm2MobileFactory />
          </div>
        </div>

        <div className="hidden md:flex flex-shrink-0 justify-end items-center flex-1 lg:flex-none text-neutral-700 dark:text-neutral-100">
          <div className="hidden xl:flex items-center space-x-2">
            <SearchDropdown className="flex items-center" />
            <LangDropdown className="flex items-center mx-2" />
            <SwitchDarkMode className="mx-2" />
            
            {isMounted && isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link 
                  href="/profile" 
                  className="inline-flex items-center text-sm text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100"
                >
                  <UserCircleIcon className="h-6 w-6 mr-1" />
                  {user?.firstName || user?.username || 'Profile'}
                </Link>
                <button 
                  onClick={() => logout()}
                  className="text-sm text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100"
                >
                  {t('logout') || 'Logout'}
                </button>
              </div>
            ) : (
                <ButtonPrimary href={getLocalizedUrl("/login", locale) as Route<string>}>
                {t('login') || 'Login'}
              </ButtonPrimary>
            )}
          </div>

          <div className="flex xl:hidden items-center space-x-2">
            <LangDropdown className="flex items-center" />
            <SwitchDarkMode className="mx-2" />
            <MenuBar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainNav1;
