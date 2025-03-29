import { useTranslations as useNextIntlTranslations } from 'next-intl';

/**
 * A custom hook that simplifies the use of translations throughout the application.
 * 
 * @param namespace The translation namespace to use (optional, defaults to 'common')
 * @returns A function that can be used to get translations
 * 
 * @example
 * // In a component:
 * const t = useTranslation('header');
 * return <h1>{t('title')}</h1>;
 */
export function useTranslation(namespace: string = 'common') {
  try {
    const t = useNextIntlTranslations(namespace);
    return t;
  } catch (error) {
    // Fallback for when the context isn't available
    return (key: string) => key;
  }
}

export default useTranslation; 