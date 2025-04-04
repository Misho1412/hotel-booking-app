"use client";

import React, { useEffect } from "react";
import GuestsInput from "@/app/(listing-detail)/listing-stay-detail/GuestsInput";

export interface GuestPickerWrapperProps {
  className?: string;
  onGuestChange?: (guestCount: number) => void;
}

const GuestPickerWrapper: React.FC<GuestPickerWrapperProps> = ({
  className = "",
  onGuestChange
}) => {
  // Create a MutationObserver to watch for guest changes within the GuestsInput
  useEffect(() => {
    const popoverEl = document.querySelector('form .flex.relative');
    if (!popoverEl) return;

    // Watch for changes in the guest display text
    const guestTextObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          const guestTextEl = popoverEl.querySelector('.font-semibold');
          if (guestTextEl && guestTextEl.textContent) {
            // Extract the guest count (expected format: "4 Guests")
            const text = guestTextEl.textContent.trim();
            const match = text.match(/^(\d+)/);
            if (match && match[1]) {
              const guestCount = parseInt(match[1], 10);
              if (!isNaN(guestCount) && onGuestChange) {
                onGuestChange(guestCount);
              }
            }
          }
        }
      });
    });

    // Start observing the guest display for changes
    const guestDisplay = popoverEl.querySelector('.font-semibold');
    if (guestDisplay) {
      guestTextObserver.observe(guestDisplay, {
        childList: true,
        subtree: true,
      });
    }

    return () => {
      guestTextObserver.disconnect();
    };
  }, [onGuestChange]);

  return (
    <GuestsInput className={className} />
  );
};

export default GuestPickerWrapper; 