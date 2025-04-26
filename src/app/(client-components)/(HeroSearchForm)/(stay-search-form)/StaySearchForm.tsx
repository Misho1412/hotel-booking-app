import React, { FC, useState } from "react";
import Image from "next/image";
import useTranslation from "@/hooks/useTranslation";
import { useRouter, usePathname } from "next/navigation";
import LocationIcon from "@/components/icons/LocationIcon";

// Import SVG icons
import calendarIcon from "@/images/search-icons/calendar.svg";
import personIcon from "@/images/search-icons/person-2-wave-2.svg";
import controlIcon from "@/images/search-icons/control.svg";
import lineIcon from "@/images/search-icons/line-9.svg";

const cities = [
  { name: "Makkah", label: "Makkah", arLabel: "مكة المكرمة" },
  { name: "Madinah", label: "Madinah", arLabel: "المدينة المنورة" }
];

const StaySearchForm: FC<{}> = ({}) => {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslation('search');
  const isArabic = pathname?.startsWith('/ar');

  const [selectedCity, setSelectedCity] = useState(cities[0].name);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  
  const handleSearch = () => {
    router.push(`/listing-stay?city=${selectedCity}`);
  };
  
  return (
    <form className="relative flex h-full w-full">
      {/* Location Input */}
      <div className="absolute left-[30px] top-[1px] w-[380px] h-[60px]">
        <div 
          className="relative bg-[#252525] rounded-[12px] h-[62px] w-full shadow-[inset_-2px_4px_4px_rgba(0,0,0,0.25),inset_2px_0px_4px_rgba(0,0,0,0.25)] cursor-pointer"
          onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
        >
          <div className="absolute left-[23px] top-[10px]">
            <LocationIcon className="w-6 h-6 text-[#cccccc]" />
          </div>
          <div className="absolute left-[60px] top-[20px] text-[#cccccc] font-['Abhaya_Libre'] text-[18px]">
            {isArabic 
              ? cities.find(c => c.name === selectedCity)?.arLabel 
              : cities.find(c => c.name === selectedCity)?.label}
          </div>

          {/* Dropdown for location selection */}
          {isLocationDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-full bg-[#252525] rounded-lg shadow-lg z-50 border border-[#333333]">
              {cities.map((city) => (
                <div 
                  key={city.name}
                  className={`px-4 py-3 hover:bg-[#333333] cursor-pointer transition-colors ${selectedCity === city.name ? 'bg-[#333333]' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCity(city.name);
                    setIsLocationDropdownOpen(false);
                  }}
                >
                  <div className="flex items-center">
                    <LocationIcon className="w-5 h-5 text-amber-400 mr-2" />
                    <span className="text-[#cccccc]">{isArabic ? city.arLabel : city.label}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Date Range Input */}
      <div className="absolute left-[450px] top-[3.5px] w-[300px] h-[60px]">
        <div className="relative bg-[#252525] rounded-[12px] h-[60px] w-full shadow-[inset_-2px_4px_4px_rgba(0,0,0,0.25),inset_2px_0px_4px_rgba(0,0,0,0.25)]">
          <div className="absolute left-[14px] top-[17px]">
            <Image src={calendarIcon} alt="Calendar" width={28} height={26} />
          </div>
          <div className="absolute left-[60px] top-[20px] text-[#cccccc] font-['Abhaya_Libre'] text-[18px]">
            {t('checkIn') || 'Check in'}
          </div>
          <div className="absolute left-[180px] top-[20px] text-[#cccccc] font-['Abhaya_Libre'] text-[18px]">
            {t('checkOut') || 'Checkout'}
          </div>
          <div className="absolute left-[150px] top-0 h-[60px]">
            <Image src={lineIcon} alt="Line" width={2} height={60} />
          </div>
        </div>
      </div>

      {/* Guests Input */}
      <div className="absolute left-[770px] top-[3.5px] w-[200px] h-[60px]">
        <div className="relative bg-[#252525] rounded-[12px] h-[60px] w-full shadow-[inset_-2px_4px_4px_rgba(0,0,0,0.25),inset_2px_0px_4px_rgba(0,0,0,0.25)]">
          <div className="absolute left-[14px] top-[20px]">
            <Image src={personIcon} alt="Person" width={32} height={22} />
          </div>
          <div className="absolute left-[60px] top-[10px] text-[#cccccc] font-['Abhaya_Libre'] text-[18px]">
            {t('guests') || 'Guests'}
          </div>
          <div className="absolute left-[160px] top-[16px]">
            <Image src={controlIcon} alt="Control" width={24} height={24} />
          </div>
        </div>
      </div>

      {/* Search Button */}
      <div className="absolute left-[990px] top-[1px] w-[160px] h-[60px]">
        <button 
          type="button"
          onClick={handleSearch}
          className="bg-[#c49c74] hover:bg-[#d5ad85] transition-colors rounded-[12px] h-full w-full shadow-[inset_-2px_4px_4px_rgba(0,0,0,0.66),inset_2px_0px_4px_rgba(0,0,0,0.25)] flex items-center justify-center"
        >
          <div className="text-[#252525] font-['ABeeZee'] text-[18px]">
            {t('search') || 'Search'}
          </div>
        </button>
      </div>
    </form>
  );
};

export default StaySearchForm;
