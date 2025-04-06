import React from "react";
import Image from "next/image";
import Link from "next/link";
import { StaticImageData } from "next/image";

export interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({
  className = "w-64",
}) => {
  return (
    <Link
      href="/"
      className={`ttnc-logo inline-block text-primary-6000 focus:outline-none focus:ring-0 ${className}`}
    >
      <Image
        src='/images/logo.png'
        alt="Pixelsoft Business Solutions"
        width={200}
        height={200}
        className="w-full h-auto"
        priority
      />
    </Link>
  );
};

export default Logo;
