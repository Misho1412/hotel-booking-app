"use client";

import React, { Fragment, useState } from "react";
import { FC } from "react";
import DatePicker from "react-datepicker";
import { Popover, Transition } from "@headlessui/react";
import { CalendarIcon } from "@heroicons/react/24/outline";
import DatePickerCustomHeaderTwoMonth from "@/components/DatePickerCustomHeaderTwoMonth";
import DatePickerCustomDay from "@/components/DatePickerCustomDay";
import ClearDataButton from "../ClearDataButton";
import ButtonSubmit from "../ButtonSubmit";
import { PathName } from "@/routers/types";

export interface RentalCarDatesRangeInputProps {
  className?: string;
  fieldClassName?: string;
  hasButtonSubmit?: boolean;
}

const RentalCarDatesRangeInput: FC<RentalCarDatesRangeInputProps> = ({
  className = "",
  fieldClassName = "[ nc-hero-field-padding ]",
  hasButtonSubmit = true,
}) => {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const [startDate, setStartDate] = useState<Date | null>(today);
  const [endDate, setEndDate] = useState<Date | null>(tomorrow);

  const onChangeDate = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };

  const renderInput = () => {
    return (
      <>
        <div className="text-neutral-300 dark:text-neutral-400">
          <CalendarIcon className="w-5 h-5 lg:w-7 lg:h-7" />
        </div>
        <div className="flex-grow text-left">
          <span className="block xl:text-lg font-semibold">
            {startDate?.toLocaleDateString("en-US", {
              month: "short",
              day: "2-digit",
            }) || "Add dates"}
            {endDate
              ? " - " +
                endDate?.toLocaleDateString("en-US", {
                  month: "short",
                  day: "2-digit",
                })
              : ""}
          </span>
          <span className="block mt-1 text-sm text-neutral-400 leading-none font-light">
            {"Pick up - Drop off"}
          </span>
        </div>
      </>
    );
  };

  return (
    <>
      <Popover
        className={`RentalCarDatesRangeInput relative flex ${className}`}
      >
        {({ open }) => (
          <>
            <div
              className={`flex-1 z-10 flex items-center focus:outline-none ${
                open ? "nc-hero-field-focused" : ""
              }`}
            >
              <Popover.Button
                className={`flex-1 z-10 flex relative ${fieldClassName} items-center space-x-3 focus:outline-none `}
              >
                {renderInput()}

                {startDate && open && (
                  <ClearDataButton onClick={() => onChangeDate([null, null])} />
                )}
              </Popover.Button>

              {/* BUTTON SUBMIT OF FORM */}
              {hasButtonSubmit && (
                <div className="pr-2 xl:pr-4">
                  <ButtonSubmit href={"/listing-car-detail" as PathName} />
                </div>
              )}
            </div>

            {open && (
              <div className="h-8 absolute self-center top-1/2 -translate-y-1/2 z-0 -left-0.5 right-0.5 bg-white dark:bg-neutral-800"></div>
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
    </>
  );
};

export default RentalCarDatesRangeInput;
