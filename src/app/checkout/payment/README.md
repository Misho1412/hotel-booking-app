# Hotel Booking Checkout Implementation

This directory contains the implementation of the checkout page for hotel bookings. It integrates with the Tap payment gateway for secure payment processing.

## Key Components

### Page Structure
- `page.tsx`: The main container component that handles routing and state management
- Components are organized following atomic design principles

### Payment Processing
- Uses Tap SDK for secure card tokenization
- Card data never touches our server
- Token-based payment flow with 3D Secure support

### Form Validation
- Uses react-hook-form and Zod for robust form validation
- Real-time validation feedback 
- Custom validation for card numbers (Luhn algorithm)

### Security Measures
- Environment variables for API keys
- PCI-compliant integration
- CSRF protection via request interceptors
- Error boundaries for graceful error handling

## Flow

1. User arrives with reservation data (via URL params or session storage)
2. User fills out payment details
3. Client-side validation occurs
4. Confirmation dialog shown before payment
5. Card data is tokenized via Tap SDK
6. Payment token is sent to API with reservation ID
7. 3D Secure flow is initiated if required
8. Success/error is shown with appropriate next steps

## Testing

Tests are included in the `__tests__` directory and cover:
- Form rendering and validation
- Payment flow
- Error handling
- Success paths

## Environment Variables

This implementation requires the following environment variables:

```
NEXT_PUBLIC_TAP_PUBLIC_KEY=your_tap_public_key
NEXT_PUBLIC_API_URL=https://bookingengine.onrender.com
```

## Dependencies

- react-hook-form: Form state management
- @hookform/resolvers/zod: Zod integration for form validation
- zod: Schema validation
- react-hot-toast: Toast notifications
- axios: API client
- date-fns: Date formatting 