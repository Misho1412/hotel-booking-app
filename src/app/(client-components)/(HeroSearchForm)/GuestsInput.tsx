"use client";

import React, { Fragment, useState, FC, useEffect } from "react";
import { Popover, Transition } from "@headlessui/react";
import NcInputNumber from "@/components/NcInputNumber";
import { UserIcon } from "@heroicons/react/24/outline";
import useTranslation from "@/hooks/useTranslation";

export interface GuestsInputProps {
  className?: string;
  defaultValue?: {
    guestAdults?: number;
    guestChildren?: number;
    guestInfants?: number;
  };
  onChange?: (data: {
    guestAdults: number;
    guestChildren: number;
    guestInfants: number;
  }) => void;
  fieldClassName?: string;
  onSubmit?: () => void;
  hasButtonSubmit?: boolean;
}

const GuestsInput: FC<GuestsInputProps> = ({
  className = "",
  defaultValue,
  onChange,
  fieldClassName = "[ nc-hero-field-padding ]",
  onSubmit,
  hasButtonSubmit = true,
}) => {
  // Track if component is mounted (client-side)
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const [guestAdultsInputValue, setGuestAdultsInputValue] = useState(
    defaultValue?.guestAdults || 0
  );
  const [guestChildrenInputValue, setGuestChildrenInputValue] = useState(
    defaultValue?.guestChildren || 0
  );
  const [guestInfantsInputValue, setGuestInfantsInputValue] = useState(
    defaultValue?.guestInfants || 0
  );

  const handleChangeData = (value: number, type: string) => {
    let newValue = {
      guestAdults: guestAdultsInputValue,
      guestChildren: guestChildrenInputValue,
      guestInfants: guestInfantsInputValue,
    };
    if (type === "guestAdults") {
      setGuestAdultsInputValue(value);
      newValue.guestAdults = value;
    }
    if (type === "guestChildren") {
      setGuestChildrenInputValue(value);
      newValue.guestChildren = value;
    }
    if (type === "guestInfants") {
      setGuestInfantsInputValue(value);
      newValue.guestInfants = value;
    }
    onChange && onChange(newValue);
  };

  const totalGuests =
    guestChildrenInputValue + guestAdultsInputValue + guestInfantsInputValue;

  // Client-side only rendering
  if (!mounted) {
    return (
      <div className={`flex relative ${className}`}>
        <div className={`flex-1 z-10 flex items-center`}>
          <div className={`flex-1 flex text-left items-center ${fieldClassName} space-x-3`}>
            <div className="text-neutral-300 dark:text-neutral-400">
              <UserIcon className="w-5 h-5 lg:w-7 lg:h-7" />
            </div>
            <div className="flex-grow">
              <span className="block xl:text-lg font-semibold">Guests</span>
              <span className="block mt-1 text-sm text-neutral-400 leading-none font-light">Add guests</span>
            </div>
            {hasButtonSubmit && (
              <div className="pr-2">
                <button
                  type="button"
                  className="h-12 px-4 py-3 bg-indigo-700 hover:bg-indigo-600 hover:shadow-sm rounded-full text-white font-semibold"
                >
                  Search
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Dynamic translations - client-side only
  const t = useTranslation('search');
  const guestsLabel = totalGuests ? t('guests') : t('addGuests');
  const searchLabel = t('search');
  const adultsLabel = t('adults');
  const adultsDesc = t('ages_13_or_above');
  const childrenLabel = t('children');
  const childrenDesc = t('ages_2_12');
  const infantsLabel = t('infants');
  const infantsDesc = t('under_2');

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
                <UserIcon className="w-5 h-5 lg:w-7 lg:h-7" />
              </div>
              <div className="flex-grow">
                <span suppressHydrationWarning className="block xl:text-lg font-semibold">
                  {totalGuests > 0 ? `${totalGuests} ${guestsLabel}` : guestsLabel}
                </span>
                <span suppressHydrationWarning className="block mt-1 text-sm text-neutral-400 leading-none font-light">
                  {guestsLabel}
                </span>
              </div>

              {hasButtonSubmit && (
                <div className="pr-2">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      onSubmit && onSubmit();
                    }}
                    type="button"
                    className="h-12 px-4 py-3 bg-indigo-700 hover:bg-indigo-600 hover:shadow-sm rounded-full text-white font-semibold"
                  >
                    {searchLabel}
                  </button>
                </div>
              )}
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
                  defaultValue={guestAdultsInputValue}
                  onChange={(value) => handleChangeData(value, "guestAdults")}
                  max={10}
                  min={1}
                  label={adultsLabel}
                  desc={adultsDesc}
                />
                <NcInputNumber
                  className="w-full mt-6"
                  defaultValue={guestChildrenInputValue}
                  onChange={(value) => handleChangeData(value, "guestChildren")}
                  max={4}
                  label={childrenLabel}
                  desc={childrenDesc}
                />
                <NcInputNumber
                  className="w-full mt-6"
                  defaultValue={guestInfantsInputValue}
                  onChange={(value) => handleChangeData(value, "guestInfants")}
                  max={4}
                  label={infantsLabel}
                  desc={infantsDesc}
                />
              </Popover.Panel>
            </Transition>
          </div>
        </>
      )}
    </Popover>
  );
};

export default GuestsInput;
