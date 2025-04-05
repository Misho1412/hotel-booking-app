"use client";

import React, { FC } from "react";
import ButtonPrimary from "@/shared/ButtonPrimary";
import Image from "next/image";
import heroRightImg from "@/images/hero-right.png";

export interface SectionHeroProps {
    className?: string;
}

const SectionHero: FC<SectionHeroProps> = ({ className = "" }) => {
    return (
        <div
            className={`nc-SectionHero flex flex-col-reverse lg:flex-col relative ${className}`}
        >
            <div className="flex flex-col lg:flex-row lg:items-center">
                <div className="flex-shrink-0 lg:w-1/2 flex flex-col items-start space-y-8 sm:space-y-10 pb-14 lg:pb-64 xl:pr-14 lg:mr-10 xl:mr-0">
                    <h2 className="font-medium text-4xl md:text-5xl xl:text-7xl !leading-[114%] ">
                        Discover Amazing Places
                    </h2>
                    <span className="text-base md:text-lg text-neutral-500 dark:text-neutral-400">
                        Explore unique accommodations from private homes to boutique hotels, discover
                        beautiful destinations, and book your stay with ease.
                    </span>
                    <ButtonPrimary>Start your search</ButtonPrimary>
                </div>
                <div className="flex-grow">
                    <Image
                        className="w-full"
                        src={heroRightImg}
                        alt="hero"
                        priority
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
                    />
                </div>
            </div>
        </div>
    );
};

export default SectionHero; 