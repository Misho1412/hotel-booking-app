import React, { FC, useState, useEffect } from "react";
import { TaxonomyType } from "@/data/types";
import convertNumbThousand from "@/utils/convertNumbThousand";
import Link from "next/link";
import Image from "next/image";
import useTranslation from "@/hooks/useTranslation";

export interface CardCategory4Props {
  className?: string;
  taxonomy: TaxonomyType;
}

const CardCategory4: FC<CardCategory4Props> = ({
  className = "",
  taxonomy,
}) => {
  const { count, name, href = "/", thumbnail, listingType } = taxonomy;
  const [mounted, setMounted] = useState(false);
  const t = useTranslation('home');
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Get the translated "properties" text
  const getPropertyText = () => {
    if (!mounted) {
      return (!listingType || listingType === "stay") ? "properties" : 
             (listingType === "car" ? "cars" : "experiences");
    }
    
    if (!listingType || listingType === "stay") {
      return t('suggestions.propertyTypes.properties');
    }
    if (listingType === "car") return "cars";
    if (listingType === "experiences") return "experiences";
    return "properties";
  };
  
  return (
    <Link
      href={href}
      className={`nc-CardCategory4 flex flex-col ${className}`}
      data-nc-id="CardCategory4"
    >
      <div
        className={`flex-shrink-0 relative w-full aspect-w-5 aspect-h-5 sm:aspect-h-6 h-0 rounded-2xl overflow-hidden group`}
      >
        <Image
          src={thumbnail || ""}
          className="object-cover w-full h-full rounded-2xl"
          fill
          alt="archive"
          sizes="(max-width: 400px) 100vw, 400px"
        />
        <span className="opacity-0 group-hover:opacity-100 absolute inset-0 bg-black bg-opacity-10 transition-opacity"></span>
      </div>
      <div className="mt-4 px-2 truncate text-center">
        <h2
          className={`text-base sm:text-lg text-neutral-900 dark:text-neutral-100 font-medium truncate`}
        >
          {name}
        </h2>
        <span
          className={`block mt-2 text-sm text-neutral-6000 dark:text-neutral-400`}
        >
          {convertNumbThousand(count || 0)}
          {` `}
          {getPropertyText()}
        </span>
      </div>
    </Link>
  );
};

export default CardCategory4;
