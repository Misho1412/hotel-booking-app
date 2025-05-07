"use client";

import React, { FC } from "react";
import Link from "next/link";
import { StayDataType } from "@/data/types";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface FeaturedHotelCardProps {
  data: StayDataType;
  className?: string;
}

const FeaturedHotelCard: FC<FeaturedHotelCardProps> = ({
  data,
  className = "",
}) => {
  const {
    title,
    href,
    price,
    galleryImgs,
    bedrooms,
    reviewStart,
  } = data;

  // Get the first image for the featured image
  const featuredImage = galleryImgs?.[0] || "/images/placeholder.jpg";
  
  // Calculate size in square meters (fictional data for display)
  const sizeInSqMeters = 40 + (bedrooms * 20); // Just a formula to generate reasonable room sizes

  return (
    <div className={cn("group", className)}>
      {/* Card Container */}
      <div className="relative w-full space-y-4">
        {/* Hotel Card with Image */}
        <div className="relative w-full h-[336px] rounded-3xl overflow-hidden shadow-xl transition-all duration-300 group-hover:shadow-amber-400/30">
          {/* Background Image */}
          <Image
            src={featuredImage}
            alt={title}
            fill
            className="object-cover rounded-3xl"
          />
          
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/30 rounded-3xl border-2 border-amber-400 shadow-lg shadow-amber-400/20"></div>
          
          {/* Rating Badge */}
          <div className="absolute left-5 top-5 bg-white/30 backdrop-blur-xl rounded-full py-1.5 px-3 flex items-center gap-1.5">
            <div className="size-3 rounded-full bg-amber-500 animate-pulse" />
            <div className="text-white flex items-center">
              <svg
                className="w-4 h-4 text-amber-400 mr-1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                  clipRule="evenodd"
                />
              </svg>
              {reviewStart?.toFixed(2) || "4.93"}
            </div>
          </div>
          
          {/* Like Icon */}
          <div className="absolute right-5 top-5 bg-transparent p-2 rounded-full">
            <svg 
              className="w-6 h-6 stroke-white"
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
          
          {/* Slider Dots */}
          <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex space-x-2">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-white/70 rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-white/70 rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-white/70 rounded-full"></div>
          </div>
        </div>
        
        {/* Content below the card */}
        <div className="px-1">
          {/* Title and Price */}
          <div className="flex justify-between items-start">
            <Link 
              href={href} 
              className="text-lg font-semibold line-clamp-1 text-neutral-900 dark:text-neutral-100 hover:text-amber-600"
            >
              {title}
            </Link>
            <span className="text-lg font-semibold text-amber-600">
              {price}
            </span>
          </div>
          
          {/* Per month text */}
          <div className="flex justify-end">
            <span className="text-xs text-neutral-500">per night</span>
          </div>
          
          {/* Room details */}
          <div className="flex items-center space-x-4 mt-2">
            <div className="flex items-center text-neutral-500">
              <div className="w-5 h-5 mr-1 flex items-center justify-center">
                <svg 
                  className="w-5 h-5 text-neutral-700 dark:text-neutral-300" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    d="M22 12C22 8.22876 22 6.34315 20.8284 5.17157C19.6569 4 17.7712 4 14 4H10C6.22876 4 4.34315 4 3.17157 5.17157C2 6.34315 2 8.22876 2 12C2 15.7712 2 17.6569 3.17157 18.8284C4.34315 20 6.22876 20 10 20H14C17.7712 20 19.6569 20 20.8284 18.8284C22 17.6569 22 15.7712 22 12Z" 
                    stroke="currentColor" 
                    strokeWidth="1.5"
                  />
                  <path 
                    d="M16 4V7.5C16 8.32843 16 8.74264 15.8713 9.06815C15.7819 9.30553 15.6354 9.51839 15.4472 9.68662C15.162 9.93978 14.7405 9.9995 13.8975 10.1189C13.2547 10.211 12.9333 10.257 12.605 10.194C12.3654 10.1482 12.1411 10.0533 11.9481 9.91677C11.6692 9.72793 11.4783 9.43871 11.0966 8.86027L10.9069 8.57701C10.5604 8.05158 10.3872 7.78887 10.1553 7.62177C10.0105 7.51045 9.84968 7.42488 9.67767 7.36968C9.40325 7.28506 9.10242 7.28506 8.50077 7.28506H7.5C6.67157 7.28506 6.25736 7.28506 5.93185 7.15635C5.69447 7.06693 5.48161 6.92042 5.31338 6.73223C5.06022 6.44709 5.0005 6.02556 4.88105 5.18251L4.83964 4.95406" 
                    stroke="currentColor" 
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
              <span className="text-sm">{bedrooms} bedrooms</span>
            </div>
            
            <div className="flex items-center text-neutral-500">
              <div className="w-5 h-5 mr-1 flex items-center justify-center">
                <svg 
                  className="w-5 h-5 text-neutral-700 dark:text-neutral-300" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    d="M4 20V14.3301C4 13.8523 4 13.6134 4.06815 13.3954C4.12863 13.2031 4.22152 13.0247 4.34202 12.8687C4.48169 12.6909 4.67473 12.5582 5.06081 12.2929L11.0608 8.0929C11.6109 7.7111 11.8859 7.5202 12.1789 7.44709C12.4372 7.3835 12.7055 7.3835 12.9638 7.44709C13.2569 7.5202 13.5319 7.7111 14.0819 8.0929L20.0819 12.2929C20.468 12.5582 20.661 12.6909 20.8007 12.8687C20.9212 13.0247 21.0141 13.2031 21.0746 13.3954C21.1427 13.6134 21.1427 13.8523 21.1427 14.3301V20" 
                    stroke="currentColor" 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                  <path 
                    d="M2 20H22" 
                    stroke="currentColor" 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                  <path 
                    d="M14.5 20V16C14.5 15.5858 14.5 15.3787 14.4142 15.2929C14.3284 15.2071 14.1213 15.2071 13.7071 15.2071H10.2929C9.87868 15.2071 9.67157 15.2071 9.58579 15.2929C9.5 15.3787 9.5 15.5858 9.5 16V20" 
                    stroke="currentColor" 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="text-sm">{sizeInSqMeters}m²</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedHotelCard; 