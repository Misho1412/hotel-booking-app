import React from "react";
import Image from "next/image";
import placeholder from "@/images/placeholder-large.png";

const SectionAds = () => {
  return (
    <div className="nc-SectionAds relative">
      <div className="relative aspect-w-16 aspect-h-5 sm:aspect-h-3 lg:aspect-h-2">
        <Image
          fill
          className="object-cover"
          src={placeholder}
          alt="ads"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
    </div>
  );
};

export default SectionAds;
