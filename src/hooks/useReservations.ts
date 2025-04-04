import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  reservationService, 
  Reservation, 
  ReservationRequest, 
  PatchedReservationRequest
} from '@/lib/api/services';

export const useReservations = () => {
  const queryClient = useQueryClient();

  // Get all user reservations
  const getUserReservations = (page?: number, pageSize?: number) => {
    return useQuery({
      queryKey: ['reservations', 'user', { page, pageSize }],
      queryFn: () => reservationService.getUserReservations(page, pageSize),
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  };

  // Get a specific reservation
  const getReservation = (reservationId: string) => {
    return useQuery({
      queryKey: ['reservations', reservationId],
      queryFn: () => reservationService.getReservation(reservationId),
      enabled: !!reservationId,
    });
  };

  // Get hotel reservations
  const getHotelReservations = (hotelId: string, page?: number, pageSize?: number) => {
    return useQuery({
      queryKey: ['reservations', 'hotel', hotelId, { page, pageSize }],
      queryFn: () => reservationService.getHotelReservations(hotelId, page, pageSize),
      enabled: !!hotelId,
    });
  };

  // Get room reservations
  const getRoomReservations = (roomId: string, page?: number, pageSize?: number) => {
    return useQuery({
      queryKey: ['reservations', 'room', roomId, { page, pageSize }],
      queryFn: () => reservationService.getRoomReservations(roomId, page, pageSize),
      enabled: !!roomId,
    });
  };

  // Create reservation
  const createReservation = useMutation({
    mutationFn: (reservationData: ReservationRequest) => 
      reservationService.createReservation(reservationData),
    onSuccess: () => {
      // Invalidate user reservations to refetch
      queryClient.invalidateQueries({ queryKey: ['reservations', 'user'] });
    },
  });

  // Update reservation
  const updateReservation = useMutation({
    mutationFn: ({ 
      reservationId, 
      reservationData 
    }: { 
      reservationId: string; 
      reservationData: ReservationRequest 
    }) => reservationService.updateReservation(reservationId, reservationData),
    onSuccess: (data) => {
      // Invalidate specific reservation and related queries
      queryClient.invalidateQueries({ queryKey: ['reservations', data.id] });
      queryClient.invalidateQueries({ queryKey: ['reservations', 'user'] });
      queryClient.invalidateQueries({ 
        queryKey: ['reservations', 'hotel', data.hotelId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['reservations', 'room', data.roomId] 
      });
    },
  });

  // Patch reservation
  const patchReservation = useMutation({
    mutationFn: ({ 
      reservationId, 
      reservationData 
    }: { 
      reservationId: string; 
      reservationData: PatchedReservationRequest 
    }) => reservationService.patchReservation(reservationId, reservationData),
    onSuccess: (data) => {
      // Invalidate specific reservation and related queries
      queryClient.invalidateQueries({ queryKey: ['reservations', data.id] });
      queryClient.invalidateQueries({ queryKey: ['reservations', 'user'] });
      queryClient.invalidateQueries({ 
        queryKey: ['reservations', 'hotel', data.hotelId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['reservations', 'room', data.roomId] 
      });
    },
  });

  // Delete reservation
  const deleteReservation = useMutation({
    mutationFn: (reservationId: string) => reservationService.deleteReservation(reservationId),
    onSuccess: () => {
      // Invalidate all reservations queries to refetch
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },
  });

  // Cancel reservation
  const cancelReservation = useMutation({
    mutationFn: ({ 
      reservationId, 
      reason 
    }: { 
      reservationId: string; 
      reason?: string 
    }) => reservationService.cancelReservation(reservationId, reason),
    onSuccess: (data) => {
      // Invalidate specific reservation and related queries
      queryClient.invalidateQueries({ queryKey: ['reservations', data.id] });
      queryClient.invalidateQueries({ queryKey: ['reservations', 'user'] });
      queryClient.invalidateQueries({ 
        queryKey: ['reservations', 'hotel', data.hotelId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['reservations', 'room', data.roomId] 
      });
    },
  });

  return {
    getUserReservations,
    getReservation,
    getHotelReservations,
    getRoomReservations,
    createReservation,
    updateReservation,
    patchReservation,
    deleteReservation,
    cancelReservation,
  };
}; 