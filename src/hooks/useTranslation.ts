import { usePathname } from 'next/navigation';
import arabicMessages from '@/messages/ar/common.json';
import englishMessages from '@/messages/en/common.json';

// Import specific namespaces
import arSearch from '@/messages/ar/search.json';
import enSearch from '@/messages/en/search.json';
import arTabs from '@/messages/ar/tabs.json';
import enTabs from '@/messages/en/tabs.json';
import arMonths from '@/messages/ar/months.json';
import enMonths from '@/messages/en/months.json';
import arHome from '@/messages/ar/home.json';
import enHome from '@/messages/en/home.json';
import arFooter from '@/messages/ar/footer.json';
import enFooter from '@/messages/en/footer.json';

// Set to true to see translation debugging info in the console
const DEBUG_TRANSLATIONS = false;

type Namespace = 'common' | 'search' | 'tabs' | 'months' | 'home' | 'header' | 'footer' | string;

// Organize messages by namespace
const messages = {
  ar: {
    common: arabicMessages,
    search: arSearch || { 
      location: "الموقع",
      date: "التاريخ",
      guests: "الضيوف",
      search: "بحث",
      advanced: "بحث متقدم",
      addGuests: "إضافة ضيوف",
      adults: "البالغين",
      ages_13_or_above: "الأعمار 13 أو أكبر",
      children: "الأطفال",
      ages_2_12: "الأعمار 2-12",
      infants: "الرضع",
      under_2: "تحت سن 2",
      where_are_you_going: "إلى أين أنت ذاهب؟",
      addDates: "أضف تواريخ",
      checkin_checkout: "تسجيل الدخول - تسجيل الخروج",
      nights: "ليالٍ"
    },
    tabs: arTabs || {
      stays: "الإقامات",
      cars: "السيارات"
    },
    months: arMonths || {
      january: "يناير",
      february: "فبراير",
      march: "مارس",
      april: "أبريل",
      may: "مايو",
      june: "يونيو",
      july: "يوليو",
      august: "أغسطس",
      september: "سبتمبر",
      october: "أكتوبر",
      november: "نوفمبر",
      december: "ديسمبر"
    },
    // Header translations for Arabic
    header: {
      home: "الرئيسية",
      about: "عن الموقع",
      contact: "اتصل بنا",
      login: "تسجيل الدخول",
      signup: "إنشاء حساب",
      account: "الحساب",
      language: "اللغة",
      currency: "العملة"
    },
    // Home page translations
    home: arHome || {
      hero: {
        title: "ابحث عن إقامتك المثالية",
        subtitle: "اكتشف وقم بحجز أفضل أماكن الإقامة لرحلتك القادمة",
        search: "بحث"
      },
      featured: {
        title: "الوجهات المميزة",
        viewAll: "عرض الكل"
      },
      benefits: {
        title: "المميزات",
        subtitle: "المدن النشطة"
      },
      howItWorks: {
        title: "كيف يعمل",
        subtitle: "حافظ على هدوئك واستمتع بالسفر",
        bookAndRelax: {
          title: "احجز واسترخي",
          description: "اجعل كل رحلة رحلة ملهمة، وكل غرفة مساحة هادئة"
        },
        smartChecklist: {
          title: "قائمة تحقق ذكية",
          description: "اجعل كل رحلة رحلة ملهمة، وكل غرفة مساحة هادئة"
        },
        saveMore: {
          title: "وفر المزيد",
          description: "اجعل كل رحلة رحلة ملهمة، وكل غرفة مساحة هادئة"
        }
      }
    },
    // Footer translations
    footer: arFooter || {
      about: "من نحن",
      contact: "اتصل بنا",
      terms: "شروط الخدمة",
      privacy: "سياسة الخصوصية",
      copyright: "© 2023 إدارة الحجز عبر الإنترنت. جميع الحقوق محفوظة.",
      gettingStarted: "البدء",
      resources: "الموارد"
    }
  },
  en: {
    common: englishMessages,
    search: enSearch || {
      location: "Location",
      date: "Date",
      guests: "Guests",
      search: "Search",
      advanced: "Advanced Search",
      addGuests: "Add Guests",
      adults: "Adults",
      ages_13_or_above: "Ages 13 or above",
      children: "Children",
      ages_2_12: "Ages 2-12",
      infants: "Infants",
      under_2: "Under 2",
      where_are_you_going: "Where are you going?",
      addDates: "Add dates",
      checkin_checkout: "Check-in - Check-out",
      nights: "nights"
    },
    tabs: enTabs || {
      stays: "Stays",
      cars: "Cars"
    },
    months: enMonths || {
      january: "January",
      february: "February",
      march: "March",
      april: "April",
      may: "May",
      june: "June",
      july: "July",
      august: "August",
      september: "September",
      october: "October",
      november: "November",
      december: "December"
    },
    // Header translations for English
    header: {
      home: "Home",
      about: "About",
      contact: "Contact",
      login: "Login",
      signup: "Sign Up",
      account: "Account",
      language: "Language",
      currency: "Currency"
    },
    // Home page translations
    home: enHome || {
      hero: {
        title: "Find Your Perfect Stay",
        subtitle: "Discover and book the best accommodations for your next trip",
        search: "Search"
      },
      featured: {
        title: "Featured Destinations",
        viewAll: "View All"
      },
      benefits: {
        title: "Benefits",
        subtitle: "Happening Cities"
      },
      howItWorks: {
        title: "How it works",
        subtitle: "Keep calm & travel on",
        bookAndRelax: {
          title: "Book & relax",
          description: "Let each trip be an inspirational journey, each room a peaceful space"
        },
        smartChecklist: {
          title: "Smart checklist",
          description: "Let each trip be an inspirational journey, each room a peaceful space"
        },
        saveMore: {
          title: "Save more",
          description: "Let each trip be an inspirational journey, each room a peaceful space"
        }
      }
    },
    // Footer translations
    footer: enFooter || {
      about: "About Us",
      contact: "Contact Us",
      terms: "Terms of Service",
      privacy: "Privacy Policy",
      copyright: "© 2023 Online Booking Management. All rights reserved.",
      gettingStarted: "Getting Started",
      resources: "Resources"
    }
  }
};

function getNestedProperty(obj: any, path: string) {
  if (!obj) return undefined;
  return path.split('.').reduce((acc, part) => 
    acc && acc[part] !== undefined ? acc[part] : undefined, obj);
}

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
export default function useTranslation(namespace: Namespace = 'common') {
  const pathname = usePathname();
  const isArabic = pathname?.startsWith('/ar');
  const lang = isArabic ? 'ar' : 'en';
  
  // Get translations for the specified namespace
  const translations = messages[lang][namespace] || {};
  
  if (DEBUG_TRANSLATIONS) {
    console.log(`[Translation Debug] Using namespace: ${namespace}`);
    console.log(`[Translation Debug] Language: ${lang}`);
    console.log(`[Translation Debug] Available translations:`, translations);
  }
  
  const t = (key: string, params?: Record<string, string>): string => {
    try {
      // Check if the key contains dots for nested objects
      let translation;
      let source = 'primary';
      
      if (key.includes('.')) {
        // Try from current namespace first
        translation = getNestedProperty(translations, key);
        
        // If not found and it's a hero key, try from home namespace
        if (translation === undefined && namespace !== 'home' && key.startsWith('hero.')) {
          translation = getNestedProperty(messages[lang].home, key);
          source = 'fallback';
        }
      } else {
        translation = translations ? translations[key] : undefined;
      }
      
      if (DEBUG_TRANSLATIONS) {
        console.log(`[Translation Debug] Key: "${key}", Result: "${translation}", Source: ${source}`);
      }
      
      if (translation === undefined) {
        console.warn(`Translation key "${key}" not found in namespace "${namespace}"`);
        return key;
      }
      
      if (params) {
        return Object.entries(params).reduce(
          (acc, [paramKey, paramValue]) => 
            acc.replace(new RegExp(`{{${paramKey}}}`, 'g'), paramValue),
          translation
        );
      }
      
      return translation;
    } catch (error) {
      console.error(`Translation error for key "${key}" in namespace "${namespace}":`, error);
      return key;
    }
  };
  
  return t;
} 