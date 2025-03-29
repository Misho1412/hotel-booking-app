/**
 * This utility function loads the translation messages for a given locale.
 * It dynamically imports the messages from the appropriate JSON file and combines translations if needed.
 */
export async function getMessages(locale: string) {
  try {
    // First try to load messages from i18n/messages directory
    try {
      // First try direct access to the JSON file in i18n/messages
      const messages = (await import(`./messages/${locale}.json`)).default;
      console.log(`Successfully loaded messages from ./messages/${locale}.json`);
      return messages;
    } catch (error1) {
      console.log(`Could not load from ./messages/${locale}.json, trying next path...`);
      
      try {
        // Then try to access the JSON file directly from i18n/messages/{locale}.json
        const messages = (await import(`./messages/${locale}/common.json`)).default;
        console.log(`Successfully loaded messages from ./messages/${locale}/common.json`);
        return messages;
      } catch (error2) {
        console.log(`Could not load from ./messages/${locale}/common.json, trying next path...`);
        
        try {
          // Then try to access the JSON file from messages/{locale}/common.json
          const messages = (await import(`../messages/${locale}/common.json`)).default;
          console.log(`Successfully loaded messages from ../messages/${locale}/common.json`);
          return messages;
        } catch (error3) {
          console.log(`Could not load from ../messages/${locale}/common.json, falling back to English...`);
          
          if (locale !== 'en') {
            console.log('Falling back to English messages');
            return getMessages('en');
          }
          
          // If even English fails, return an empty object
          console.error('Failed to load any translation files. Using empty messages.');
          return {};
        }
      }
    }
  } catch (outerError) {
    console.error(`Unexpected error loading messages for locale ${locale}:`, outerError);
    
    // Final fallback - empty object
    return {};
  }
} 