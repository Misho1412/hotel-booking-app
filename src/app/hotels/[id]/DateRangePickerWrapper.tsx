"use client";

import React, { useEffect, useState } from "react";
import StayDatesRangeInput from "@/app/(listing-detail)/listing-stay-detail/StayDatesRangeInput";

export interface DateRangePickerWrapperProps {
  className?: string;
  initialStartDate?: Date;
  initialEndDate?: Date;
  onDateChange?: (startDate: Date, endDate: Date) => void;
}

const DateRangePickerWrapper: React.FC<DateRangePickerWrapperProps> = ({
  className = "",
  initialStartDate,
  initialEndDate,
  onDateChange
}) => {
  // Create a MutationObserver to watch for date changes within the StayDatesRangeInput
  useEffect(() => {
    const popoverEl = document.querySelector('.StayDatesRangeInput');
    if (!popoverEl) return;

    // Watch for changes in the date display text
    const dateTextObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          const dateTextEl = popoverEl.querySelector('.font-semibold');
          if (dateTextEl && dateTextEl.textContent) {
            const dateParts = dateTextEl.textContent.split(' - ');
            if (dateParts.length === 2) {
              try {
                // This is a simplified approach - may need more robust parsing
                const startDate = new Date(dateParts[0] + ", " + new Date().getFullYear());
                const endDate = new Date(dateParts[1] + ", " + new Date().getFullYear());
                
                // Notify parent component
                if (onDateChange && startDate && endDate) {
                  onDateChange(startDate, endDate);
                }
              } catch (error) {
                console.error("Error parsing dates:", error);
              }
            }
          }
        }
      });
    });

    // Start observing the date display for changes
    const dateDisplay = popoverEl.querySelector('.font-semibold');
    if (dateDisplay) {
      dateTextObserver.observe(dateDisplay, {
        childList: true,
        subtree: true,
      });
    }

    return () => {
      dateTextObserver.disconnect();
    };
  }, [onDateChange]);

  return (
    <StayDatesRangeInput className={className} />
  );
};

export default DateRangePickerWrapper; 