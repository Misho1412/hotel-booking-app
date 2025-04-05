import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  roomService, 
  Room, 
  RoomRequest, 
  PatchedRoomRequest,
  RoomAvailabilityParams,
} from '@/lib/api/services';

export const useRooms = () => {
  const queryClient = useQueryClient();

  // Get rooms for a hotel
  const getHotelRooms = (hotelId: string, page?: number, pageSize?: number) => {
    return useQuery({
      queryKey: ['rooms', 'hotel', hotelId, { page, pageSize }],
      queryFn: () => roomService.getHotelRooms(hotelId, page, pageSize),
      enabled: !!hotelId,
    });
  };

  // Get a specific room
  const getRoom = (roomId: string) => {
    return useQuery({
      queryKey: ['rooms', roomId],
      queryFn: () => roomService.getRoom(roomId),
      enabled: !!roomId,
    });
  };

  // Get detailed information for a room
  const getRoomDetails = (roomId: string) => {
    return useQuery({
      queryKey: ['room-details', roomId],
      queryFn: () => roomService.getRoomDetails(roomId),
      enabled: !!roomId,
    });
  };

  // Check room availability
  const checkRoomAvailability = (params: RoomAvailabilityParams) => {
    return useQuery({
      queryKey: ['roomAvailability', params],
      queryFn: () => roomService.checkRoomAvailability(params),
      enabled: !!params.hotelId && !!params.checkInDate && !!params.checkOutDate,
    });
  };

  // Create room
  const createRoom = useMutation({
    mutationFn: (roomData: RoomRequest) => roomService.createRoom(roomData),
    onSuccess: (data) => {
      // Invalidate queries to refetch
      queryClient.invalidateQueries({ 
        queryKey: ['rooms', 'hotel', data.hotelId] 
      });
    },
  });

  // Update room
  const updateRoom = useMutation({
    mutationFn: ({ roomId, roomData }: { roomId: string; roomData: RoomRequest }) => 
      roomService.updateRoom(roomId, roomData),
    onSuccess: (data) => {
      // Invalidate specific room query and hotel rooms
      queryClient.invalidateQueries({ queryKey: ['rooms', data.id] });
      queryClient.invalidateQueries({ 
        queryKey: ['rooms', 'hotel', data.hotelId] 
      });
    },
  });

  // Patch room
  const patchRoom = useMutation({
    mutationFn: ({ roomId, roomData }: { roomId: string; roomData: PatchedRoomRequest }) => 
      roomService.patchRoom(roomId, roomData),
    onSuccess: (data) => {
      // Invalidate specific room query and hotel rooms
      queryClient.invalidateQueries({ queryKey: ['rooms', data.id] });
      queryClient.invalidateQueries({ 
        queryKey: ['rooms', 'hotel', data.hotelId] 
      });
    },
  });

  // Delete room
  const deleteRoom = useMutation({
    mutationFn: (roomId: string) => roomService.deleteRoom(roomId),
    onSuccess: (_data, roomId) => {
      // Remove from cache and invalidate queries
      queryClient.removeQueries({ queryKey: ['rooms', roomId] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });

  return {
    getHotelRooms,
    getRoom,
    getRoomDetails,
    checkRoomAvailability,
    createRoom,
    updateRoom,
    patchRoom,
    deleteRoom,
  };
}; 