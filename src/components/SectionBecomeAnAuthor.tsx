"use client";

import React, { FC, useState, useEffect } from "react";
import ButtonPrimary from "@/shared/ButtonPrimary";
import Image from "next/image";
import useTranslation from "@/hooks/useTranslation";
import { usePathname } from "next/navigation";
import Input from "@/shared/Input";
import Link from "next/link";
import { Route } from "@/routers/types";

export interface SectionBecomeAnAuthorProps {
  className?: string;
}

const SectionBecomeAnAuthor: FC<SectionBecomeAnAuthorProps> = ({
  className = "",
}) => {
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const t = useTranslation('home');
  const pathname = usePathname();
  const isArabic = pathname?.startsWith('/ar');

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log("Subscribing email:", email);
    // Reset form
    setEmail("");
  };

  const trendingDestinations = [
    {
      id: 1,
      name: isArabic ? "المدينة المنورة" : "Madina",
      image: "/images/madena.jpg",
      link: "/listing-stay?category=religious&city=Madinah" as Route<string>
    },
    {
      id: 2,
      name: isArabic ? "مكة المكرمة" : "Makkah",
      image: "/images/makah.jpg",
      link: "/listing-stay?category=religious&city=Makkah" as Route<string>
    }
  ];

  return (
    <div
      className="nc-SectionBecomeAnAuthor relative bg-[#252525] py-16"
      data-nc-id="SectionBecomeAnAuthor"
    >
            <div className="absolute top-[-24px] left-1/2 transform -translate-x-[33%] w-full max-w-[1012px] z-124">
        <svg 
          width="50%" 
          height="40%" 
          viewBox="0 0 1012 108" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          preserveAspectRatio="none"
        >
          <path 
            fillRule="evenodd" 
            clipRule="evenodd" 
            d="M448.195 9.82477e-06C671.116 -1.10291e-05 1044.73 -3.55688e-05 1009 3.8554e-05C953.621 0.000153433 935.083 30.4789 917.706 59.0483C902.378 84.2491 887.954 107.964 849.945 107.964L722.845 107.964L161.443 107.964C123.434 107.964 109.01 84.2491 93.6817 59.0483C76.3049 30.4789 57.7666 0.00016321 2.38801 4.83307e-05C-27.686 -1.40559e-05 232.223 -6.54995e-06 448.195 9.82477e-06Z" 
            fill="#FFFFFF" 
          />
        </svg>
      </div>


      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Newsletter Subscription */}
          <div className="space-y-8" data-aos="fade-up">
            <h2 className="text-4xl font-semibold text-[#f6f6f6]">
              Stay in the know
            </h2>
            <p className="text-[#cccccc] text-lg max-w-lg">
              Sign up to get marketing emails from Pixel.com, including promotions, rewards, travel experiences, and information about Pixel.com products and services.
            </p>
            
            <form onSubmit={handleSubmit} className="flex flex-col space-y-4 max-w-md">
              <Input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={handleEmailChange}
                className="bg-[#333333] text-white border-[#555555] h-12"
                required
              />
              
              <div className="mt-8">
                <button 
                  type="submit"
                  className="h-[70px] w-full md:w-[189px] bg-[#c49c74] hover:bg-[#b38c64] text-[#252525] font-medium text-lg rounded-xl transition-colors"
                >
                  Subscribe
                </button>
              </div>
            </form>
            
            <p className="text-[#999999] text-sm">
              You can opt out anytime. See our privacy statement.
            </p>
          </div>
          
          {/* Trending Destinations */}
          <div className="space-y-8" data-aos="fade-up" data-aos-delay="100">
            <div className="text-right">
              <h2 className="text-4xl font-semibold text-[#f6f6f6]">
                Trending destinations
              </h2>
              <p className="text-[#cccccc] mt-2">
                Most popular choices for travelers
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              {trendingDestinations.map((destination) => (
                <div key={destination.id} className="relative" data-aos="fade-left" data-aos-delay={destination.id * 100}>
                  <Link 
                    href={destination.link}
                    className="group block"
                  >
                    <div className="relative rounded-2xl overflow-hidden">
                      <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all duration-300"></div>
                      <Image 
                        src={destination.image}
                        alt={destination.name}
                        width={242}
                        height={152}
                        className="w-full h-[152px] object-cover rounded-2xl opacity-30 group-hover:opacity-40 transition-opacity duration-300"
                      />
                      <div className="absolute bottom-4 left-4">
                        <h3 className="text-3xl font-semibold text-white">
                          {destination.name}
                        </h3>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
            
            {/* Pagination Dots - Horizontal Line */}
            <div className="w-full flex justify-end mt-8">
              <div className="w-[200px] h-[9px] bg-[#202020] rounded-full relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1/3 bg-[#c49c74] rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionBecomeAnAuthor;
