import React from "react";
import { ReactNode } from "react";
import useTranslation from "@/hooks/useTranslation";
import { usePathname } from "next/navigation";

export interface Heading2Props {
  heading?: ReactNode;
  subHeading?: ReactNode;
  className?: string;
}

const Heading2: React.FC<Heading2Props> = ({
  className = "",
  heading,
  subHeading,
}) => {
  const pathname = usePathname();
  const isArabic = pathname?.startsWith('/ar');
  const t = useTranslation('stay-listing');

  // Set default heading based on translations
  const defaultHeading = isArabic ? t('pageTitle') : "Stays in Saudi Arabia";
  const defaultSubHeading = isArabic ? (
    <span className="block text-neutral-500 dark:text-neutral-400 mt-3 text-right">
      {t('pageSubtitle')}
    </span>
  ) : (
    <span className="block text-neutral-500 dark:text-neutral-400 mt-3">
      233 stays
      <span className="mx-2">·</span>
      Aug 12 - 18
      <span className="mx-2">·</span>2 Guests
    </span>
  );

  return (
    <div className={`mb-12 lg:mb-16 ${className}`}>
      <h2 className="text-4xl font-semibold">{heading || defaultHeading}</h2>
      {subHeading || defaultSubHeading}
    </div>
  );
};

export default Heading2;
