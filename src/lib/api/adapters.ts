import { StayDataType, TaxonomyType } from "@/data/types";
import { Route } from "@/routers/types";
import { IHotel } from "./schemas/hotel";

// Default placeholder image - use an existing image from the project
const DEFAULT_IMAGE = "/vercel.svg";

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
 * Ensures that image paths are valid and replaces invalid ones
 * @param images Array of hotel image objects
 * @returns Array of valid image paths
 */
function ensureValidImagePaths(images: { image: string }[] | undefined): string[] {
  if (!images || !Array.isArray(images) || images.length === 0) {
    // Return an array with a default image
    return [DEFAULT_IMAGE];
  }
  
  // Extract image paths, filter out empty strings and ensure proper paths
  const imagePaths = images
    .map(img => img.image)
    .filter(img => img && img.trim() !== '')
    .map(img => {
      // If img is already an absolute URL (starts with http:// or https://)
      if (img.startsWith('http://') || img.startsWith('https://')) {
        return img;
      }
      
      // If img is a valid relative path (starts with /)
      if (img.startsWith('/')) {
        return img;
      }
      
      // Otherwise, convert to a proper relative path
      return `/${img}`; 
    });
    
  return imagePaths.length > 0 ? imagePaths : [DEFAULT_IMAGE];
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

/**
 * Converts a Hotel object from the API to a StayDataType used by UI components
 * @param hotel The hotel data from the API
 * @returns A StayDataType object compatible with UI components
 */
export function hotelToStayData(hotel: IHotel | any): StayDataType {
  try {
    if (!hotel || typeof hotel !== 'object') {
      console.error('Invalid hotel data provided to hotelToStayData:', hotel);
      throw new Error('Invalid hotel data structure');
    }

    // Log the hotel data for debugging
    console.log('Converting hotel to StayData:', hotel.id || 'unknown id', hotel.name || hotel.title || 'unknown name');
    
    // Ensure we have valid image paths
    const images = hotel.images || [];
    const galleryImgs = ensureValidImagePaths(Array.isArray(images) ? images : [images]);
    
    // Default image is the first valid gallery image
    const featuredImage = galleryImgs[0];
    
    // Handle various API response formats for star rating
    const starRating = hotel.star_rating || hotel.rating || hotel.starRating || 3;
    const category = getHotelCategory(starRating);
    const listingCategory = createCategory(category);
    
    // Format address - handle different API formats
    let address = '';
    
    if (hotel.address) {
      if (typeof hotel.address === 'string') {
        address = hotel.address;
      } else {
        // Handle object format
        const addressObj = hotel.address;
        address = `${addressObj.address_line1 || addressObj.line1 || ''}, ${addressObj.city || ''}, ${addressObj.state || ''}, ${addressObj.country || ''}`.replace(/^, |, $|, ,/g, '');
      }
    } else if (hotel.location) {
      if (typeof hotel.location === 'string') {
        address = hotel.location;
      } else {
        // Handle object format
        const locationObj = hotel.location;
        address = `${locationObj.address || ''}, ${locationObj.city || ''}, ${locationObj.state || ''}, ${locationObj.country || ''}`.replace(/^, |, $|, ,/g, '');
      }
    }
    
    // Get title from various API formats
    const title = hotel.name || hotel.title || 'Unknown Hotel';
    
    // Get price from various API formats
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
    const result: StayDataType = {
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
      bedrooms: hotel.bedrooms || amenities.some(a => (a.name || a).toString().includes("Bedroom")) ? 2 : 1,
      bathrooms: hotel.bathrooms || amenities.some(a => (a.name || a).toString().includes("Bathroom")) ? 2 : 1,
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
    };
  }
}

/**
 * Converts an array of Hotel objects to StayDataType objects
 * @param hotels Array of hotels from the API
 * @returns Array of StayDataType objects for UI components
 */
export function hotelsToStayData(hotels: IHotel[] | any[]): StayDataType[] {
  console.log('==== hotelsToStayData ====');
  console.log('Total hotels in input:', hotels?.length);
  
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
          return hotelToStayData(hotel);
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