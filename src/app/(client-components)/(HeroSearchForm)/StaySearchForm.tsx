import React, { FC, useState } from "react";
import { useTranslation } from "@/app/i18n/client";
import LocationIcon from "@/components/icons/LocationIcon";
import CalendarIcon from "@/components/icons/CalendarIcon";
import PersonIcon from "@/components/icons/PersonIcon";
import { useRouter } from "next/navigation";

export interface StaySearchFormProps {
  haveDefaultValue?: boolean;
}

const StaySearchForm: FC<StaySearchFormProps> = ({ haveDefaultValue = false }) => {
  const { t } = useTranslation("common");
  const router = useRouter();
  
  const [location, setLocation] = useState("");
  const [dates, setDates] = useState<[Date | null, Date | null]>([null, null]);
  const [guests, setGuests] = useState({
    adults: 0,
    children: 0,
    infants: 0,
  });

  // Function to handle search form submission
  const handleSearch = () => {
    // Navigate to search results page with query parameters
    router.push(`/hotels/?location=${location}`);
  };

  return (
    <form className="w-full h-full">
      <div className="flex h-full">
        {/* Location */}
        <div className="flex flex-1 relative border-r border-[#ffffff33]">
          <div className="flex items-center h-full pl-6">
            <LocationIcon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-grow flex items-center h-full pl-4">
            <div className="w-full">
              <label className="block text-sm text-[#ffffffcc] mb-1 font-['ABeeZee']">
                {t("location")}
              </label>
              <input
                className="w-full bg-transparent border-none text-white placeholder-[#ffffff80] focus:outline-none font-['ABeeZee']"
                placeholder="Makkah"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Check-in / Check-out */}
        <div className="flex flex-1 relative border-r border-[#ffffff33]">
          <div className="flex items-center h-full pl-6">
            <CalendarIcon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-grow flex items-center h-full pl-4">
            <div className="w-full">
              <label className="block text-sm text-[#ffffffcc] mb-1 font-['ABeeZee']">
                {t("check_in_out")}
              </label>
              <div className="text-white font-['ABeeZee']">
                {dates[0] && dates[1] 
                  ? `${dates[0].toLocaleDateString()} - ${dates[1].toLocaleDateString()}`
                  : t("select_date")}
              </div>
            </div>
          </div>
        </div>

        {/* Guests */}
        <div className="flex flex-1 relative border-r border-[#ffffff33]">
          <div className="flex items-center h-full pl-6">
            <PersonIcon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-grow flex items-center h-full pl-4">
            <div className="w-full">
              <label className="block text-sm text-[#ffffffcc] mb-1 font-['ABeeZee']">
                {t("guests")}
              </label>
              <div className="text-white font-['ABeeZee']">
                {guests.adults + guests.children > 0
                  ? `${guests.adults + guests.children} ${t("guests")}${
                      guests.infants ? `, ${guests.infants} ${t("infants")}` : ""
                    }`
                  : t("add_guests")}
              </div>
            </div>
          </div>
        </div>

        {/* Search Button */}
        <div className="flex items-center justify-center w-[160px]">
          <button
            onClick={handleSearch}
            type="button"
            className="h-10 px-6 rounded-full font-['ABeeZee'] font-medium text-white bg-[#06B16E] hover:bg-[#059259] transition-colors"
          >
            {t("search")}
          </button>
        </div>
      </div>
    </form>
  );
};

export default StaySearchForm; 