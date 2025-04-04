import React, { FC, ReactNode } from "react";
import { 
  ExclamationTriangleIcon, 
  InformationCircleIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";

export interface AlertProps {
  children: ReactNode;
  type?: "error" | "success" | "warning" | "info";
  className?: string;
}

const Alert: FC<AlertProps> = ({
  children,
  className = "",
  type = "info",
}) => {
  const renderIcon = () => {
    switch (type) {
      case "error":
        return (
          <ExclamationTriangleIcon
            className="h-5 w-5 text-red-500 flex-shrink-0"
            aria-hidden="true"
          />
        );
      case "success":
        return (
          <CheckCircleIcon
            className="h-5 w-5 text-green-500 flex-shrink-0"
            aria-hidden="true"
          />
        );
      case "warning":
        return (
          <ExclamationTriangleIcon
            className="h-5 w-5 text-yellow-500 flex-shrink-0"
            aria-hidden="true"
          />
        );
      case "info":
      default:
        return (
          <InformationCircleIcon
            className="h-5 w-5 text-blue-500 flex-shrink-0"
            aria-hidden="true"
          />
        );
    }
  };

  let alertColor;
  switch (type) {
    case "error":
      alertColor = "text-red-800 bg-red-50 dark:bg-red-900/30 dark:text-red-200";
      break;
    case "success":
      alertColor = "text-green-800 bg-green-50 dark:bg-green-900/30 dark:text-green-200";
      break;
    case "warning":
      alertColor = "text-yellow-800 bg-yellow-50 dark:bg-yellow-900/30 dark:text-yellow-200";
      break;
    case "info":
    default:
      alertColor = "text-blue-800 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-200";
      break;
  }

  return (
    <div className={`rounded-lg p-4 ${alertColor} ${className}`}>
      <div className="flex items-start">
        <div className="mr-3 pt-0.5">{renderIcon()}</div>
        <div className="text-sm font-medium">{children}</div>
      </div>
    </div>
  );
};

export default Alert; 