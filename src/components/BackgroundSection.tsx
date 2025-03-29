import React, { FC } from "react";

export interface BackgroundSectionProps {
  className?: string;
  children?: React.ReactNode;
}

const BackgroundSection: FC<BackgroundSectionProps> = ({
  className = "bg-neutral-100 dark:bg-black dark:bg-opacity-20 ",
  children,
}) => {
  // Return children directly without the enclosing div
  return <>{children}</>;
};

export default BackgroundSection;
