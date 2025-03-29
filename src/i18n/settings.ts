export const locales = ['en', 'ar'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale = 'en' as const;

export const localePrefix = 'always'; // Type: 'always' | 'as-needed' | 'never'

export function getDirection(locale: Locale) {
  return locale === 'ar' ? 'rtl' : 'ltr';
} 