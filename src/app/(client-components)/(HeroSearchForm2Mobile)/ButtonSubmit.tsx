import React, { FC, useState, useEffect } from "react";
import { PathName } from "@/routers/types";
import useTranslation from "@/hooks/useTranslation";

interface Props {
  className?: string;
  onClick?: () => void;
  href?: PathName;
}
const ButtonSubmit: FC<Props> = ({
  className = "",
  onClick = () => {},
  href = "/listing-stay",
}) => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Client-side only translation
  const t = useTranslation('search');
  
  // Use a try-catch to handle translation errors
  let searchLabel = "Search";
  try {
    if (mounted) {
      searchLabel = t('search');
    }
  } catch (error) {
    searchLabel = "Search";
  }
  
  return (
    <button
      type="submit"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`flex-shrink-0 px-4 py-2.5 cursor-pointer rounded-xl bg-primary-6000 flex items-center justify-center text-neutral-50 focus:outline-none ${className} relative z-20`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <span suppressHydrationWarning className="ml-2">{searchLabel}</span>
    </button>
  );
};

export default ButtonSubmit;
