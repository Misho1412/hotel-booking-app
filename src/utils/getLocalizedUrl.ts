/**
 * Returns a localized URL based on the current locale
 * @param path The path (without locale prefix)
 * @param locale The locale to use
 */
export function getLocalizedUrl(path: string, locale?: string | null): string {
  // If locale is not provided, default to empty string which will use the default locale
  const localePrefix = locale ? `/${locale}` : '';
  
  // If path already starts with a locale, don't prefix it again
  if (path.startsWith('/en/') || path.startsWith('/ar/')) {
    return path;
  }
  
  // Ensure the path starts with a slash
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${localePrefix}${normalizedPath}`;
} 