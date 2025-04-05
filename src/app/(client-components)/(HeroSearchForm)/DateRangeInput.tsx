"use client";

import React, { Fragment, useState } from "react";
import { Popover, Transition } from "@headlessui/react";
import { CalendarIcon } from "@heroicons/react/24/outline";
import moment from "moment";
import DatePicker from "@/app/(client-components)/(HeroSearchForm)/DatePicker";
import useTranslation from "@/hooks/useTranslation";

export interface DateRangeInputProps {
  className?: string;
  fieldClassName?: string;
}

const DateRangeInput: React.FC<DateRangeInputProps> = ({
  className = "",
  fieldClassName = "[ nc-hero-field-padding ]",
}) => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const t = useTranslation('search');

  const onChangeDate = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return moment(date).format("MMM DD");
  };

  const getNightsCount = () => {
    if (!startDate || !endDate) return null;
    return moment(endDate).diff(moment(startDate), 'days');
  };

  const renderInput = () => {
    const startDateStr = formatDate(startDate);
    const endDateStr = formatDate(endDate);
    const nightsCount = getNightsCount();
    const nightsText = nightsCount ? ` · ${nightsCount} ${t('nights')}` : '';

    return (
      <>
        <div className="text-neutral-300 dark:text-neutral-400">
          <CalendarIcon className="w-5 h-5 lg:w-7 lg:h-7" />
        </div>
        <div className="flex-grow text-left">
          <span className="block xl:text-lg font-semibold">
            {startDateStr || t('addDates')}
            {endDateStr ? ` - ${endDateStr}` : ""}
          </span>
          <span className="block mt-1 text-sm text-neutral-400 leading-none font-light">
            {t('checkin_checkout')}{nightsText}
          </span>
        </div>
      </>
    );
  };

  return (
    <Popover className={`DateRangeInput relative flex ${className}`}>
      {({ open }) => (
        <>
          <Popover.Button
            className={`flex-1 z-10 flex relative ${fieldClassName} items-center space-x-3 focus:outline-none ${
              open ? "nc-hero-field-focused" : ""
            }`}
          >
            {renderInput()}
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
                startDate={startDate}
                endDate={endDate}
                onChange={onChangeDate}
              />
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
};

export default DateRangeInput;