import React, { FC, useState, useEffect } from "react";
import Logo from "@/shared/Logo";
import Navigation from "@/shared/Navigation";
import SearchDropdown from "./SearchDropdown";
import ButtonPrimary from "@/shared/ButtonPrimary";
import MenuBar from "@/shared/MenuBar";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Avatar from "@/shared/Avatar";
import { Popover, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { useRouter } from "next/navigation";

export interface MainNavProps {
  className?: string;
}

const MainNav: FC<MainNavProps> = ({ className = "" }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className={`nc-MainNav relative z-10 ${className}`}>
      <div className="container py-5 relative flex justify-between items-center space-x-4 xl:space-x-8">
        <div className="flex justify-start flex-grow items-center space-x-4 sm:space-x-10 2xl:space-x-14">
          <Logo />
          <Navigation />
        </div>
        <div className="flex-shrink-0 flex items-center justify-end text-neutral-700 dark:text-neutral-100 space-x-1">
          <div className="hidden items-center xl:flex space-x-1">
            <SearchDropdown />
            <div className="px-1" />
            <Link 
              href="/hotels"
              className="text-opacity-90 group px-4 py-2 border border-neutral-200 hover:border-neutral-300 dark:border-neutral-700 rounded-full inline-flex items-center text-sm text-gray-700 dark:text-neutral-300 dark:hover:text-white font-medium hover:text-opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
            >
              <span>All Hotels</span>
            </Link>
            <div className="px-1" />
            <Link 
              href="/hotels/search"
              className="text-opacity-90 group px-4 py-2 border border-neutral-200 hover:border-neutral-300 dark:border-neutral-700 rounded-full inline-flex items-center text-sm text-gray-700 dark:text-neutral-300 dark:hover:text-white font-medium hover:text-opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
            >
              <span>Search Hotels</span>
            </Link>
            <div className="px-1" />
            
            {mounted && isAuthenticated ? (
              <Popover className="relative">
                {({ open }) => (
                  <>
                    <Popover.Button className="flex items-center focus:outline-none">
                      <Avatar
                        imgUrl=""
                        userName={user?.username || "User"}
                        sizeClass="w-8 h-8 sm:w-9 sm:h-9"
                      />
                    </Popover.Button>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="opacity-0 translate-y-1"
                      enterTo="opacity-100 translate-y-0"
                      leave="transition ease-in duration-150"
                      leaveFrom="opacity-100 translate-y-0"
                      leaveTo="opacity-0 translate-y-1"
                    >
                      <Popover.Panel className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-neutral-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <Link 
                          href="/profile" 
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-neutral-200 hover:bg-gray-100 dark:hover:bg-neutral-700"
                        >
                          Profile
                        </Link>
                        <Link 
                          href="/bookings" 
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-neutral-200 hover:bg-gray-100 dark:hover:bg-neutral-700"
                        >
                          My Bookings
                        </Link>
                        <button 
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-neutral-200 hover:bg-gray-100 dark:hover:bg-neutral-700"
                        >
                          Sign out
                        </button>
                      </Popover.Panel>
                    </Transition>
                  </>
                )}
              </Popover>
            ) : (
              <ButtonPrimary href="/login">
                <span>Sign In</span>
              </ButtonPrimary>
            )}
          </div>
          
          <div className="flex items-center space-x-1.5 xl:hidden">
            {mounted && isAuthenticated ? (
              <Popover className="relative">
                {({ open }) => (
                  <>
                    <Popover.Button className="flex items-center focus:outline-none">
                      <Avatar
                        imgUrl=""
                        userName={user?.username || "User"}
                        sizeClass="w-8 h-8"
                      />
                    </Popover.Button>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="opacity-0 translate-y-1"
                      enterTo="opacity-100 translate-y-0"
                      leave="transition ease-in duration-150"
                      leaveFrom="opacity-100 translate-y-0"
                      leaveTo="opacity-0 translate-y-1"
                    >
                      <Popover.Panel className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-neutral-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <Link 
                          href="/profile" 
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-neutral-200 hover:bg-gray-100 dark:hover:bg-neutral-700"
                        >
                          Profile
                        </Link>
                        <Link 
                          href="/bookings" 
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-neutral-200 hover:bg-gray-100 dark:hover:bg-neutral-700"
                        >
                          My Bookings
                        </Link>
                        <button 
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-neutral-200 hover:bg-gray-100 dark:hover:bg-neutral-700"
                        >
                          Sign out
                        </button>
                      </Popover.Panel>
                    </Transition>
                  </>
                )}
              </Popover>
            ) : (
              <ButtonPrimary href="/login">
                <span>Sign In</span>
              </ButtonPrimary>
            )}
            <MenuBar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainNav; 