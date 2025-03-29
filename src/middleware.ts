import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/settings';


export default createMiddleware({

  locales,
  defaultLocale,
  localePrefix: 'always',
  localeDetection: true
});

export const config = {
  matcher: [
    // - All paths that begin with /api, _next, _vercel, images, public or have a '.' in them
    '/((?!api|_next|_vercel|.*\\..*|images|public).*)'
  ]
}; 