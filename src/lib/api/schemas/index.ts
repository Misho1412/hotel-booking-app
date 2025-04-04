import { z } from 'zod';

// ===== Authentication Schemas =====
export const AuthTokenRequestSchema = z.object({
  username: z.string(),
  password: z.string()
});

export const AuthTokenSchema = z.object({
  token: z.string()
});

// ===== User Schemas =====
export const UserRegistrationRequestSchema = z.object({
  username: z.string(),
  password: z.string(),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional()
});

export const UserRequestSchema = z.object({
  id: z.string().optional(),
  username: z.string().optional(),
  email: z.string().email().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional()
});

export const PatchedUserRequestSchema = UserRequestSchema;

export const UserSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});

// ===== Hotel Schemas =====
export const HotelRequestSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  starRating: z.number().min(1).max(5).optional(),
  amenities: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional()
});

export const PatchedHotelRequestSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  starRating: z.number().min(1).max(5).optional(),
  amenities: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional()
});

export const HotelSchema = HotelRequestSchema.extend({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string()
});

// ===== Room Schemas =====
export const RoomTypeRequestSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  hotelId: z.string()
});

export const PatchedRoomTypeRequestSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  hotelId: z.string().optional()
});

export const RoomTypeSchema = RoomTypeRequestSchema.extend({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const RoomRequestSchema = z.object({
  roomNumber: z.string(),
  roomTypeId: z.string(),
  hotelId: z.string(),
  status: z.enum(['available', 'occupied', 'maintenance', 'reserved']),
  floor: z.string().optional()
});

export const PatchedRoomRequestSchema = z.object({
  roomNumber: z.string().optional(),
  roomTypeId: z.string().optional(),
  hotelId: z.string().optional(),
  status: z.enum(['available', 'occupied', 'maintenance', 'reserved']).optional(),
  floor: z.string().optional()
});

export const RoomSchema = RoomRequestSchema.extend({
  id: z.string(),
  roomType: RoomTypeSchema.optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});

// ===== Room Rate Schemas =====
export const RoomRateRequestSchema = z.object({
  roomTypeId: z.string(),
  rate: z.number().positive(),
  currency: z.string(),
  effectiveFrom: z.string(),
  effectiveTo: z.string().optional(),
  isWeekend: z.boolean().optional(),
  isSeasonal: z.boolean().optional(),
  description: z.string().optional()
});

export const PatchedRoomRateRequestSchema = z.object({
  roomTypeId: z.string().optional(),
  rate: z.number().positive().optional(),
  currency: z.string().optional(),
  effectiveFrom: z.string().optional(),
  effectiveTo: z.string().optional(),
  isWeekend: z.boolean().optional(),
  isSeasonal: z.boolean().optional(),
  description: z.string().optional()
});

export const RoomRateSchema = RoomRateRequestSchema.extend({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string()
});

// ===== Reservation Schemas =====
export const GuestDetailsSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phone: z.string().optional()
});

export const PatchedGuestDetailsSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional()
});

export const ReservationRequestSchema = z.object({
  hotelId: z.string(),
  roomId: z.string(),
  roomTypeId: z.string(),
  checkInDate: z.string(),
  checkOutDate: z.string(),
  guestCount: z.number().int().positive(),
  specialRequests: z.string().optional(),
  guestDetails: GuestDetailsSchema.optional()
});

export const PatchedReservationRequestSchema = z.object({
  hotelId: z.string().optional(),
  roomId: z.string().optional(),
  roomTypeId: z.string().optional(),
  checkInDate: z.string().optional(),
  checkOutDate: z.string().optional(),
  guestCount: z.number().int().positive().optional(),
  specialRequests: z.string().optional(),
  status: z.enum(['pending', 'confirmed', 'cancelled']).optional(),
  guestDetails: PatchedGuestDetailsSchema.optional()
});

export const ReservationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  hotelId: z.string(),
  roomId: z.string(),
  roomTypeId: z.string(),
  checkInDate: z.string(),
  checkOutDate: z.string(),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']),
  guestCount: z.number().int().positive(),
  specialRequests: z.string().optional(),
  totalAmount: z.number().nonnegative(),
  currency: z.string(),
  paymentStatus: z.enum(['pending', 'paid', 'refunded', 'failed']),
  room: RoomSchema.optional(),
  roomType: RoomTypeSchema.optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});

// ===== Payment Schemas =====
export const CardDetailsSchema = z.object({
  cardNumber: z.string(),
  cardholderName: z.string(),
  expiryMonth: z.string(),
  expiryYear: z.string(),
  cvv: z.string()
});

export const PaypalDetailsSchema = z.object({
  email: z.string().email()
});

export const PaymentRequestSchema = z.object({
  reservationId: z.string(),
  amount: z.number().positive(),
  currency: z.string(),
  paymentMethod: z.enum(['credit_card', 'paypal', 'bank_transfer', 'other']),
  cardDetails: CardDetailsSchema.optional(),
  paypalDetails: PaypalDetailsSchema.optional(),
  notes: z.string().optional()
});

export const PatchedPaymentRequestSchema = z.object({
  reservationId: z.string().optional(),
  amount: z.number().positive().optional(),
  currency: z.string().optional(),
  paymentMethod: z.enum(['credit_card', 'paypal', 'bank_transfer', 'other']).optional(),
  status: z.enum(['pending', 'completed', 'failed', 'refunded']).optional(),
  transactionId: z.string().optional(),
  notes: z.string().optional()
});

export const PaymentSchema = z.object({
  id: z.string(),
  reservationId: z.string(),
  userId: z.string(),
  amount: z.number().positive(),
  currency: z.string(),
  status: z.enum(['pending', 'completed', 'failed', 'refunded']),
  paymentMethod: z.enum(['credit_card', 'paypal', 'bank_transfer', 'other']),
  transactionId: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});

// ===== Pagination Schemas =====
export const PaginatedHotelListSchema = z.object({
  count: z.number().int().nonnegative(),
  next: z.string().nullable(),
  previous: z.string().nullable(),
  results: z.array(HotelSchema)
});

export const PaginatedRoomListSchema = z.object({
  count: z.number().int().nonnegative(),
  next: z.string().nullable(),
  previous: z.string().nullable(),
  results: z.array(RoomSchema)
});

export const PaginatedRoomTypeListSchema = z.object({
  count: z.number().int().nonnegative(),
  next: z.string().nullable(),
  previous: z.string().nullable(),
  results: z.array(RoomTypeSchema)
});

export const PaginatedRoomRateListSchema = z.object({
  count: z.number().int().nonnegative(),
  next: z.string().nullable(),
  previous: z.string().nullable(),
  results: z.array(RoomRateSchema)
});

export const PaginatedReservationListSchema = z.object({
  count: z.number().int().nonnegative(),
  next: z.string().nullable(),
  previous: z.string().nullable(),
  results: z.array(ReservationSchema)
});

export const PaginatedPaymentListSchema = z.object({
  count: z.number().int().nonnegative(),
  next: z.string().nullable(),
  previous: z.string().nullable(),
  results: z.array(PaymentSchema)
});

// Export all schema types
export type AuthTokenRequest = z.infer<typeof AuthTokenRequestSchema>;
export type AuthToken = z.infer<typeof AuthTokenSchema>;
export type UserRegistrationRequest = z.infer<typeof UserRegistrationRequestSchema>;
export type UserRequest = z.infer<typeof UserRequestSchema>;
export type PatchedUserRequest = z.infer<typeof PatchedUserRequestSchema>;
export type User = z.infer<typeof UserSchema>;
export type HotelRequest = z.infer<typeof HotelRequestSchema>;
export type PatchedHotelRequest = z.infer<typeof PatchedHotelRequestSchema>;
export type Hotel = z.infer<typeof HotelSchema>;
export type RoomTypeRequest = z.infer<typeof RoomTypeRequestSchema>;
export type PatchedRoomTypeRequest = z.infer<typeof PatchedRoomTypeRequestSchema>;
export type RoomType = z.infer<typeof RoomTypeSchema>;
export type RoomRequest = z.infer<typeof RoomRequestSchema>;
export type PatchedRoomRequest = z.infer<typeof PatchedRoomRequestSchema>;
export type Room = z.infer<typeof RoomSchema>;
export type RoomRateRequest = z.infer<typeof RoomRateRequestSchema>;
export type PatchedRoomRateRequest = z.infer<typeof PatchedRoomRateRequestSchema>;
export type RoomRate = z.infer<typeof RoomRateSchema>;
export type ReservationRequest = z.infer<typeof ReservationRequestSchema>;
export type PatchedReservationRequest = z.infer<typeof PatchedReservationRequestSchema>;
export type Reservation = z.infer<typeof ReservationSchema>;
export type PaymentRequest = z.infer<typeof PaymentRequestSchema>;
export type PatchedPaymentRequest = z.infer<typeof PatchedPaymentRequestSchema>;
export type Payment = z.infer<typeof PaymentSchema>; 