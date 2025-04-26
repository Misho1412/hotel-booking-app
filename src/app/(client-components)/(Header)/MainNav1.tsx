"use client";

import React, { FC, useState, useEffect } from "react";
import Navigation from "@/shared/Navigation/Navigation";
import SwitchDarkMode from "@/shared/SwitchDarkMode";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { getLocalizedUrl } from "@/utils/getLocalizedUrl";
import { useParams } from "next/navigation";
import { Route } from "@/routers/types";
import LangDropdown from "./LangDropdown";

export interface MainNav1Props {
  className?: string;
}

const MainNav1: FC<MainNav1Props> = ({ className = "" }) => {
  const { user, isAuthenticated } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const params = useParams();
  const locale = params?.locale as string;
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className={`nc-MainNav1 relative z-10 ${className}`}>
      <div className="mx-auto max-w-7xl px-4 h-16 md:h-20 flex justify-between items-center">
        {/* Logo */}
        <div className="flex-shrink-0 flex items-center">
          <Link href="/" className="inline-block">
            <div className="flex items-center">
              <h1 className="text-3xl font-normal text-neutral-900 dark:text-white">Pixel.</h1>
              <span className="text-xl text-neutral-900 dark:text-white mt-2 ml-1">com</span>
            </div>
          </Link>
        </div>
        
        {/* Main Navigation - Center */}
        <div className="hidden lg:flex justify-center">
          <Navigation />
        </div>

        {/* Right Side Elements */}
        <div className="flex items-center space-x-3">
          {/* Dark Mode Toggle */}
          <SwitchDarkMode />
          
          {/* Language Dropdown */}
          <LangDropdown />
          
          {/* Authentication Button/Link */}
          {isMounted && isAuthenticated ? (
            <Link 
              href={getLocalizedUrl("/profile", locale) as Route<string>}
              className="flex items-center text-sm text-neutral-800 dark:text-white hover:text-neutral-600 dark:hover:text-neutral-300"
            >
              <UserCircleIcon className="h-6 w-6 mr-1" />
              <span>{user?.firstName || user?.username || 'Profile'}</span>
            </Link>
          ) : (
            <Link 
              href={getLocalizedUrl("/login", locale) as Route<string>}
              className="px-4 py-2 text-sm text-neutral-800 dark:text-white hover:text-neutral-600 dark:hover:text-neutral-300"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainNav1;
