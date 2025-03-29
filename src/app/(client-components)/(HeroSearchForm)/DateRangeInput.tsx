"use client";

import React, { Fragment, useState, FC, useEffect } from "react";
import { Popover, Transition } from "@headlessui/react";
import { CalendarIcon } from "@heroicons/react/24/outline";
import DatePicker from "./DatePicker";
import moment from "moment";
import useTranslation from "@/hooks/useTranslation";

export interface DateRangeInputProps {
  className?: string;
  fieldClassName?: string;
  hasButtonSubmit?: boolean;
}

const DateRangeInput: FC<DateRangeInputProps> = ({
  className = "",
  fieldClassName = "[ nc-hero-field-padding ]",
  hasButtonSubmit = true,
}) => {
  // Track if component is mounted (client-side)
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const [startDate, setStartDate] = useState<moment.Moment | null>(null);
  const [endDate, setEndDate] = useState<moment.Moment | null>(null);

  const onChangeDate = (dates: [moment.Moment | null, moment.Moment | null]) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };

  // Client-side only rendering
  if (!mounted) {
    return (
      <div className={`flex relative ${className}`}>
        <div className={`flex-1 z-10 flex items-center`}>
          <div className={`flex-1 flex text-left items-center ${fieldClassName} space-x-3`}>
            <div className="text-neutral-300 dark:text-neutral-400">
              <CalendarIcon className="w-5 h-5 lg:w-7 lg:h-7" />
            </div>
            <div className="flex-grow">
              <span className="block xl:text-lg font-semibold">Check-in - Check-out</span>
              <span className="block mt-1 text-sm text-neutral-400 leading-none font-light">Add dates</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dynamic translations - client-side only
  const t = useTranslation('search');
  const checkinCheckoutLabel = t('checkin_checkout');
  const addDatesLabel = t('addDates');
  const nightsLabel = t('nights');

  const dateRangeString = startDate?.format("MMM DD")
    ? `${startDate?.format("MMM DD")} - ${endDate?.format("MMM DD") || "?"}`
    : checkinCheckoutLabel;

  const subtitleText = startDate?.format("MMM DD")
    ? startDate?.format("MMM DD")
    : addDatesLabel;

  const nightsText = startDate?.format("MMM DD") && endDate?.format("MMM DD")
    ? " - " + moment.duration(endDate?.diff(startDate)).asDays().toString() + " " + nightsLabel
    : "";

  // Full component with interactivity - client-side only
  return (
    <Popover className={`flex relative ${className}`}>
      {({ open }) => (
        <>
          <div
            className={`flex-1 z-10 flex items-center focus:outline-none ${
              open ? "nc-hero-field-focused" : ""
            }`}
          >
            <Popover.Button
              className={`flex-1 flex text-left items-center ${fieldClassName} space-x-3`}
            >
              <div className="text-neutral-300 dark:text-neutral-400">
                <CalendarIcon className="w-5 h-5 lg:w-7 lg:h-7" />
              </div>
              <div className="flex-grow">
                <span suppressHydrationWarning className="block xl:text-lg font-semibold">
                  {dateRangeString}
                </span>
                <span suppressHydrationWarning className="block mt-1 text-sm text-neutral-400 leading-none font-light">
                  {subtitleText}{nightsText}
                </span>
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
              <Popover.Panel className="absolute right-0 z-40 w-screen max-w-screen-sm bg-white dark:bg-neutral-800 top-full mt-3 sm:py-6 lg:py-8 px-4 sm:px-8 rounded-3xl shadow-xl">
                <DatePicker
                  value={[startDate, endDate]}
                  onChange={onChangeDate}
                />
              </Popover.Panel>
            </Transition>
          </div>
        </>
      )}
    </Popover>
  );
};

export default DateRangeInput;