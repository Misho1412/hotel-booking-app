import { Hotel } from '../services/hotelService';

// Helper to ensure images will be found
const getImagePaths = (index: number, count: number = 3): string[] => {
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    // Use the DEMO_STAY_LISTINGS images which we know exist in the project
    result.push(`/images/listings/${(index * count + i) % 16 + 1}.png`);
  }
  return result;
};

/**
 * Mock data for featured hotels to use when API is not available
 */
export const mockFeaturedHotels: Hotel[] = [
  {
    id: "1",
    name: "Best Western Cedars Hotel",
    description: "Luxurious beachfront hotel with amazing ocean views",
    address: "1 Lanzarote Court",
    city: "New York",
    country: "USA",
    postalCode: "10001",
    phoneNumber: "+1 555-123-4567",
    email: "info@bestwestern.com",
    website: "https://bestwestern.com",
    starRating: 4.8,
    amenities: ["Pool", "Spa", "WiFi", "Breakfast", "Gym"],
    images: getImagePaths(0),
    latitude: 40.7128,
    longitude: -74.0060,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "2",
    name: "Bell By Greene King Inns",
    description: "Charming hotel in the heart of downtown",
    address: "32923 Judy Hill",
    city: "Tokyo",
    country: "Japan",
    postalCode: "100-0001",
    phoneNumber: "+81 3-1234-5678",
    email: "info@bellgreene.com",
    website: "https://bellgreene.com",
    starRating: 4.4,
    amenities: ["WiFi", "Restaurant", "Business Center", "Parking"],
    images: getImagePaths(1),
    latitude: 35.6762,
    longitude: 139.6503,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "3",
    name: "Half Moon, Sherborne By Marston's Inns",
    description: "Quiet retreat with beautiful garden views",
    address: "8731 Killdeer Park",
    city: "Paris",
    country: "France",
    postalCode: "75001",
    phoneNumber: "+33 1 23 45 67 89",
    email: "info@halfmoon.com",
    website: "https://halfmoon.com",
    starRating: 3.6,
    amenities: ["WiFi", "Bar", "Restaurant", "Pet Friendly"],
    images: getImagePaths(2),
    latitude: 48.8566,
    longitude: 2.3522,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "4",
    name: "White Horse Hotel By Greene King Inns",
    description: "Modern hotel with excellent dining options",
    address: "35 Sherman Park",
    city: "London",
    country: "UK",
    postalCode: "SW1A 1AA",
    phoneNumber: "+44 20 1234 5678",
    email: "info@whitehorse.com",
    website: "https://whitehorse.com",
    starRating: 4.8,
    amenities: ["WiFi", "Spa", "Pool", "Fitness Center", "Restaurant"],
    images: getImagePaths(3),
    latitude: 51.5074,
    longitude: -0.1278,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "5",
    name: "Ship And Castle Hotel",
    description: "Seaside hotel with stunning ocean views",
    address: "3 Crest Line Park",
    city: "New York",
    country: "USA",
    postalCode: "10002",
    phoneNumber: "+1 555-987-6543",
    email: "info@shipandcastle.com",
    website: "https://shipandcastle.com",
    starRating: 3.4,
    amenities: ["WiFi", "Beach Access", "Restaurant", "Bar"],
    images: getImagePaths(4),
    latitude: 40.7282,
    longitude: -73.9942,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "6",
    name: "The Windmill Family & Commercial Hotel",
    description: "Family-friendly hotel with spacious rooms",
    address: "55974 Waxwing Junction",
    city: "Tokyo",
    country: "Japan",
    postalCode: "100-0002",
    phoneNumber: "+81 3-8765-4321",
    email: "info@windmillhotel.com",
    website: "https://windmillhotel.com",
    starRating: 3.8,
    amenities: ["WiFi", "Family Rooms", "Restaurant", "Playground"],
    images: getImagePaths(5),
    latitude: 35.6897,
    longitude: 139.7022,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "7",
    name: "Unicorn, Gunthorpe By Marston's Inns",
    description: "Rustic inn with charming countryside views",
    address: "7 Mendota Place",
    city: "Paris",
    country: "France",
    postalCode: "75002",
    phoneNumber: "+33 1 98 76 54 32",
    email: "info@unicorninn.com",
    website: "https://unicorninn.com",
    starRating: 3.0,
    amenities: ["WiFi", "Bar", "Restaurant", "Garden"],
    images: getImagePaths(6),
    latitude: 48.8656,
    longitude: 2.3364,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "8",
    name: "Holiday Inn Express Ramsgate - Minster",
    description: "Convenient hotel near transportation hubs",
    address: "6 Clove Avenue",
    city: "London",
    country: "UK",
    postalCode: "SW1A 2BB",
    phoneNumber: "+44 20 8765 4321",
    email: "info@holidayinn.com",
    website: "https://holidayinn.com",
    starRating: 3.9,
    amenities: ["WiFi", "Breakfast", "Business Center", "Parking"],
    images: getImagePaths(7),
    latitude: 51.5025,
    longitude: -0.1348,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

/**
 * Mock data for paginated hotel list response
 */
export const mockPaginatedHotelList = {
  count: mockFeaturedHotels.length,
  next: null,
  previous: null,
  results: mockFeaturedHotels
}; 