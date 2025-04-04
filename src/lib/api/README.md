# AMR Booking API Service

This directory contains the API service layer for interacting with the AMR Booking API. It provides a structured and type-safe interface for making API requests.

## Architecture

The API service layer is organized as follows:

- **apiConfig.ts**: Configures the Axios instance with base URL, headers, and interceptors.
- **validation.ts**: Provides utilities for schema validation using Zod.
- **schemas/index.ts**: Defines Zod schemas for all entities in the system.
- **services/**: Contains service modules for each entity type:
  - `authService.ts`: Authentication and user operations
  - `hotelService.ts`: Hotel operations
  - `roomService.ts`: Room, room type, and room rate operations
  - `reservationService.ts`: Reservation operations
  - `paymentService.ts`: Payment operations
  - `index.ts`: Exports all services and types

## Data Validation

The API service implements comprehensive data validation using Zod:

1. **Request Validation**:
   - Validates all outgoing requests against defined schemas
   - Ensures data sent to the API conforms to expected structure
   - Provides clear error messages if validation fails

2. **Response Validation**:
   - Validates all incoming responses against defined schemas
   - Ensures responses from the API conform to expected structure
   - Handles validation errors gracefully (logs in production, throws in development)

### Validation Example

```typescript
// Example of a service method with validation
async getHotel(hotelId: string): Promise<Hotel> {
  try {
    const response = await apiClient.get<Hotel>(`/hotels/${hotelId}`);
    
    // Validate response data
    const validatedResponse = validateResponse(HotelSchema, response.data);
    
    return validatedResponse as Hotel;
  } catch (error) {
    console.error('Get hotel error:', error);
    throw error;
  }
}
```

## Type Definitions

Each service module defines TypeScript interfaces for:

1. **Entity Types**: Core data structures (Hotel, Room, Reservation, etc.)
2. **Request Types**: Data for creating or updating entities
3. **Response Types**: Structured API responses, including pagination

## Usage

Import the required service from the API services:

```typescript
import { hotelService, reservationService } from 'src/lib/api/services';

// Example: Get hotels
const hotels = await hotelService.getHotels();

// Example: Create a reservation
const newReservation = await reservationService.createReservation({
  hotelId: '123',
  roomId: '456',
  checkInDate: '2023-10-01',
  checkOutDate: '2023-10-05',
  numberOfGuests: 2,
  guestDetails: {
    fullName: 'John Doe',
    email: 'john@example.com',
    phoneNumber: '+1234567890'
  }
});
```

## Error Handling

All service methods include error handling:

- Errors are logged to the console
- Original errors are rethrown to allow handling by the caller
- Validation errors include detailed information about the validation failure 