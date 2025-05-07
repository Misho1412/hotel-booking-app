"use client";

import React, { FC, useState, useEffect, useRef } from "react";
import Image from "next/image";
import useTranslation from "@/hooks/useTranslation";

export interface SectionSubscribe2Props {
  className?: string;
}

const SectionSubscribe2: FC<SectionSubscribe2Props> = ({ className = "" }) => {
  const [mounted, setMounted] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const t = useTranslation('home');

  useEffect(() => {
    setMounted(true);
  }, []);

  const roomTypes = [
    {
      id: 1,
      title: "Single Room",
      image: "/images/Rooms/single.jpg"
    },
    {
      id: 2,
      title: "Double Room",
      image: "/images/Rooms/double.webp"
    },
    {
      id: 3,
      title: "Triple Room",
      image: "/images/Rooms/triple.jpg"
    },
    {
      id: 4,
      title: "Suite",
      image: "/images/Rooms/suit.jpg"
    }
  ];

  const nextSlide = () => {
    if (currentSlide < roomTypes.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <div
      className={`nc-SectionSubscribe2 relative bg-[#f0efef] py-16 ${className}`}
      data-nc-id="SectionSubscribe2"
    >
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto mb-12">
          <h2 
            className="text-3xl font-semibold mb-4 bg-gradient-to-r from-[#252525] to-[#6a6a6a] inline-block text-transparent bg-clip-text"
            data-aos="fade-up"
          >
            Browse by room type
          </h2>
          <p 
            className="text-[#252525] text-base"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            You can easily browse and filter your search by room type. This feature allows you to select hotel rooms based on your preferences and specific needs for your stay.
          </p>
        </div>

        <div className="relative">
          {/* Previous Button */}
          <button 
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full flex items-center justify-center bg-[#c9b396] text-white -ml-4 ${
              currentSlide === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-[#b9a386]'
            }`}
            data-aos="fade-right"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 19L8 12L15 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Room Cards */}
          <div 
            ref={sliderRef}
            className="flex flex-wrap justify-center gap-3 transition-all duration-300"
            data-aos="fade-up"
          >
            {roomTypes.map((room, index) => (
              <div 
                key={room.id}
                className="relative w-[240px] h-[400px] rounded-xl overflow-hidden group transition-all duration-300"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className="w-full h-full flex flex-col items-start">
  <h3 className="text-base font-medium text-[#252525] mb-2 bg-gradient-to-r from-[#252525] to-[#6a6a6a] text-transparent bg-clip-text">
    {room.title}
  </h3>
  <div className="relative w-full h-[400px]">
    <Image 
      src={room.image} 
      alt={room.title}
      fill
      className="object-cover rounded-xl transform transition-transform duration-300 group-hover:scale-105"
    />
    <div className="absolute inset-0   rounded-xl"></div>
  </div>
</div>

              </div>
            ))}
          </div>

          {/* Next Button */}
          <button 
            onClick={nextSlide}
            disabled={currentSlide >= roomTypes.length - 1}
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full flex items-center justify-center bg-[#c9b396] text-white -mr-4 ${
              currentSlide >= roomTypes.length - 1 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-[#b9a386]'
            }`}
            data-aos="fade-left"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 5L16 12L9 19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center mt-8 space-x-1.5">
          {roomTypes.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-1.5 rounded-full transition-all ${
                currentSlide === index ? 'bg-[#252525] w-8' : 'bg-[#cccccc]'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SectionSubscribe2;
