"use client";

import React, { useEffect, ReactNode } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

interface AnimationProviderProps {
  children: ReactNode;
}

const AnimationProvider: React.FC<AnimationProviderProps> = ({ children }) => {
  useEffect(() => {
    // Initialize AOS
    AOS.init({
      // Global settings:
      duration: 800, // values from 0 to 3000, with step 50ms
      once: false, // whether animation should happen only once - while scrolling down
      easing: 'ease-out-cubic', // default easing for AOS animations
      offset: 50, // offset (in px) from the original trigger point
      delay: 0, // values from 0 to 3000, with step 50ms
      mirror: true, // whether elements should animate out while scrolling past them
    });
  }, []);

  // Refresh AOS when children change
  useEffect(() => {
    AOS.refresh();
  }, [children]);

  return <>{children}</>;
};

export default AnimationProvider; 