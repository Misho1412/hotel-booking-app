import { StayDataType, TaxonomyType } from "@/data/types";
import { Route } from "@/routers/types";
import { IHotel, IHotelAmenity } from "./schemas/hotel";

// Default placeholder image - use an existing image from the project
const DEFAULT_IMAGE = "/vercel.svg";

// Define hotel directory paths for specific hotels
const HOTEL_IMAGE_DIRECTORIES = {
  'plaza-inn-ohud': '/images/hotels/plaza-inn-ohud/main.jpg',
  'grand-plaza-al-madinah': '/images/hotels/grand-plaza-al-madinah/main.jpg',
  'shaza-regency-plaza': '/images/hotels/shaza-regency-plaza/main.jpg',
  'maysan-rehab': '/images/hotels/maysan-rehab/main.jpg',
  'bakkah-royal': '/images/hotels/bakkah-royal/main.jpg',
  'kayan-al-sud': '/images/hotels/kayan-al-sud/main.jpg',
  'kayan-al-massi': '/images/hotels/kayan-al-massi/main.jpg',
  'grand-plaza-badr': '/images/hotels/grand-plaza-badr/main.jpg',
};

// Fallback generic hotel images
const GENERIC_HOTEL_IMAGES = [
  '/images/hotels/hotel1.jpg',
  '/images/hotels/hotel2.jpg',
  '/images/hotels/hotel3.jpg',
  '/images/hotels/hotel4.jpg',
  '/images/hotels/hotel5.jpg',
];

/**
 * Creates a default TaxonomyType object for hotel categories
 * @param category The category name
 * @returns A TaxonomyType object
 */
function createCategory(category: string): TaxonomyType {
  return {
    id: category.toLowerCase().replace(/\s+/g, '-'),
    name: category,
    href: `/listing-category/${category.toLowerCase().replace(/\s+/g, '-')}` as Route<string>,
    taxonomy: "category",
    listingType: "stay",
    count: 0,
    thumbnail: "",
    desc: "",
    color: "pink",
  };
}

/**
 * Ensures that a hotel has valid images, using hotel-specific or fallback images
 * @param hotel The hotel object to get images for
 * @param existingImages Existing images from the API
 * @returns An array of image URLs
 */
function ensureHotelImages(hotel: any, existingImages?: string[]): string[] {
  // If we have valid images, use them
  if (existingImages && existingImages.length > 0 && 
      existingImages.every(img => img && typeof img === 'string' && img.length > 0)) {
    return existingImages;
  }

  const hotelId = hotel.id || '';
  const hotelName = hotel.name || hotel.title || '';
  const hotelSlug = hotel.slug || '';
  
  // Try to find a specific hotel directory match
  // First check by slug
  let specificImagePath = null;
  
  if (hotelSlug) {
    const slug = hotelSlug.toLowerCase();
    for (const [key, path] of Object.entries(HOTEL_IMAGE_DIRECTORIES)) {
      if (slug.includes(key)) {
        specificImagePath = path;
        break;
      }
    }
  }
  
  // If not found by slug, try by name
  if (!specificImagePath && hotelName) {
    const name = hotelName.toLowerCase();
    for (const [key, path] of Object.entries(HOTEL_IMAGE_DIRECTORIES)) {
      if (name.includes(key.replace(/-/g, ' '))) {
        specificImagePath = path;
        break;
      }
    }
  }
  
  // If we found a specific hotel image, use it
  if (specificImagePath) {
    console.log(`Using specific hotel image for ${hotelName}: ${specificImagePath}`);
    
    // Create a gallery with the main image and some generic ones
    const additionalImages = [];
    const numAdditionalImages = 2 + Math.floor(Math.random() * 2); // 2-3 images
    
    for (let i = 0; i < numAdditionalImages; i++) {
      const randomIndex = Math.floor(Math.random() * GENERIC_HOTEL_IMAGES.length);
      additionalImages.push(GENERIC_HOTEL_IMAGES[randomIndex]);
    }
    
    return [specificImagePath, ...additionalImages];
  }
  
  // Otherwise use generic fallback images based on hotel ID
  const hotelIdNumber = typeof hotelId === 'string' ? parseInt(hotelId) || Date.now() : hotelId || Date.now();
  const fallbackIndex = Math.abs(hotelIdNumber) % GENERIC_HOTEL_IMAGES.length;
  const primaryImage = GENERIC_HOTEL_IMAGES[fallbackIndex];
  
  // Add 2-3 more random images for the gallery
  const additionalImages = [];
  const numAdditionalImages = 2 + Math.floor(Math.random() * 2); // 2-3 images
  
  for (let i = 0; i < numAdditionalImages; i++) {
    const randomIndex = Math.floor(Math.random() * GENERIC_HOTEL_IMAGES.length);
    if (GENERIC_HOTEL_IMAGES[randomIndex] !== primaryImage) {
      additionalImages.push(GENERIC_HOTEL_IMAGES[randomIndex]);
    }
  }
  
  return [primaryImage, ...additionalImages];
}

/**
 * Replace the existing ensureValidImagePaths function with our enhanced version
 * @param images Array of hotel image objects
 * @returns Array of valid image paths
 */
function ensureValidImagePaths(images: (string | any)[]): string[] {
  if (!images || !Array.isArray(images)) return [];
  
  return images
    .filter(img => {
      // Filter out null, undefined, and objects without proper image paths
      if (!img) return false;
      
      // Handle various image formats
      const imgStr = typeof img === 'string'
        ? img
        : (img.url || img.src || img.path || img.image || '');
      
      return imgStr && typeof imgStr === 'string' && imgStr.length > 0;
    })
    .map(img => {
      // Extract the actual image URL from different formats
      const imgStr = typeof img === 'string'
        ? img
        : (img.url || img.src || img.path || img.image || '');
      
      // Return the validated image string
      return imgStr;
    });
}

/**
 * Get an icon for a specific amenity type
 * @param amenityName The name of the amenity
 * @returns An icon path or component name
 */
function getAmenityIcon(amenityName: string): string {
  // Map amenity names to corresponding icons
  const amenityIconMap: Record<string, string> = {
    "WiFi": "la-wifi",
    "Pool": "la-swimming-pool",
    "Gym": "la-dumbbell",
    "Spa": "la-spa",
    "Restaurant": "la-utensils",
    "Bar": "la-glass-martini-alt",
    "Breakfast": "la-coffee",
    "Parking": "la-parking",
    "Pet Friendly": "la-dog",
    "Beach Access": "la-umbrella-beach",
    "Business Center": "la-briefcase",
    "Family Rooms": "la-users",
    "Garden": "la-leaf",
    "Playground": "la-child"
  };

  return amenityIconMap[amenityName] || "la-hotel";
}

/**
 * Determine hotel category based on star rating
 * @param starRating The star rating of the hotel
 * @returns A category name
 */
export function getHotelCategory(starRating: number): string {
  if (starRating >= 5) {
    return "Luxury";
  } else if (starRating >= 4) {
    return "Premium";
  } else if (starRating >= 3) {
    return "Standard";
  } else {
    return "Budget";
  }
}

// Add this before the result object creation:
interface ExtendedStayDataType extends StayDataType {
  city?: string;
  state?: string;
  country?: string;
}

/**
 * Converts a Hotel object from the API to a StayDataType used by UI components
 * @param hotel The hotel data from the API
 * @param isArabic Whether to translate content to Arabic
 * @returns A StayDataType object compatible with UI components
 */
export function hotelToStayData(hotel: IHotel | any, isArabic: boolean = false): StayDataType {
  try {
    if (!hotel || typeof hotel !== 'object') {
      console.error('Invalid hotel data provided to hotelToStayData:', hotel);
      throw new Error('Invalid hotel data structure');
    }

    // Log the hotel data for debugging
    console.log('Converting hotel to StayData:', hotel.id || 'unknown id', hotel.name || hotel.title || 'unknown name');
    
    // Process existing images if available
    let existingImages: string[] = [];
    if (hotel.images) {
      existingImages = ensureValidImagePaths(
        Array.isArray(hotel.images) ? hotel.images : [hotel.images]
      );
    }

    // Get hotel images with specific hotel image paths when available
    const galleryImgs = ensureHotelImages(hotel, existingImages);

    // Log the image paths for debugging
    console.log(`Hotel ${hotel.name || hotel.title || 'Unknown'} (${hotel.id || 'no-id'}) images:`, galleryImgs);
    
    // Default image is the first gallery image
    const featuredImage = galleryImgs[0];

    // Handle various API response formats
    const starRating = hotel.star_rating || hotel.rating || hotel.starRating || 3;
    const category = getHotelCategory(starRating);
    const listingCategory = createCategory(isArabic ? translateCategory(category) : category);
    
    // Format title - handle different API formats and translate if needed
    const originalTitle = hotel.name || hotel.title || `${category} Hotel`;
    const title = isArabic ? translateHotelName(originalTitle) : originalTitle;
    
    // Format address - handle different API formats and translate if needed
    let address = '';
    if (hotel.address) {
      if (typeof hotel.address === 'string') {
        address = hotel.address;
      } else {
        // Handle address object format
        const addressObj = hotel.address;
        const parts = [
          addressObj.address_line1,
          addressObj.address_line2,
          addressObj.city,
          addressObj.state,
          addressObj.country,
        ].filter(Boolean);
        address = parts.join(', ');
      }
    } else if (hotel.location) {
      // Handle location format
      const locationObj = hotel.location;
      const parts = [
        locationObj.address,
        locationObj.city,
        locationObj.state,
        locationObj.country,
      ].filter(Boolean);
      address = parts.join(', ');
    }
    
    // Translate address if Arabic is selected
    if (isArabic) {
      address = translateAddress(address);
    }
    
    // Format price - handle different API formats
    let price = '';
    if (hotel.price) {
      if (typeof hotel.price === 'string') {
        price = hotel.price.startsWith('$') ? hotel.price : `$${hotel.price}`;
      } else if (typeof hotel.price === 'number') {
        price = `$${hotel.price}`;
      } else if (hotel.price.amount) {
        price = `$${hotel.price.amount}`;
      }
    } else if (hotel.basePrice || hotel.base_price) {
      price = `$${hotel.basePrice || hotel.base_price}`;
    } else {
      // Calculate fallback price based on star rating
      const basePrice = starRating * 100;
      const discountPercentage = hotel.discount_percentage || 0;
      const calculatedPrice = discountPercentage > 0 
        ? basePrice * (1 - discountPercentage / 100) 
        : basePrice;
      price = `$${Math.round(calculatedPrice)}`;
    }
    
    // Get city, state, country from various API formats
    const city = (hotel.city || 
      (hotel.address && hotel.address.city) || 
      (hotel.location && hotel.location.city) || 
      '').toString();
      
    const state = (hotel.state || 
      (hotel.address && hotel.address.state) || 
      (hotel.location && hotel.location.state) || 
      '').toString();
      
    const country = (hotel.country || 
      (hotel.address && hotel.address.country) || 
      (hotel.location && hotel.location.country) || 
      '').toString();
    
    // Get coordinates for map
    const lat = hotel.latitude || 
      (hotel.address && hotel.address.latitude) || 
      (hotel.location && hotel.location.latitude) || 
      (hotel.coordinates && hotel.coordinates.lat) || 
      0;
      
    const lng = hotel.longitude || 
      (hotel.address && hotel.address.longitude) || 
      (hotel.location && hotel.location.longitude) || 
      (hotel.coordinates && hotel.coordinates.lng) || 
      0;
    
    // Safely check for amenities
    const amenities = hotel.amenities || [];
    
    // Create the StayDataType object
    const result: ExtendedStayDataType = {
      id: String(hotel.id || Date.now()),
      author: {
        id: String(hotel.id || Date.now()),
        firstName: "",
        lastName: "",
        displayName: title,
        avatar: featuredImage,
        bgImage: "",
        email: hotel.email || "",
        count: 0,
        href: `/author/${hotel.id}` as Route<string>,
        desc: hotel.description || "",
        jobName: "Hotel Owner",
      },
      date: hotel.created_at || hotel.createdAt || new Date().toISOString(),
      href: `/hotels/${hotel.id}` as Route<string>,
      title: title,
      featuredImage,
      commentCount: hotel.commentCount || hotel.comment_count || 0,
      viewCount: hotel.viewCount || hotel.view_count || 0,
      address: address || 'Address unavailable',
      reviewStart: starRating,
      reviewCount: hotel.reviewCount || hotel.review_count || 0,
      like: false,
      galleryImgs,
      price,
      listingCategory,
      maxGuests: hotel.maxGuests || hotel.max_guests || 4,
      bedrooms: hotel.bedrooms || amenities.some((a: IHotelAmenity | string) => {
        if (typeof a === 'string') {
          return a.includes("Bedroom");
        }
        return a.name?.includes("Bedroom") || false;
      }) ? 2 : 1,
      bathrooms: hotel.bathrooms || amenities.some((a: IHotelAmenity | string) => {
        if (typeof a === 'string') {
          return a.includes("Bathroom");
        }
        return a.name?.includes("Bathroom") || false;
      }) ? 2 : 1,
      saleOff: hotel.discount_percentage ? `${hotel.discount_percentage}%` : "",
      isAds: Boolean(hotel.is_featured || hotel.isFeatured),
      map: { lat, lng },
      city,
      state, 
      country
    };
    
    console.log('Successfully converted hotel to StayData:', result.title);
    return result;
    
  } catch (error) {
    console.error('Error in hotelToStayData for hotel:', hotel?.id, error);
    
    // Return a fallback hotel entry rather than throwing
    return {
      id: String(hotel?.id || Date.now()),
      author: {
        id: 'error',
        firstName: "",
        lastName: "",
        displayName: "Error Loading Hotel",
        avatar: DEFAULT_IMAGE,
        bgImage: "",
        email: "",
        count: 0,
        href: `/hotels/${hotel?.id || 'error'}` as Route<string>,
        desc: "Error occurred while loading hotel data",
        jobName: "",
      },
      date: new Date().toISOString(),
      href: `/hotels/${hotel?.id || 'error'}` as Route<string>,
      title: hotel?.name || hotel?.title || "Error Loading Hotel",
      featuredImage: DEFAULT_IMAGE,
      commentCount: 0,
      viewCount: 0,
      address: "Address unavailable",
      reviewStart: 3,
      reviewCount: 0,
      like: false,
      galleryImgs: [DEFAULT_IMAGE],
      price: "$0",
      listingCategory: createCategory("Unknown"),
      maxGuests: 0,
      bedrooms: 0,
      bathrooms: 0,
      saleOff: "",
      isAds: false,
      map: { lat: 0, lng: 0 },
      city: "",
      state: "",
      country: ""
    } as ExtendedStayDataType;
  }
}

/**
 * Converts an array of Hotel objects to StayDataType objects
 * @param hotels Array of hotels from the API
 * @param isArabic Whether to translate content to Arabic
 * @returns Array of StayDataType objects for UI components
 */
export function hotelsToStayData(hotels: IHotel[] | any[], isArabic: boolean = false): StayDataType[] {
  console.log('==== hotelsToStayData ====');
  console.log('Total hotels in input:', hotels?.length);
  console.log('Translation mode:', isArabic ? 'Arabic' : 'English');
  
  if (!hotels || !Array.isArray(hotels)) {
    console.error('Invalid hotels data provided to hotelsToStayData:', 
      typeof hotels, 
      hotels === null ? 'null' : 'not null');
    return [];
  }
  
  if (hotels.length === 0) {
    console.warn('Empty hotels array provided to hotelsToStayData');
    return [];
  }
  
  if (hotels.length > 0) {
    console.log('First hotel keys:', Object.keys(hotels[0]));
  }
  
  try {
    // Convert each hotel and filter out any null/undefined results
    const results = hotels
      .map((hotel, index) => {
        try {
          console.log(`Converting hotel ${index + 1}/${hotels.length}: ID=${hotel?.id || 'unknown'}, Name=${hotel?.name || hotel?.title || 'unknown'}`);
          return hotelToStayData(hotel, isArabic);
        } catch (error) {
          console.error(`Error converting hotel ${index + 1}/${hotels.length}:`, 
            hotel?.id, 
            hotel?.name || hotel?.title,
            error);
          return null;
        }
      })
      .filter(Boolean) as StayDataType[];
    
    console.log(`Successfully converted ${results.length}/${hotels.length} hotels`);
    return results;
  } catch (error) {
    console.error('Fatal error in hotelsToStayData:', error);
    return [];
  }
}

/**
 * Translates a hotel name to Arabic
 * @param name The hotel name in English
 * @returns The translated name in Arabic
 */
function translateHotelName(name: string): string {
  // Map of common hotel names and their translations
  const hotelNameMap: Record<string, string> = {
    'Plaza Inn Ohud': 'فندق بلازا إن أحد',
    'Grand Plaza Al Madinah': 'جراند بلازا المدينة',
    'Shaza Regency Plaza': 'شذا ريجنسي بلازا',
    'Maysan Rehab': 'ميسان رحاب',
    'Bakkah Royal': 'بكة رويال فندق',
    'Kayan Al Sud': 'كيان السد فندق',
    'Kayan Al Massi': 'كيان الماسي فندق',
    'Grand Plaza Badr': 'جراند بلازا بدر',
    'Grand Plaza Al Maqam': 'جراند بلازا المقام',
    'Al Mysk': 'الميسك',
    'Hotel': 'فندق',
    'Resort': 'منتجع',
    'Inn': 'نُزل',
    'Palace': 'قصر',
    'Luxury': 'فاخر',
    'Premium': 'ممتاز',
    'Standard': 'قياسي',
    'Budget': 'اقتصادي'
  };

  // Check for exact match first
  if (hotelNameMap[name]) {
    return hotelNameMap[name];
  }

  // If no exact match, try to translate word by word
  let translatedName = name;
  
  // Replace hotel category terms
  Object.entries(hotelNameMap).forEach(([english, arabic]) => {
    // Use word boundary to ensure we're replacing whole words
    const regex = new RegExp(`\\b${english}\\b`, 'gi');
    translatedName = translatedName.replace(regex, arabic);
  });
  
  // For hotels that don't end with "Hotel" or similar word in English
  // but should have "فندق" in Arabic, append it if not already present
  if (!translatedName.includes('فندق') && 
      !translatedName.includes('منتجع') && 
      !translatedName.includes('نُزل') && 
      !translatedName.includes('قصر')) {
    
    // Check if it's a known hotel name pattern
    if (translatedName.includes('كيان') || 
        translatedName.includes('بكة') || 
        translatedName.includes('الميسك')) {
      translatedName = `${translatedName} فندق`;
    }
  }
  
  return translatedName;
}

/**
 * Translates hotel categories to Arabic
 * @param category The category in English
 * @returns The translated category in Arabic
 */
function translateCategory(category: string): string {
  const categoryMap: Record<string, string> = {
    'Luxury': 'فاخر',
    'Premium': 'ممتاز',
    'Standard': 'قياسي',
    'Budget': 'اقتصادي',
    'Religious': 'ديني',
    'Unknown': 'غير معروف'
  };
  
  return categoryMap[category] || category;
}

/**
 * Translates address to Arabic
 * @param address The address in English
 * @returns The translated address in Arabic
 */
function translateAddress(address: string): string {
  // Map of common address terms and their translations
  const addressMap: Record<string, string> = {
    'Makkah': 'مكة المكرمة',
    'Makkah Al-Mukarramah': 'مكة المكرمة',
    'Madinah': 'المدينة المنورة',
    'Madina': 'المدينة المنورة',
    'Al-Madinah': 'المدينة المنورة',
    'Al-Madinah Al-Munawwarah': 'المدينة المنورة',
    'Saudi Arabia': 'المملكة العربية السعودية',
    'Street': 'شارع',
    'St.': 'شارع',
    'Avenue': 'جادة',
    'Ave.': 'جادة',
    'Road': 'طريق',
    'Rd.': 'طريق',
    'King': 'الملك',
    'District': 'حي',
    'Near': 'بالقرب من',
    'Haram': 'الحرم',
    'Central': 'المركزي',
    'Airport': 'المطار',
    'First': 'الأول',
    'Second': 'الثاني',
    'Third': 'الثالث',
    'Dar Al': 'دار ال',
    'Al-Naqa': 'النقا',
    'Faisal': 'فيصل',
    'Bada\'ah': 'البداءة',
    'Ibrahim': 'إبراهيم',
    'Al Khalil': 'الخليل',
    'Ibn': 'بن',
    'Malik': 'مالك',
    'Anas': 'أنس',
    'Abu': 'أبو',
    'Ayyub': 'أيوب',
    'Al-Ansari': 'الأنصاري',
    'Ring': 'الدائري'
  };
  
  let translatedAddress = address;
  
  // Replace address terms
  Object.entries(addressMap).forEach(([english, arabic]) => {
    const regex = new RegExp(`\\b${english}\\b`, 'gi');
    translatedAddress = translatedAddress.replace(regex, arabic);
  });
  
  return translatedAddress;
}