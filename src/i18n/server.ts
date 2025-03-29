import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale } from './settings';

export default getRequestConfig(async ({ locale }) => {
  // Validate locale or use default
  const validLocale = locales.includes(locale as any) ? locale : defaultLocale;
  
  // Load messages for the current locale
  try {
    console.log(`Attempting to load messages for locale: ${validLocale}`);
    const messages = (await import(`./messages/${validLocale}.json`)).default;
    console.log(`Successfully loaded messages for locale: ${validLocale}`);
    return {
      locale: validLocale,
      messages
    };
  } catch (error) {
    console.error(`Error loading messages for locale ${validLocale} from primary path:`, error);
    
    // Try alternative path
    try {
      console.log(`Attempting to load messages from alternative path for locale: ${validLocale}`);
      const messages = (await import(`./messages/${validLocale}/common.json`)).default;
      console.log(`Successfully loaded messages from alternative path for locale: ${validLocale}`);
      return {
        locale: validLocale,
        messages
      };
    } catch (fallbackError) {
      console.error(`Error loading messages from alternative path for locale ${validLocale}:`, fallbackError);
      
      // Fallback to English if messages aren't available and current locale isn't English
      if (validLocale !== 'en') {
        try {
          console.log('Falling back to English messages');
          const enMessages = (await import('./messages/en.json')).default;
          return {
            locale: validLocale, // Keep the requested locale for UI purposes
            messages: enMessages
          };
        } catch (enError) {
          console.error('Failed to load fallback English messages:', enError);
        }
      }
      
      // Return empty messages as a last resort with the locale
      console.warn(`Using empty messages object for locale: ${validLocale}`);
      return { 
        locale: validLocale,
        messages: {} 
      };
    }
  }
}); 