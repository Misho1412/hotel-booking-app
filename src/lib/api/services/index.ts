import authService from './authService';
import hotelService from './hotelService';
import roomService from './roomService';
import reservationService from './reservationService';
import paymentService from './paymentService';

export {
  authService,
  hotelService,
  roomService,
  reservationService,
  paymentService
};

// Export types from services
// Auth types
export type {
  AuthTokenRequest,
  AuthToken,
  UserRegistrationRequest,
  UserRequest,
  User
} from './authService';

// Hotel types
export type {
  Hotel,
  HotelRequest,
  PatchedHotelRequest,
  PaginatedHotelList,
  HotelSearchParams
} from './hotelService';

// Room types
export type {
  Room,
  RoomRequest,
  PatchedRoomRequest,
  RoomType,
  RoomTypeRequest,
  PatchedRoomTypeRequest,
  RoomRate,
  RoomRateRequest,
  PatchedRoomRateRequest,
  PaginatedRoomList,
  PaginatedRoomTypeList,
  PaginatedRoomRateList,
  RoomAvailabilityParams,
  RoomAvailabilityResponse
} from './roomService';

// Reservation types
export type {
  Reservation,
  ReservationRequest,
  PatchedReservationRequest,
  PaginatedReservationList
} from './reservationService';

// Payment types
export type {
  Payment,
  PaymentRequest,
  PatchedPaymentRequest,
  PaginatedPaymentList
} from './paymentService'; 