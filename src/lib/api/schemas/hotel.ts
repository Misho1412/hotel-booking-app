/**
 * Hotel API Schema definitions
 * These interfaces match the API responses from the AMR Booking API
 */

export interface IHotelImage {
  id: number;
  image: string;
  hotel: number;
  created_at: string;
  updated_at: string;
}

export interface IHotelAmenity {
  id: number;
  name: string;
  icon: string;
  description?: string;
}

export interface IHotelAddress {
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  country: string;
  zip_code: string;
  latitude?: number;
  longitude?: number;
}

export interface IHotel {
  id: number;
  name: string;
  slug: string;
  description: string;
  address: IHotelAddress;
  images: IHotelImage[];
  star_rating: number;
  amenities: IHotelAmenity[];
  email?: string;
  phone?: string;
  website?: string;
  check_in_time?: string;
  check_out_time?: string;
  is_featured: boolean;
  discount_percentage?: number;
  created_at: string;
  updated_at: string;
}

export interface IHotelListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: IHotel[];
}

export interface IHotelSearchParams {
  city?: string;
  check_in_date?: string;
  check_out_date?: string;
  guests?: number;
  star_rating?: number;
  min_price?: number;
  max_price?: number;
  amenities?: string; // Comma-separated amenity IDs
  featured?: boolean;
  page?: number;
  page_size?: number;
}

// Export a mock hotel for testing
export const mockHotel: IHotel = {
  id: 1,
  name: "Luxury Grand Hotel",
  slug: "luxury-grand-hotel",
  description: "Experience luxury at its finest with breathtaking views and exceptional service.",
  address: {
    address_line1: "123 Main Street",
    city: "New York",
    state: "NY",
    country: "USA",
    zip_code: "10001",
    latitude: 40.7128,
    longitude: -74.0060
  },
  images: [
    {
      id: 1,
      image: "/images/hotels/1.png",
      hotel: 1,
      created_at: "2023-01-01T00:00:00Z",
      updated_at: "2023-01-01T00:00:00Z"
    },
    {
      id: 2,
      image: "/images/hotels/2.png",
      hotel: 1,
      created_at: "2023-01-01T00:00:00Z",
      updated_at: "2023-01-01T00:00:00Z"
    }
  ],
  star_rating: 5,
  amenities: [
    {
      id: 1,
      name: "Free WiFi",
      icon: "wifi"
    },
    {
      id: 2,
      name: "Swimming Pool",
      icon: "pool"
    },
    {
      id: 3,
      name: "Spa",
      icon: "spa"
    }
  ],
  email: "info@luxurygrand.com",
  phone: "+1 (555) 123-4567",
  website: "https://luxurygrand.com",
  check_in_time: "15:00:00",
  check_out_time: "11:00:00",
  is_featured: true,
  discount_percentage: 10,
  created_at: "2023-01-01T00:00:00Z",
  updated_at: "2023-01-01T00:00:00Z"
};

// Array of mock hotels for development and testing
export const mockHotels: IHotel[] = [
  mockHotel,
  {
    ...mockHotel,
    id: 2,
    name: "Seaside Resort & Spa",
    slug: "seaside-resort-spa",
    description: "Relax by the ocean with premium amenities and world-class dining.",
    address: {
      ...mockHotel.address,
      address_line1: "456 Beach Blvd",
      city: "Miami",
      state: "FL"
    },
    star_rating: 4,
    discount_percentage: 15,
    images: [
      {
        id: 3,
        image: "/images/hotels/3.png",
        hotel: 2,
        created_at: "2023-01-02T00:00:00Z",
        updated_at: "2023-01-02T00:00:00Z"
      }
    ]
  },
  {
    ...mockHotel,
    id: 3,
    name: "Mountain View Lodge",
    slug: "mountain-view-lodge",
    description: "Experience the beauty of nature with breathtaking mountain views.",
    address: {
      ...mockHotel.address,
      address_line1: "789 Summit Dr",
      city: "Denver",
      state: "CO"
    },
    star_rating: 3,
    is_featured: false,
    discount_percentage: 0,
    images: [
      {
        id: 4,
        image: "/images/hotels/4.png",
        hotel: 3,
        created_at: "2023-01-03T00:00:00Z",
        updated_at: "2023-01-03T00:00:00Z"
      }
    ]
  }
];

// Mock paginated response
export const mockHotelListResponse: IHotelListResponse = {
  count: mockHotels.length,
  next: null,
  previous: null,
  results: mockHotels
}; 