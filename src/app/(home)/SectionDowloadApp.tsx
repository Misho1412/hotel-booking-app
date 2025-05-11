import React from "react";
import Image from "next/image";
import ButtonPrimary from "@/shared/ButtonPrimary";
import placeholder from "@/images/placeholder-large.png";

const SectionDowloadApp = () => {
  return (
    <div className="relative py-16">
      <div className="container">
        <div className="relative flex flex-col lg:flex-row items-center">
          <div className="flex-1 mb-10 lg:mb-0">
            <Image
              src={placeholder}
              alt="Download App"
              className="w-full max-w-lg mx-auto"
            />
          </div>
          <div className="flex-1 text-center lg:text-left lg:pl-16">
            <h2 className="font-semibold text-4xl md:text-5xl">
              Download the Chisfis App
            </h2>
            <span className="mt-5 text-neutral-500 dark:text-neutral-400 block">
              Book your perfect stay anytime, anywhere with our mobile app.
              Available for both iOS and Android devices.
            </span>
            <div className="flex space-x-3 mt-12 justify-center lg:justify-start">
              <ButtonPrimary href="#">
                <span>Download iOS App</span>
              </ButtonPrimary>
              <ButtonPrimary href="#">
                <span>Download Android App</span>
              </ButtonPrimary>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionDowloadApp; 