"use client";

import React, { FC, Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { ArrowRightIcon, Squares2X2Icon, XMarkIcon } from "@heroicons/react/24/outline";
import CommentListing from "@/components/CommentListing";
import FiveStartIconForRate from "@/components/FiveStartIconForRate";
import StartRating from "@/components/StartRating";
import Avatar from "@/shared/Avatar";
import Badge from "@/shared/Badge";
import ButtonCircle from "@/shared/ButtonCircle";
import ButtonPrimary from "@/shared/ButtonPrimary";
import ButtonSecondary from "@/shared/ButtonSecondary";
import ButtonClose from "@/shared/ButtonClose";
import Input from "@/shared/Input";
import LikeSaveBtns from "@/components/LikeSaveBtns";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Amenities_demos, PHOTOS } from "./constant";
import StayDatesRangeInput from "./StayDatesRangeInput";
import GuestsInput from "./GuestsInput";
import SectionDateRange from "../SectionDateRange";
import { Route } from "next";
import useTranslation from "@/hooks/useTranslation";
import ModalPhotos from "@/components/ModalPhotos";

export interface ListingStayDetailPageProps {}

const ListingStayDetailPage: FC<ListingStayDetailPageProps> = ({}) => {
  let [isOpenModalAmenities, setIsOpenModalAmenities] = useState(false);
  const [isModalPhotoOpen, setIsModalPhotoOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const t = useTranslation('listing');

  useEffect(() => {
    setMounted(true);
  }, []);

  const thisPathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check if modal should be open based on URL parameters
  useEffect(() => {
    const modal = searchParams?.get("modal");
    setIsModalPhotoOpen(modal === "PHOTO_TOUR_SCROLLABLE");
  }, [searchParams]);

  function closeModalAmenities() {
    setIsOpenModalAmenities(false);
  }

  function openModalAmenities() {
    setIsOpenModalAmenities(true);
  }

  const handleOpenModalImageGallery = () => {
    router.push(`${thisPathname}/?modal=PHOTO_TOUR_SCROLLABLE` as Route);
  };

  const handleCloseModalImageGallery = () => {
    setIsModalPhotoOpen(false);
    // Remove modal from URL
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.delete("modal");
    router.push(`${thisPathname}/?${params.toString()}` as Route);
  };

  const renderSection1 = () => {
    return (
      <div className="listingSection__wrap !space-y-6">
        {/* 1 */}
        <div className="flex justify-between items-center">
          <Badge color="pink" name="Rental" />
          <LikeSaveBtns />
        </div>

        {/* 2 */}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold">
          {mounted 
            ? t('propertyDetails.title') 
            : "Property details"}
        </h2>

        {/* 3 */}
        <div className="flex items-center space-x-4">
          <StartRating />
          <span>·</span>
          <span>
            <i className="las la-map-marker-alt"></i>
            <span className="ml-1"> Tokyo, Japan</span>
          </span>
        </div>

        {/* 4 */}
        <div className="flex items-center">
          <Avatar imgUrl="/images/avatars/Image-1.png" hasChecked sizeClass="h-10 w-10" />
          <span className="ml-2.5 text-neutral-500 dark:text-neutral-400">
            {mounted 
              ? t('entirePlace.subtitle') 
              : "You'll have the apartment to yourself."}
          </span>
        </div>

        {/* 5 */}
        <div className="w-full border-b border-neutral-100 dark:border-neutral-700" />

        {/* 6 */}
        <div className="flex items-center justify-between xl:justify-start space-x-8 xl:space-x-12 text-sm text-neutral-700 dark:text-neutral-300">
          <div className="flex items-center space-x-3 ">
            <i className=" las la-user text-2xl "></i>
            <span className="">
              6 <span className="hidden sm:inline-block">{mounted ? t('propertyDetails.guests') : "guests"}</span>
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <i className=" las la-bed text-2xl"></i>
            <span className="">
              3 <span className="hidden sm:inline-block">{mounted ? t('propertyDetails.bedrooms') : "bedrooms"}</span>
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <i className=" las la-bath text-2xl"></i>
            <span className="">
              2 <span className="hidden sm:inline-block">{mounted ? t('propertyDetails.baths') : "baths"}</span>
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <i className=" las la-couch text-2xl"></i>
            <span className="">
              3 <span className="hidden sm:inline-block">{mounted ? t('propertyDetails.beds') : "beds"}</span>
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderSection2 = () => {
    return (
      <div className="listingSection__wrap">
        <h2 className="text-2xl font-semibold">{mounted ? t('entirePlace.title') : "Entire home"}</h2>
        <div className="w-14 border-b border-neutral-200 dark:border-neutral-700"></div>

        <div className="text-neutral-6000 dark:text-neutral-300">
          <span>
            Providing lake views, The Symphony 9 Tam Coc in Ninh Binh provides accommodation, an
            outdoor swimming pool, a bar, a shared lounge, a garden and barbecue facilities. Both
            WiFi and private parking are available at the apartment free of charge.
          </span>
          <br />
          <br />
          <span>
            Each unit is equipped with a patio offering lake views, a fully equipped kitchenette with
            a microwave, a seating area, a flat-screen TV, a washing machine, and a private bathroom
            with shower and a hairdryer. A fridge and stovetop are also provided, as well as a
            kettle.
          </span>
          <br />
          <br />
          <span>
            The Symphony 9 Tam Coc offers a terrace. Both a bicycle rental service and a car rental
            service are available at the accommodation, while cycling can be enjoyed nearby.
          </span>
        </div>
      </div>
    );
  };

  const renderSection3 = () => {
    return (
      <div className="listingSection__wrap">
        {/* HEADING */}
        <div>
          <h2 className="text-2xl font-semibold">
            {mounted ? t('amenities.title') : "Amenities"}
          </h2>
          <span className="block mt-2 text-neutral-500 dark:text-neutral-400">
            {mounted ? t('amenities.subtitle') : "About the property's amenities and services"}
          </span>
        </div>
        <div className="w-14 border-b border-neutral-200 dark:border-neutral-700"></div>
        {/* CONTENT */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 text-sm text-neutral-700 dark:text-neutral-300 ">
          {/* LOOP ITEMS START */}
          <div className="flex flex-col space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <i className="las la-wifi text-xl"></i>
                <span>{mounted ? t('amenities.sections.basicUtilities') : "Basic"}</span>
              </div>
              <div className="flex items-center space-x-3">
                <i className="las la-charging-station text-xl"></i>
                <span>Heating</span>
              </div>
              <div className="flex items-center space-x-3">
                <i className="las la-tshirt text-xl"></i>
                <span>Washer</span>
              </div>
              <div className="flex items-center space-x-3">
                <i className="las la-snowflake text-xl"></i>
                <span>Air conditioning</span>
              </div>
              <div className="flex items-center space-x-3">
                <i className="las la-hot-tub text-xl"></i>
                <span>Hot water</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <i className="las la-utensils text-xl"></i>
                <span>{mounted ? t('amenities.sections.cooking') : "Cooking"}</span>
              </div>
              <div className="flex items-center space-x-3">
                <i className="las la-temperature-high text-xl"></i>
                <span>Kitchen</span>
              </div>
              <div className="flex items-center space-x-3">
                <i className="las la-cocktail text-xl"></i>
                <span>Refrigerator</span>
              </div>
              <div className="flex items-center space-x-3">
                <i className="las la-coffee text-xl"></i>
                <span>Microwave</span>
              </div>
              <div className="flex items-center space-x-3">
                <i className="las la-wine-glass-alt text-xl"></i>
                <span>Dishes and silverware</span>
              </div>
            </div>
          </div>
          {/* END */}

          {/* LOOP ITEMS START */}
          <div className="flex flex-col space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <i className="las la-tv text-xl"></i>
                <span>Entertainment</span>
              </div>
              <div className="flex items-center space-x-3">
                <i className="las la-tv text-xl"></i>
                <span>TV with standard cable</span>
              </div>
              <div className="flex items-center space-x-3">
                <i className="las la-guitar text-xl"></i>
                <span>Books and reading material</span>
              </div>
              <div className="flex items-center space-x-3">
                <i className="las la-table-tennis text-xl"></i>
                <span>Game console</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <i className="las la-shield-alt text-xl"></i>
                <span>{mounted ? t('amenities.sections.health') : "Health & Safety"}</span>
              </div>
              <div className="flex items-center space-x-3">
                <i className="las la-first-aid text-xl"></i>
                <span>First aid kit</span>
              </div>
              <div className="flex items-center space-x-3">
                <i className="las la-fire-extinguisher text-xl"></i>
                <span>Fire extinguisher</span>
              </div>
              <div className="flex items-center space-x-3">
                <i className="las la-door-open text-xl"></i>
                <span>Smoke alarm</span>
              </div>
              <div className="flex items-center space-x-3">
                <i className="las la-medkit text-xl"></i>
                <span>Carbon monoxide alarm</span>
              </div>
            </div>
          </div>
          {/* END */}

          {/* LOOP ITEMS START */}
          <div className="flex flex-col space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <i className="las la-parking text-xl"></i>
                <span>Location Features</span>
              </div>
              <div className="flex items-center space-x-3">
                <i className="las la-parking text-xl"></i>
                <span>Free parking on premise</span>
              </div>
              <div className="flex items-center space-x-3">
                <i className="las la-swimming-pool text-xl"></i>
                <span>Pool</span>
              </div>
              <div className="flex items-center space-x-3">
                <i className="las la-dumbbell text-xl"></i>
                <span>Gym</span>
              </div>
              <div className="flex items-center space-x-3">
                <i className="las la-hot-tub text-xl"></i>
                <span>Hot tub</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <i className="las la-cocktail text-xl"></i>
                <span>{mounted ? t('amenities.sections.outdoor') : "Outdoor"}</span>
              </div>
              <div className="flex items-center space-x-3">
                <i className="las la-umbrella-beach text-xl"></i>
                <span>BBQ grill</span>
              </div>
              <div className="flex items-center space-x-3">
                <i className="las la-umbrella text-xl"></i>
                <span>Patio or balcony</span>
              </div>
              <div className="flex items-center space-x-3">
                <i className="las la-umbrella-beach text-xl"></i>
                <span>Garden or backyard</span>
              </div>
            </div>
          </div>
          {/* END */}
        </div>

        {/* SHOW MORE */}
        <div className="pt-8">
          <ButtonSecondary onClick={openModalAmenities}>
            {mounted ? t('amenities.viewMore') : "View more 20 amenities"}
          </ButtonSecondary>
        </div>
      </div>
    );
  };

  const renderModalAmenities = () => {
    return (
      <Transition appear show={isOpenModalAmenities} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 overflow-y-auto"
          onClose={closeModalAmenities}
        >
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-40" />
            </Transition.Child>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span className="inline-block h-screen align-middle" aria-hidden="true">
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="inline-block py-8 px-2 h-screen w-full max-w-4xl">
                <div className="inline-flex w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 dark:text-neutral-100 h-full">
                  <div className="relative flex-shrink-0 px-6 py-4 border-b border-neutral-200 dark:border-neutral-700 text-center">
                    <h3 className="text-xl font-medium leading-6 text-neutral-900 dark:text-neutral-100">
                      {mounted ? t('amenities.modal.title') : "Amenities"}
                    </h3>
                    <span className="absolute left-3 top-3">
                      <button
                        type="button"
                        className="relative rounded-md text-neutral-400 hover:text-neutral-500 focus:outline-none focus:ring-0"
                        onClick={closeModalAmenities}
                      >
                        <span className="sr-only">Close</span>
                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </span>
                  </div>

                  <div className="px-8 py-8 overflow-auto text-neutral-700 dark:text-neutral-300 divide-y divide-neutral-200 dark:divide-neutral-700">
                    <div className="space-y-6 pb-6">
                      <h3 className="text-2xl font-semibold">
                        {mounted ? t('amenities.sections.basicUtilities') : "Basic"}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 space-y-3 sm:space-y-0 sm:gap-3">
                        <div className="flex items-center space-x-3">
                          <i className="las la-wifi text-2xl"></i>
                          <span>Wifi</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <i className="las la-charging-station text-2xl"></i>
                          <span>Heating</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <i className="las la-tshirt text-2xl"></i>
                          <span>Washer</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <i className="las la-snowflake text-2xl"></i>
                          <span>Air conditioning</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6 py-6">
                      <h3 className="text-2xl font-semibold">
                        {mounted ? t('amenities.sections.cooking') : "Cooking"}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 space-y-3 sm:space-y-0 sm:gap-3">
                        <div className="flex items-center space-x-3">
                          <i className="las la-utensils text-2xl"></i>
                          <span>Kitchen</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <i className="las la-temperature-high text-2xl"></i>
                          <span>Refrigerator</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <i className="las la-cocktail text-2xl"></i>
                          <span>Microwave</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <i className="las la-coffee text-2xl"></i>
                          <span>Dishes and silverware</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6 py-6">
                      <h3 className="text-2xl font-semibold">
                        {mounted ? t('amenities.sections.health') : "Health & Safety"}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 space-y-3 sm:space-y-0 sm:gap-3">
                        <div className="flex items-center space-x-3">
                          <i className="las la-first-aid text-2xl"></i>
                          <span>First aid kit</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <i className="las la-fire-extinguisher text-2xl"></i>
                          <span>Fire extinguisher</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <i className="las la-door-open text-2xl"></i>
                          <span>Smoke alarm</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <i className="las la-medkit text-2xl"></i>
                          <span>Carbon monoxide alarm</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6 py-6">
                      <h3 className="text-2xl font-semibold">
                        {mounted ? t('amenities.sections.outdoor') : "Outdoor"}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 space-y-3 sm:space-y-0 sm:gap-3">
                        <div className="flex items-center space-x-3">
                          <i className="las la-umbrella-beach text-2xl"></i>
                          <span>BBQ grill</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <i className="las la-umbrella text-2xl"></i>
                          <span>Patio or balcony</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <i className="las la-umbrella-beach text-2xl"></i>
                          <span>Garden or backyard</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    );
  };

  const renderSection4 = () => {
    return (
      <div className="listingSection__wrap">
        <div>
          <h2 className="text-2xl font-semibold">{mounted ? t('locationSection.title') : "Location"}</h2>
          <span className="block mt-2 text-neutral-500 dark:text-neutral-400">
            {mounted ? t('locationSection.description') : "Collingwood VIC 3066, Australia"}
          </span>
        </div>
        <div className="w-14 border-b border-neutral-200 dark:border-neutral-700"></div>

        <div className="aspect-w-5 aspect-h-5 sm:aspect-h-3">
          <div className="rounded-xl overflow-hidden">
            <img
              src="https://maps.googleapis.com/maps/api/staticmap?size=640x320&zoom=18&center=37.74090526916385,-122.4313142562414&key=AIzaSyDCW0B8coLzJioFe_CX0JxqijrTR4FqvqU&markers=size:small%7Ccolor:0x000000%7C37.74090526916385,-122.4313142562414"
              className="w-full h-full object-cover"
              alt="Map"
            />
          </div>
        </div>
        <div className="mt-4 space-y-3">
          <h4 className="text-lg font-semibold">{mounted ? t('locationSection.aroundTitle') : "What's around"}</h4>
          <div className="flex items-center space-x-3">
            <i className="text-lg las la-walking"></i>
            <span>{mounted ? t('locationSection.aroundItems.0') : "Queens Museum - 15 min walk"}</span>
          </div>
          <div className="flex items-center space-x-3">
            <i className="text-lg las la-walking"></i>
            <span>{mounted ? t('locationSection.aroundItems.1') : "Museum of the Moving Image - 16 min walk"}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderSection5 = () => {
    return (
      <div className="listingSection__wrap">
        <h2 className="text-2xl font-semibold">{mounted ? t('thingsToKnow.title') : "Things to know"}</h2>
        <div className="w-14 border-b border-neutral-200 dark:border-neutral-700"></div>

        <div className="md:grid md:grid-cols-3 space-y-6 md:space-y-0 md:divide-x md:divide-neutral-200 dark:md:divide-neutral-800">
          {/* HOUSE RULES */}
          <div className="md:px-0 md:pr-8 space-y-3">
            <h4 className="text-base font-semibold">{mounted ? t('thingsToKnow.houseRules.title') : "House Rules"}</h4>
            <div className="flex items-center space-x-3">
              <i className="text-lg las la-door-open"></i>
              <span>{mounted ? t('thingsToKnow.houseRules.items.0') : "Check-in: 3:00 PM - 7:00 PM"}</span>
            </div>
            <div className="flex items-center space-x-3">
              <i className="text-lg las la-door-closed"></i>
              <span>{mounted ? t('thingsToKnow.houseRules.items.1') : "Checkout before: 10:00 AM"}</span>
            </div>
            <div className="flex items-center space-x-3">
              <i className="text-lg las la-smoking-ban"></i>
              <span>{mounted ? t('thingsToKnow.houseRules.items.2') : "No pets"}</span>
            </div>
            <div className="flex items-center space-x-3">
              <i className="text-lg las la-smoking-ban"></i>
              <span>{mounted ? t('thingsToKnow.houseRules.items.3') : "No parties or events"}</span>
            </div>
          </div>

          {/* HEALTH & SAFETY */}
          <div className="md:px-6 space-y-3">
            <h4 className="text-base font-semibold">{mounted ? t('thingsToKnow.healthAndSafety.title') : "Health & Safety"}</h4>
            <div className="flex items-center space-x-3">
              <i className="text-lg las la-pump-medical"></i>
              <span>{mounted ? t('thingsToKnow.healthAndSafety.items.0') : "Carbon monoxide alarm"}</span>
            </div>
            <div className="flex items-center space-x-3">
              <i className="text-lg las la-smoking-ban"></i>
              <span>{mounted ? t('thingsToKnow.healthAndSafety.items.1') : "Smoke alarm"}</span>
            </div>
          </div>

          {/* CANCELLATION POLICY */}
          <div className="md:pl-6 space-y-3">
            <h4 className="text-base font-semibold">{mounted ? t('thingsToKnow.cancellation.title') : "Cancellation policy"}</h4>
            <div className="text-neutral-6000 dark:text-neutral-300">
              <span>
                {mounted ? 
                  t('thingsToKnow.cancellation.text') : 
                  "Free cancellation before Jul 25. After that, cancel before Jul 30 for a partial refund."
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSection6 = () => {
    return (
      <div className="listingSection__wrap">
        <h2 className="text-2xl font-semibold">{mounted ? t('hostSection.title') : "Host Information"}</h2>
        <div className="w-14 border-b border-neutral-200 dark:border-neutral-700"></div>

        {/* host */}
        <div className="flex items-center space-x-4">
          <Avatar
            hasChecked
            hasCheckedClass="w-4 h-4 -top-0.5 right-0.5"
            sizeClass="h-14 w-14"
            radius="rounded-full"
          />
          <div>
            <a className="block text-xl font-medium" href="##">
              {mounted ? t('host.name') : "Kevin Francis"}
            </a>
            <div className="mt-1.5 flex items-center text-sm text-neutral-500 dark:text-neutral-400">
              <StartRating />
              <span className="mx-2">·</span>
              <span> 12 places</span>
            </div>
          </div>
        </div>

        {/* desc */}
        <span className="block text-neutral-6000 dark:text-neutral-300">
          {mounted ? t('hostSection.bio') : "Kevin has been hosting for 3 years. I'm a lifestyle photographer and educator living in Northampton, England with my beautiful wife Ellie, handsome little rascal Harvey, and posh cat Pablo."}
        </span>

        {/* info */}
        <div className="block text-neutral-500 dark:text-neutral-400 space-y-2.5">
          <div className="flex items-center space-x-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>Joined in March 2016</span>
          </div>
          <div className="flex items-center space-x-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
              />
            </svg>
            <span>{mounted ? t('hostSection.responseRate') : "Response rate - 100%"}</span>
          </div>
          <div className="flex items-center space-x-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{mounted ? t('hostSection.responseTime') : "Response time: within an hour"}</span>
          </div>
        </div>

        {/* == */}
        <div className="w-14 border-b border-neutral-200 dark:border-neutral-700"></div>
        <div>
          <ButtonSecondary href="/author">{mounted ? t('hostSection.contactHost') : "Contact host"}</ButtonSecondary>
        </div>
      </div>
    );
  };

  const renderSection7 = () => {
    return (
      <div className="listingSection__wrap">
        <h2 className="text-2xl font-semibold">{mounted ? t('reviews.title') : "Reviews"} ({mounted ? t('reviews.totalReviews') : "112 reviews"})</h2>
        <div className="w-14 border-b border-neutral-200 dark:border-neutral-700"></div>

        {/* Content */}
        <div className="space-y-5">
          <div className="flex items-center space-x-2">
            <FiveStartIconForRate iconClass="w-6 h-6" className="space-x-0.5" />
            <span className="font-medium">{mounted ? t('reviews.score') : "4.96"}</span>
            <span>·</span>
            <span>{mounted ? t('reviews.totalReviews') : "112 reviews"}</span>
          </div>
          
          {/* Rating categories */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex justify-between items-center">
              <span className="text-neutral-600 dark:text-neutral-300">{mounted ? t('reviews.categories.cleanliness') : "Cleanliness"}</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full">
                  <div className="w-[95%] h-full bg-primary-500 rounded-full"></div>
                </div>
                <span>4.8</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-600 dark:text-neutral-300">{mounted ? t('reviews.categories.accuracy') : "Accuracy"}</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full">
                  <div className="w-[95%] h-full bg-primary-500 rounded-full"></div>
                </div>
                <span>4.8</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-600 dark:text-neutral-300">{mounted ? t('reviews.categories.communication') : "Communication"}</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full">
                  <div className="w-[95%] h-full bg-primary-500 rounded-full"></div>
                </div>
                <span>4.8</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-600 dark:text-neutral-300">{mounted ? t('reviews.categories.location') : "Location"}</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full">
                  <div className="w-[95%] h-full bg-primary-500 rounded-full"></div>
                </div>
                <span>4.8</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-600 dark:text-neutral-300">{mounted ? t('reviews.categories.checkIn') : "Check-in"}</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full">
                  <div className="w-[95%] h-full bg-primary-500 rounded-full"></div>
                </div>
                <span>4.8</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-600 dark:text-neutral-300">{mounted ? t('reviews.categories.value') : "Value"}</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full">
                  <div className="w-[95%] h-full bg-primary-500 rounded-full"></div>
                </div>
                <span>4.8</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <Input
              fontClass=""
              sizeClass="h-16 px-4 py-3"
              rounded="rounded-3xl"
              placeholder="Share your thoughts ..."
            />
            <ButtonCircle
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
              size=" w-12 h-12 "
            >
              <ArrowRightIcon className="w-5 h-5" />
            </ButtonCircle>
          </div>
        </div>

        {/* comment */}
        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          <CommentListing className="py-8" />
          <CommentListing className="py-8" />
          <CommentListing className="py-8" />
          <CommentListing className="py-8" />
          <div className="pt-8">
            <ButtonSecondary>{mounted ? t('reviews.showAllReviews') : "Show all 112 reviews"}</ButtonSecondary>
          </div>
        </div>
      </div>
    );
  };

  const renderSection8 = () => {
    return (
      <div className="listingSection__wrap">
        {/* HEADING */}
        <h2 className="text-2xl font-semibold">{mounted ? t('dates.title') : "Availability"}</h2>
        <div className="w-14 border-b border-neutral-200 dark:border-neutral-700"></div>

        {/* CONTENT */}
        <div className="listingSection__wrap__DayPickerRangeController">
          <div>
            <SectionDateRange />
          </div>
        </div>

        {/* PRICE */}
        <div className="flex justify-between items-center">
          <span className="text-base font-semibold">
            $119
            <span className="text-sm text-neutral-500 dark:text-neutral-400 font-normal">
              /{mounted ? t('sidebar.perNight') : "night"}
            </span>
          </span>
          <ButtonSecondary href="##">{mounted ? t('dates.selectDates') : "Select dates"}</ButtonSecondary>
        </div>
      </div>
    );
  };

  const renderSidebar = () => {
    return (
      <div className="listingSectionSidebar__wrap">
        {/* PRICE */}
        <div className="flex justify-between">
          <span className="text-3xl font-semibold">
            $119
            <span className="ml-1 text-base font-normal text-neutral-500 dark:text-neutral-400">
              /{mounted ? t('sidebar.perNight') : "night"}
            </span>
          </span>
          <StartRating />
        </div>

        {/* FORM */}
        <form className="flex flex-col border border-neutral-200 dark:border-neutral-700 rounded-3xl ">
          <StayDatesRangeInput className="flex-1 z-[11]" />
          <div className="mt-6">
            <GuestsInput className="flex-1" />
          </div>

          {/* SUM */}
          <div className="flex flex-col space-y-4 mt-8">
            <div className="flex justify-between">
              <span className="font-semibold">$119 x 3 {mounted ? t('sidebar.perNight') : "night"}</span>
              <span>$357</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">{mounted ? t('sidebar.serviceFee') : "Service fee"}</span>
              <span>$10</span>
            </div>
            <div className="border-b border-neutral-200 dark:border-neutral-700"></div>
            <div className="flex justify-between font-semibold">
              <span>{mounted ? t('sidebar.total') : "Total"}</span>
              <span>$367</span>
            </div>
          </div>

          {/* SUBMIT */}
          <ButtonPrimary href="##">
            {mounted ? t('sidebar.reserve') : "Reserve"}
          </ButtonPrimary>

          {/* POLICY */}
          <div className="text-sm text-center mt-6 text-neutral-500 dark:text-neutral-400">
            {mounted ? t('sidebar.wonBeCharged') : "You won't be charged yet"}
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className={`nc-ListingStayDetailPage `}>
      {/* SINGLE HEADER */}
      <>
        <header className="container 2xl:px-14 rounded-md sm:rounded-xl">
          <div className="relative grid grid-cols-3 sm:grid-cols-4 gap-1 sm:gap-2">
            <div
              className="col-span-2 row-span-3 sm:row-span-2 relative rounded-md sm:rounded-xl overflow-hidden cursor-pointer"
              onClick={handleOpenModalImageGallery}
            >
              <Image
                className="absolute inset-0 object-cover rounded-md sm:rounded-xl"
                src={PHOTOS[0]}
                fill
                alt="listing stay detail page"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
                priority
              />
              <div className="absolute inset-0 bg-neutral-900 bg-opacity-20 opacity-0 hover:opacity-100 transition-opacity"></div>
            </div>
            {PHOTOS.filter((_, i) => i >= 1 && i < 5).map((item, index) => (
              <div
                key={index}
                className={`relative rounded-md sm:rounded-xl overflow-hidden ${
                  index >= 3 ? "hidden sm:block" : ""
                }`}
              >
                <div className="aspect-w-4 aspect-h-3 sm:aspect-w-6 sm:aspect-h-5">
                  <Image
                    fill
                    className="object-cover rounded-md sm:rounded-xl "
                    src={item || ""}
                    alt=""
                    sizes="400px"
                  />
                </div>

                {/* OVERLAY */}
                <div
                  className="absolute inset-0 bg-neutral-900 bg-opacity-20 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={handleOpenModalImageGallery}
                />
              </div>
            ))}

            <button
              className="absolute hidden md:flex md:items-center md:justify-center left-3 bottom-3 px-4 py-2 rounded-xl bg-neutral-100 text-neutral-500 hover:bg-neutral-200 z-10"
              onClick={handleOpenModalImageGallery}
            >
              <Squares2X2Icon className="w-5 h-5" />
              <span className="ml-2 text-neutral-800 text-sm font-medium">
                Show all photos
              </span>
            </button>
          </div>
        </header>
      </>

      {/* MAIN */}
      <main className=" relative z-10 mt-11 flex flex-col lg:flex-row ">
        {/* CONTENT */}
        <div className="w-full lg:w-3/5 xl:w-2/3 space-y-8 lg:space-y-10 lg:pr-10">
          {renderSection1()}
          {renderSection2()}
          {renderSection3()}
          {renderSection4()}
          {renderSection5()}
          {renderSection6()}
          {renderSection7()}
          {renderSection8()}
        </div>

        {/* SIDEBAR */}
        <div className="hidden lg:block flex-grow mt-14 lg:mt-0">
          <div className="sticky top-28">{renderSidebar()}</div>
        </div>
      </main>

      {/* MODAL GALLERY */}
      <ModalPhotos
        photos={PHOTOS}
        isOpen={isModalPhotoOpen}
        onClose={handleCloseModalImageGallery}
        initIndex={0}
        uniqueClassName="nc-ListingStayDetailPage-modalPhotos"
      />

      {/* MODAL AMENITIES */}
      {renderModalAmenities()}
    </div>
  );
};

export default ListingStayDetailPage;
