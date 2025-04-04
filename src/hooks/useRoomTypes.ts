import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  roomService, 
  RoomType, 
  RoomTypeRequest, 
  PatchedRoomTypeRequest
} from '@/lib/api/services';

export const useRoomTypes = () => {
  const queryClient = useQueryClient();

  // Get room types for a hotel
  const getHotelRoomTypes = (hotelId: string, page?: number, pageSize?: number) => {
    return useQuery({
      queryKey: ['roomTypes', 'hotel', hotelId, { page, pageSize }],
      queryFn: () => roomService.getHotelRoomTypes(hotelId, page, pageSize),
      enabled: !!hotelId,
    });
  };

  // Get a specific room type
  const getRoomType = (roomTypeId: string) => {
    return useQuery({
      queryKey: ['roomTypes', roomTypeId],
      queryFn: () => roomService.getRoomType(roomTypeId),
      enabled: !!roomTypeId,
    });
  };

  // Create room type
  const createRoomType = useMutation({
    mutationFn: (roomTypeData: RoomTypeRequest) => roomService.createRoomType(roomTypeData),
    onSuccess: (data) => {
      // Invalidate queries to refetch
      queryClient.invalidateQueries({ 
        queryKey: ['roomTypes', 'hotel', data.hotelId] 
      });
    },
  });

  // Update room type
  const updateRoomType = useMutation({
    mutationFn: ({ roomTypeId, roomTypeData }: { roomTypeId: string; roomTypeData: RoomTypeRequest }) => 
      roomService.updateRoomType(roomTypeId, roomTypeData),
    onSuccess: (data) => {
      // Invalidate specific room type query and hotel room types
      queryClient.invalidateQueries({ queryKey: ['roomTypes', data.id] });
      queryClient.invalidateQueries({ 
        queryKey: ['roomTypes', 'hotel', data.hotelId] 
      });
    },
  });

  // Patch room type
  const patchRoomType = useMutation({
    mutationFn: ({ roomTypeId, roomTypeData }: { roomTypeId: string; roomTypeData: PatchedRoomTypeRequest }) => 
      roomService.patchRoomType(roomTypeId, roomTypeData),
    onSuccess: (data) => {
      // Invalidate specific room type query and hotel room types
      queryClient.invalidateQueries({ queryKey: ['roomTypes', data.id] });
      queryClient.invalidateQueries({ 
        queryKey: ['roomTypes', 'hotel', data.hotelId] 
      });
    },
  });

  // Delete room type
  const deleteRoomType = useMutation({
    mutationFn: (roomTypeId: string) => roomService.deleteRoomType(roomTypeId),
    onSuccess: (_data, roomTypeId) => {
      // Remove from cache and invalidate queries
      queryClient.removeQueries({ queryKey: ['roomTypes', roomTypeId] });
      queryClient.invalidateQueries({ queryKey: ['roomTypes'] });
    },
  });

  return {
    getHotelRoomTypes,
    getRoomType,
    createRoomType,
    updateRoomType,
    patchRoomType,
    deleteRoomType,
  };
}; 