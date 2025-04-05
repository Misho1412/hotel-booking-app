"use client";

import React, { Fragment, useState, FC, useEffect } from "react";
import { Popover, Transition } from "@headlessui/react";
import { CalendarIcon } from "@heroicons/react/24/outline";
import DatePickerCustomHeaderTwoMonth from "@/components/DatePickerCustomHeaderTwoMonth";
import DatePickerCustomDay from "@/components/DatePickerCustomDay";
import DatePicker from "react-datepicker";
import ClearDataButton from "../ClearDataButton";
import useTranslation from "@/hooks/useTranslation";
import { usePathname } from "next/navigation";

export interface StayDatesRangeInputProps {
  className?: string;
  fieldClassName?: string;
}

const StayDatesRangeInput: FC<StayDatesRangeInputProps> = ({
  className = "[ lg:nc-flex-2 ]",
  fieldClassName = "[ nc-hero-field-padding ]",
}) => {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const isArabic = pathname?.startsWith('/ar');
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Set default dates to today and tomorrow
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const [startDate, setStartDate] = useState<Date | null>(today);
  const [endDate, setEndDate] = useState<Date | null>(tomorrow);
  //

  const onChangeDate = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };

  // Client-side only translation
  const t = useTranslation('search');
  const m = useTranslation('months');
  
  // Use try-catch to handle any translation errors
  let addDatesLabel, checkinCheckoutLabel;
  try {
    addDatesLabel = mounted ? t('addDates') : 'Add dates';
    checkinCheckoutLabel = mounted ? t('checkin_checkout') : 'Check in - Check out';
  } catch (error) {
    addDatesLabel = 'Add dates';
    checkinCheckoutLabel = 'Check in - Check out';
  }

  // Format date based on locale
  const formatDate = (date: Date | null) => {
    if (!date) return null;
    
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

  const renderInput = () => {
    return (
      <>
        <div className="text-neutral-300 dark:text-neutral-400">
          <CalendarIcon className="w-5 h-5 lg:w-7 lg:h-7" />
        </div>
        <div className="flex-grow text-left">
          <span className="block xl:text-lg font-semibold">
            {formatDate(startDate) || addDatesLabel}
            {endDate ? " - " + formatDate(endDate) : ""}
          </span>
          <span suppressHydrationWarning className="block mt-1 text-sm text-neutral-400 leading-none font-light">
            {checkinCheckoutLabel}
          </span>
        </div>
      </>
    );
  };

  return (
    <Popover className={`StayDatesRangeInput z-10 relative flex ${className}`}>
      {({ open }) => (
        <>
          <Popover.Button
            className={`flex-1 z-10 flex relative ${fieldClassName} items-center space-x-3 focus:outline-none ${
              open ? "nc-hero-field-focused" : ""
            }`}
          >
            {renderInput()}
            {startDate && open && (
              <ClearDataButton onClick={() => onChangeDate([null, null])} />
            )}
          </Popover.Button>

          {open && (
            <div className="h-8 absolute self-center top-1/2 -translate-y-1/2 z-0 -inset-x-0.5 bg-white dark:bg-neutral-800"></div>
          )}

          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel className="absolute left-1/2 z-10 mt-3 top-full w-screen max-w-sm -translate-x-1/2 transform px-4 sm:px-0 lg:max-w-3xl">
              <div className="overflow-hidden rounded-3xl shadow-lg ring-1 ring-black ring-opacity-5 bg-white dark:bg-neutral-800 p-8">
                <DatePicker
                  selected={startDate}
                  onChange={onChangeDate}
                  startDate={startDate}
                  endDate={endDate}
                  selectsRange
                  monthsShown={2}
                  showPopperArrow={false}
                  inline
                  minDate={new Date()}
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
  );
};

export default StayDatesRangeInput;
