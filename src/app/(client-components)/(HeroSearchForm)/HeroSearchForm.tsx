"use client";

import React, { FC, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import useTranslation from "@/hooks/useTranslation";
import LocationIcon from "@/components/icons/LocationIcon";
import CalendarIcon from "@/components/icons/CalendarIcon";
import UsersIcon from "@/components/icons/UsersIcon";
import { Popover, Transition } from "@headlessui/react";
import DatePicker from "react-datepicker";
import DatePickerCustomHeaderTwoMonth from "@/components/DatePickerCustomHeaderTwoMonth";
import DatePickerCustomDay from "@/components/DatePickerCustomDay";
import NcInputNumber from "@/components/NcInputNumber";
import { Fragment } from "react";

export interface HeroSearchFormProps {
  className?: string;
}

const cities = [
  { name: "Makkah", label: "Makkah", arLabel: "مكة المكرمة" },
  { name: "Madinah", label: "Madinah", arLabel: "المدينة المنورة" }
];

export const HeroSearchForm: FC<HeroSearchFormProps> = ({ className = "" }) => {
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState(cities[0].name);
  const [isCheckInCalendarOpen, setIsCheckInCalendarOpen] = useState(false);
  const [isCheckOutCalendarOpen, setIsCheckOutCalendarOpen] = useState(false);
  const [isGuestSelectorOpen, setIsGuestSelectorOpen] = useState(false);
  
  // Set default dates to today and tomorrow
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  
  const [checkInDate, setCheckInDate] = useState<Date | null>(today);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(tomorrow);
  
  // Guest state
  const [guestAdults, setGuestAdults] = useState(2);
  const [guestChildren, setGuestChildren] = useState(0);
  const [guestInfants, setGuestInfants] = useState(0);
  
  const router = useRouter();
  const pathname = usePathname();
  const isArabic = pathname?.startsWith('/ar');
  const t = useTranslation('search');

  // Update check-out date if check-in date is after it
  useEffect(() => {
    if (checkInDate && checkOutDate && checkInDate > checkOutDate) {
      const newCheckOutDate = new Date(checkInDate);
      newCheckOutDate.setDate(checkInDate.getDate() + 1);
      setCheckOutDate(newCheckOutDate);
    }
  }, [checkInDate, checkOutDate]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    params.append('city', selectedCity);
    
    if (checkInDate) {
      params.append('checkIn', checkInDate.toISOString().split('T')[0]);
    }
    
    if (checkOutDate) {
      params.append('checkOut', checkOutDate.toISOString().split('T')[0]);
    }
    
    params.append('adults', guestAdults.toString());
    params.append('children', guestChildren.toString());
    
    router.push(`/listing-stay?${params.toString()}`);
  };

  // Format date for display
  const formatDate = (date: Date | null) => {
    if (!date) return "";
    
    if (isArabic) {
      // For Arabic, we'll manually format the date
      try {
        const day = date.getDate().toString().padStart(2, '0');
        const monthIndex = date.getMonth();
        const monthNames = [
          'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
          'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
        ];
        
        return `${day} ${monthNames[monthIndex]}`;
      } catch (error) {
        // Fallback to English format if translation fails
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit"
        });
      }
    } else {
      // Default English format
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit"
      });
    }
  };

  // Calculate total guests
  const totalGuests = guestAdults + guestChildren + guestInfants;

  return (
    <div
      className={`relative w-full max-w-[900px] ${className}`}
      data-nc-id="HeroSearchForm"
    >
      {/* Main container with adjusted size */}
      <div className="bg-[#1C1C1C]/61 backdrop-blur-[4px] rounded-[20px] h-[90px] relative">
        <div className="flex flex-row items-center h-full pl-5 pr-2 gap-3 justify-start">
          {/* Location selector */}
          <div className="relative flex-shrink-0 w-[300px]">
            <div 
              className="flex items-center bg-[#252525] rounded-xl px-3 py-3 cursor-pointer shadow-[inset_-2px_4px_4px_rgba(0,0,0,0.25),inset_2px_0px_4px_rgba(0,0,0,0.25)] h-[55px]"
              onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
            >
              <LocationIcon className="w-6 h-6 text-[#CCCCCC] flex-shrink-0" />
              <div className="ml-3">
                <span className="block text-[#CCCCCC] text-base font-medium">
                  {isArabic 
                    ? cities.find(c => c.name === selectedCity)?.arLabel 
                    : cities.find(c => c.name === selectedCity)?.label}
                </span>
              </div>
            </div>
            
            {/* Location dropdown */}
            {isLocationDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-full bg-[#252525] rounded-lg shadow-lg z-50 border border-[#333333] overflow-hidden">
                {cities.map((city) => (
                  <div 
                    key={city.name}
                    className={`px-3 py-2 hover:bg-[#333333] cursor-pointer transition-colors ${selectedCity === city.name ? 'bg-[#333333]' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCity(city.name);
                      setIsLocationDropdownOpen(false);
                    }}
                  >
                    <div className="flex items-center">
                      <LocationIcon className="w-5 h-5 text-[#CCCCCC] mr-2" />
                      <span className="text-[#CCCCCC] text-sm">{isArabic ? city.arLabel : city.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Check-in selector - Implemented as a Popover */}
          <div className="relative flex-shrink-0 w-[110px]">
            <Popover className="relative ">
              {({ open, close }) => (
                <>
                  <Popover.Button
                    className="flex items-center bg-[#252525] rounded-xl px-3 py-3 cursor-pointer shadow-[inset_-2px_4px_4px_rgba(0,0,0,0.25),inset_2px_0px_4px_rgba(0,0,0,0.25)] h-[55px] w-full"
                    onClick={() => setIsCheckInCalendarOpen(true)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex flex-col items-start">
                        <span className="block text-[#CCCCCC] text-sm font-medium">
                          {t('checkIn')}
                        </span>
                        <span className="block text-[#CCCCCC] text-xs">
                          {formatDate(checkInDate)}
                        </span>
                      </div>
                    </div>
                  </Popover.Button>

                  <Transition
                    as={Fragment}
                    show={open}
                    enter="transition ease-out duration-200"
                    enterFrom="opacity-0 translate-y-1"
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-in duration-150"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo="opacity-0 translate-y-1"
                  >
                    <Popover.Panel className="absolute left-0 z-50 mt-2 bg-white rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 w-[510px]">
                      <div className="p-5">
                        <div className="text-sm font-medium text-[#252525] dark:text-white">
                          {t('checkIn')}
                        </div>
                      </div>

                      <div className="p-5">
                        <DatePicker
                          selected={checkInDate}
                          onChange={(date) => {
                            setCheckInDate(date);
                            close();
                          }}
                          minDate={new Date()}
                          inline
                          showPopperArrow={false}
                          monthsShown={1}
                          renderCustomHeader={(p) => (
                            <DatePickerCustomHeaderTwoMonth {...p} />
                          )}
                          renderDayContents={(day, date) => (
                            <DatePickerCustomDay dayOfMonth={day} date={date} />
                          )}
                        />
                      </div>
                    </Popover.Panel>
                  </Transition>
                </>
              )}
            </Popover>
          </div>

          {/* Check-out selector - Implemented as a Popover */}
          <div className="relative flex-shrink-0 w-[110px]">
            <Popover className="relative">
              {({ open, close }) => (
                <>
                  <Popover.Button
                    className="flex items-center bg-[#252525] rounded-xl px-3 py-3 cursor-pointer shadow-[inset_-2px_4px_4px_rgba(0,0,0,0.25),inset_2px_0px_4px_rgba(0,0,0,0.25)] h-[55px] w-full"
                    onClick={() => setIsCheckOutCalendarOpen(true)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex flex-col items-start">
                        <span className="block text-[#CCCCCC] text-sm font-medium">
                          {t('checkOut')}
                        </span>
                        <span className="block text-[#CCCCCC] text-xs">
                          {formatDate(checkOutDate)}
                        </span>
                      </div>
                    </div>
                  </Popover.Button>

                  <Transition
                    as={Fragment}
                    show={open}
                    enter="transition ease-out duration-200"
                    enterFrom="opacity-0 translate-y-1"
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-in duration-150"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo="opacity-0 translate-y-1"
                  >
                    <Popover.Panel className="absolute left-0 z-50 mt-2 bg-white rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 w-[510px]">
                      <div className="p-5">
                        <DatePicker
                          selected={checkOutDate}
                          onChange={(date) => {
                            setCheckOutDate(date);
                            close();
                          }}
                          minDate={checkInDate ? new Date(checkInDate.getTime() + 86400000) : new Date()}
                          inline
                          showPopperArrow={false}
                          monthsShown={1}
                          renderCustomHeader={(p) => (
                            <DatePickerCustomHeaderTwoMonth {...p} />
                          )}
                          renderDayContents={(day, date) => (
                            <DatePickerCustomDay dayOfMonth={day} date={date} />
                          )}
                        />
                      </div>
                    </Popover.Panel>
                  </Transition>
                </>
              )}
            </Popover>
          </div>

          {/* Guests selector - Implemented as a Popover */}
          <div className="relative flex-shrink-0 w-[160px]">
            <Popover className="relative">
              {({ open }) => (
                <>
                  <Popover.Button
                    className="flex items-center justify-between bg-[#252525] rounded-xl px-3 py-3 cursor-pointer shadow-[inset_-2px_4px_4px_rgba(0,0,0,0.25),inset_2px_0px_4px_rgba(0,0,0,0.25)] h-[55px] w-full"
                  >
                    <div className="flex items-center">
                      <UsersIcon className="w-5 h-5 text-[#CCCCCC] flex-shrink-0" />
                      <div className="ml-3">
                        <span className="block text-[#CCCCCC] text-sm font-medium">
                          {totalGuests > 0 ? `${totalGuests} ${t('guests')}` : t('guests')}
                        </span>
                      </div>
                    </div>
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
                    <Popover.Panel className="absolute right-0 z-40 w-full sm:min-w-[340px] max-w-sm bg-white dark:bg-neutral-800 top-full mt-3 py-5 sm:py-6 px-4 sm:px-8 rounded-3xl shadow-xl">
                      <NcInputNumber
                        className="w-full"
                        defaultValue={guestAdults}
                        onChange={(value) => setGuestAdults(value)}
                        max={10}
                        min={1}
                        label={t('adults')}
                        desc={t('ages_13_or_above')}
                      />
                      <NcInputNumber
                        className="w-full mt-6"
                        defaultValue={guestChildren}
                        onChange={(value) => setGuestChildren(value)}
                        max={4}
                        label={t('children')}
                        desc={t('ages_2_12')}
                      />
                      <NcInputNumber
                        className="w-full mt-6"
                        defaultValue={guestInfants}
                        onChange={(value) => setGuestInfants(value)}
                        max={4}
                        label={t('infants')}
                        desc={t('under_2')}
                      />
                    </Popover.Panel>
                  </Transition>
                </>
              )}
            </Popover>
          </div>

          {/* Search button */}
          <div className="flex-shrink-0 w-[120px]">
            <button 
              onClick={handleSearch}
              className="w-full bg-[#C49C74] hover:bg-[#b48c67] text-[#252525] font-semibold text-base rounded-xl h-[55px] shadow-[inset_-2px_4px_4px_rgba(0,0,0,0.66),inset_2px_0px_4px_rgba(0,0,0,0.25)]"
            >
              Search
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSearchForm;