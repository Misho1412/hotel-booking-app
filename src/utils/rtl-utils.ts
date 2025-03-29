"use client";

import { usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";

/**
 * Custom hook to determine if the current direction is RTL
 * @returns boolean indicating if the direction is RTL
 */
export function useIsRTL() {
  const pathname = usePathname();
  // Simple check - if pathname starts with /ar, it's RTL
  return useMemo(() => pathname?.startsWith('/ar') || false, [pathname]);
}

type MarginType = "marginLeft" | "marginRight";
type PaddingType = "paddingLeft" | "paddingRight";
type DirectionalClassType = "left" | "right" | "start" | "end";

/**
 * Utility function to provide direction-aware margin classes
 * @param left margin for LTR left / RTL right
 * @param right margin for LTR right / RTL left
 * @returns a string with the appropriate Tailwind classes
 */
export function useDirectionalMargin(
  ltrMargin: MarginType,
  rtlMargin: MarginType
): MarginType {
  const isRTL = useIsRTL();
  return isRTL ? rtlMargin : ltrMargin;
}

/**
 * Utility function to provide direction-aware padding classes
 * @param left padding for LTR left / RTL right
 * @param right padding for LTR right / RTL left
 * @returns a string with the appropriate Tailwind classes
 */
export function useDirectionalPadding(
  ltrPadding: PaddingType,
  rtlPadding: PaddingType
): PaddingType {
  const isRTL = useIsRTL();
  return isRTL ? rtlPadding : ltrPadding;
}

/**
 * Utility function to conditionally add RTL-specific classes
 * @param baseClasses the base classes to apply
 * @param rtlClasses classes to apply only when in RTL mode
 * @param ltrClasses classes to apply only when in LTR mode
 * @returns a string with the appropriate classes
 */
export function useDirectionalClasses(type: DirectionalClassType) {
  const isRTL = useIsRTL();
  
  const getDirectionalClass = useCallback((prefix: string, type: DirectionalClassType) => {
    if (type === "left" || type === "right") {
      return isRTL ? 
        (type === "left" ? `${prefix}-right` : `${prefix}-left`) : 
        `${prefix}-${type}`;
    } else if (type === "start" || type === "end") {
      return isRTL ? 
        (type === "start" ? `${prefix}-end` : `${prefix}-start`) : 
        `${prefix}-${type}`;
    }
    return `${prefix}-${type}`;
  }, [isRTL]);

  return {
    "text": getDirectionalClass("text", type),
    "float": getDirectionalClass("float", type),
    "mr": isRTL ? (type === "left" || type === "start" ? "ml" : "mr") : (type === "left" || type === "start" ? "mr" : "ml"),
    "ml": isRTL ? (type === "left" || type === "start" ? "mr" : "ml") : (type === "left" || type === "start" ? "ml" : "mr"),
    "pr": isRTL ? (type === "left" || type === "start" ? "pl" : "pr") : (type === "left" || type === "start" ? "pr" : "pl"),
    "pl": isRTL ? (type === "left" || type === "start" ? "pr" : "pl") : (type === "left" || type === "start" ? "pl" : "pr"),
    "border": getDirectionalClass("border", type),
    "rounded": getDirectionalClass("rounded", type),
  };
} 