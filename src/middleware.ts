import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/settings';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Create the next-intl middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
  localeDetection: true
});

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Special case for routes that need redirection to localized versions
  const pathsToRedirect = [
    '/listing-stay-detail', 
    '/listing-car-detail', 
    '/listing-experiences-detail',
    '/listing-stay-map',
    '/listing-stay',
    '/login',
    '/signup',
    '/forgot-password',
    '/hotels'
  ];
  
  const shouldRedirect = pathsToRedirect.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );
  
  if (shouldRedirect) {
    // Get locale from cookie or default to 'en'
    const locale = request.cookies.get('NEXT_LOCALE')?.value || defaultLocale;
    const newUrl = request.nextUrl.clone();
    newUrl.pathname = `/${locale}${pathname}`;
    return NextResponse.redirect(newUrl);
  }
  
  // For all other routes, use the next-intl middleware
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // - All paths that begin with /api, _next, _vercel, images, public or have a '.' in them
    '/((?!api|_next|_vercel|.*\\..*|images|public).*)'
  ]
}; 