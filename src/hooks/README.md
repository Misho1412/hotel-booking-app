# AMR Booking API Hooks

This directory contains custom React hooks for the AMR Booking API. These hooks leverage React Query to provide caching, automatic refetching, and optimized data fetching for API operations.

## Available Hooks

### Data Hooks

- **`useHotels`**: Hotel operations and state management
- **`useRooms`**: Room operations and state management
- **`useRoomTypes`**: Room type operations and state management
- **`useRoomRates`**: Room rate operations and state management
- **`useReservations`**: Reservation operations and state management
- **`usePayments`**: Payment operations and state management
- **`useAuth`**: Authentication and user profile operations (located in `@/context/AuthContext.tsx`)

### Utility Hooks

- **`useApiState`**: Generic hook for managing API state (loading, error, data)

## Usage Examples

### Hotel Operations

```tsx
import { useHotels } from '@/hooks';

// Inside your component
function HotelList() {
  // Get a list of hotels with optional filtering
  const { data, isLoading, isError, error } = useHotels().getHotels({
    page: 1,
    pageSize: 10,
    city: 'New York',
  });

  // Create a new hotel
  const { mutate: createHotel, isLoading: isCreating } = useHotels().createHotel;
  
  const handleCreateHotel = () => {
    createHotel({
      name: 'New Hotel',
      description: 'A luxury hotel',
      // ...other hotel data
    });
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <h1>Hotels</h1>
      <ul>
        {data?.results.map(hotel => (
          <li key={hotel.id}>{hotel.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Room Operations

```tsx
import { useRooms } from '@/hooks';

function HotelRooms({ hotelId }) {
  // Get rooms for a specific hotel
  const { data, isLoading } = useRooms().getHotelRooms(hotelId);
  
  // Check room availability
  const { data: availability } = useRooms().checkRoomAvailability({
    hotelId,
    checkInDate: '2023-10-01',
    checkOutDate: '2023-10-05'
  });
  
  // ...rest of component
}
```

### Reservation Operations

```tsx
import { useReservations } from '@/hooks';

function UserReservations() {
  // Get all reservations for the current user
  const { data, isLoading } = useReservations().getUserReservations();
  
  // Create a new reservation
  const { mutate: createReservation } = useReservations().createReservation;
  
  const handleBooking = () => {
    createReservation({
      hotelId: 'hotel-123',
      roomId: 'room-456',
      checkInDate: '2023-10-01',
      checkOutDate: '2023-10-05',
      numberOfGuests: 2,
      guestDetails: {
        fullName: 'John Doe',
        email: 'john@example.com',
        phoneNumber: '+1234567890'
      }
    });
  };
  
  // ...rest of component
}
```

### Payment Operations

```tsx
import { usePayments } from '@/hooks';

function PaymentComponent({ reservationId }) {
  // Get payments for a specific reservation
  const { data, isLoading } = usePayments().getReservationPayments(reservationId);
  
  // Process a payment
  const { mutate: processPayment, isLoading: isProcessing } = usePayments().processPayment;
  
  const handlePayment = () => {
    processPayment({
      reservationId,
      amount: 150.00,
      currency: 'USD',
      paymentMethod: 'credit_card',
      cardDetails: {
        cardNumber: '4111111111111111',
        expiryMonth: '12',
        expiryYear: '2024',
        cvv: '123',
        nameOnCard: 'John Doe'
      }
    });
  };
  
  // ...rest of component
}
```

## Error Handling and Loading States

You can use the built-in states provided by React Query or our custom UI components:

```tsx
import { useHotels } from '@/hooks';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';

function HotelDetails({ hotelId }) {
  const { data, isLoading, isError, error, refetch } = useHotels().getHotelDetails(hotelId);

  if (isLoading) {
    return <LoadingSpinner size="lg" label="Loading hotel details..." />;
  }

  if (isError) {
    return <ErrorMessage error={error} onRetry={() => refetch()} />;
  }

  return (
    <div>
      <h1>{data.name}</h1>
      {/* ...rest of component */}
    </div>
  );
}
```

## Server vs Client Rendering

For SEO-critical pages, consider using Server Components to fetch the initial data, then use these hooks for client-side interactions:

```tsx
// In your Server Component
export async function generateMetadata({ params }) {
  const hotel = await fetch(`https://api.example.com/hotels/${params.id}`).then(res => res.json());
  
  return {
    title: hotel.name,
    description: hotel.description
  };
}

// Then in your Client Component for interactivity
"use client";
import { useHotels } from '@/hooks';

function HotelDetailsClient({ initialData }) {
  // Use initialData to avoid an extra network request
  const { data } = useHotels().getHotelDetails(initialData.id, {
    initialData
  });
  
  // ...rest of component using the data
}
``` 