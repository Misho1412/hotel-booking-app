import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/settings';

// This middleware intercepts requests and adds locale information
export default createMiddleware({
  // A list of all locales that are supported
  locales,
  // The default locale to use when visiting a non-localized route
  defaultLocale,
  // Always prefix paths with the locale (simplifies routing)
  localePrefix: 'always',
  // If a locale prefix is missing, redirect to the prefixed path
  localeDetection: true
});

export const config = {
  // Match only internationalized pathnames, but exclude specific paths
  matcher: [
    // Match all pathnames except for:
    // - All paths that begin with /api, _next, _vercel, images, public or have a '.' in them
    '/((?!api|_next|_vercel|.*\\..*|images|public).*)'
  ]
}; 