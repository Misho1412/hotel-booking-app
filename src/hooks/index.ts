// Auth hook (already implemented)
export { useAuth } from '@/context/AuthContext';

// Custom API hooks
export { useHotels } from './useHotels';
export { useRooms } from './useRooms';
export { useRoomTypes } from './useRoomTypes';
export { useRoomRates } from './useRoomRates';
export { useReservations } from './useReservations';
export { usePayments } from './usePayments';

// API state utility
export { useApiState, getErrorMessage } from './useApiState'; 