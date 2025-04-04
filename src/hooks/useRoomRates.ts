import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  roomService, 
  RoomRate, 
  RoomRateRequest, 
  PatchedRoomRateRequest
} from '@/lib/api/services';

export const useRoomRates = () => {
  const queryClient = useQueryClient();

  // Get room rates for a room type
  const getRoomTypeRates = (roomTypeId: string, page?: number, pageSize?: number) => {
    return useQuery({
      queryKey: ['roomRates', 'roomType', roomTypeId, { page, pageSize }],
      queryFn: () => roomService.getRoomTypeRates(roomTypeId, page, pageSize),
      enabled: !!roomTypeId,
    });
  };

  // Get a specific room rate
  const getRoomRate = (rateId: string) => {
    return useQuery({
      queryKey: ['roomRates', rateId],
      queryFn: () => roomService.getRoomRate(rateId),
      enabled: !!rateId,
    });
  };

  // Create room rate
  const createRoomRate = useMutation({
    mutationFn: (rateData: RoomRateRequest) => roomService.createRoomRate(rateData),
    onSuccess: (data) => {
      // Invalidate queries to refetch
      queryClient.invalidateQueries({ 
        queryKey: ['roomRates', 'roomType', data.roomTypeId] 
      });
    },
  });

  // Update room rate
  const updateRoomRate = useMutation({
    mutationFn: ({ rateId, rateData }: { rateId: string; rateData: RoomRateRequest }) => 
      roomService.updateRoomRate(rateId, rateData),
    onSuccess: (data) => {
      // Invalidate specific room rate query and room type rates
      queryClient.invalidateQueries({ queryKey: ['roomRates', data.id] });
      queryClient.invalidateQueries({ 
        queryKey: ['roomRates', 'roomType', data.roomTypeId] 
      });
    },
  });

  // Patch room rate
  const patchRoomRate = useMutation({
    mutationFn: ({ rateId, rateData }: { rateId: string; rateData: PatchedRoomRateRequest }) => 
      roomService.patchRoomRate(rateId, rateData),
    onSuccess: (data) => {
      // Invalidate specific room rate query and room type rates
      queryClient.invalidateQueries({ queryKey: ['roomRates', data.id] });
      queryClient.invalidateQueries({ 
        queryKey: ['roomRates', 'roomType', data.roomTypeId] 
      });
    },
  });

  // Delete room rate
  const deleteRoomRate = useMutation({
    mutationFn: (rateId: string) => roomService.deleteRoomRate(rateId),
    onSuccess: (_data, rateId) => {
      // Remove from cache and invalidate queries
      queryClient.removeQueries({ queryKey: ['roomRates', rateId] });
      queryClient.invalidateQueries({ queryKey: ['roomRates'] });
    },
  });

  return {
    getRoomTypeRates,
    getRoomRate,
    createRoomRate,
    updateRoomRate,
    patchRoomRate,
    deleteRoomRate,
  };
}; 