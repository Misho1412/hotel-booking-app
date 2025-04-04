import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  paymentService, 
  Payment, 
  PaymentRequest, 
  PatchedPaymentRequest
} from '@/lib/api/services';

export const usePayments = () => {
  const queryClient = useQueryClient();

  // Get user payments
  const getUserPayments = (page?: number, pageSize?: number) => {
    return useQuery({
      queryKey: ['payments', 'user', { page, pageSize }],
      queryFn: () => paymentService.getUserPayments(page, pageSize),
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  };

  // Get a specific payment
  const getPayment = (paymentId: string) => {
    return useQuery({
      queryKey: ['payments', paymentId],
      queryFn: () => paymentService.getPayment(paymentId),
      enabled: !!paymentId,
    });
  };

  // Get reservation payments
  const getReservationPayments = (reservationId: string) => {
    return useQuery({
      queryKey: ['payments', 'reservation', reservationId],
      queryFn: () => paymentService.getReservationPayments(reservationId),
      enabled: !!reservationId,
    });
  };

  // Create payment
  const createPayment = useMutation({
    mutationFn: (paymentData: PaymentRequest) => paymentService.createPayment(paymentData),
    onSuccess: (data) => {
      // Invalidate user payments and reservation payments
      queryClient.invalidateQueries({ queryKey: ['payments', 'user'] });
      queryClient.invalidateQueries({ 
        queryKey: ['payments', 'reservation', data.reservationId] 
      });
    },
  });

  // Process payment
  const processPayment = useMutation({
    mutationFn: (paymentData: PaymentRequest) => paymentService.processPayment(paymentData),
    onSuccess: (data) => {
      // Invalidate user payments and reservation payments
      queryClient.invalidateQueries({ queryKey: ['payments', 'user'] });
      queryClient.invalidateQueries({ 
        queryKey: ['payments', 'reservation', data.reservationId] 
      });
      // Also invalidate the reservation as payment status may change
      queryClient.invalidateQueries({ 
        queryKey: ['reservations', 'user'] 
      });
    },
  });

  // Update payment
  const updatePayment = useMutation({
    mutationFn: ({ 
      paymentId, 
      paymentData 
    }: { 
      paymentId: string; 
      paymentData: PaymentRequest 
    }) => paymentService.updatePayment(paymentId, paymentData),
    onSuccess: (data) => {
      // Invalidate specific payment, user payments, and reservation payments
      queryClient.invalidateQueries({ queryKey: ['payments', data.id] });
      queryClient.invalidateQueries({ queryKey: ['payments', 'user'] });
      queryClient.invalidateQueries({ 
        queryKey: ['payments', 'reservation', data.reservationId] 
      });
    },
  });

  // Patch payment
  const patchPayment = useMutation({
    mutationFn: ({ 
      paymentId, 
      paymentData 
    }: { 
      paymentId: string; 
      paymentData: PatchedPaymentRequest 
    }) => paymentService.patchPayment(paymentId, paymentData),
    onSuccess: (data) => {
      // Invalidate specific payment, user payments, and reservation payments
      queryClient.invalidateQueries({ queryKey: ['payments', data.id] });
      queryClient.invalidateQueries({ queryKey: ['payments', 'user'] });
      queryClient.invalidateQueries({ 
        queryKey: ['payments', 'reservation', data.reservationId] 
      });
    },
  });

  // Delete payment
  const deletePayment = useMutation({
    mutationFn: (paymentId: string) => paymentService.deletePayment(paymentId),
    onSuccess: () => {
      // Invalidate all payments queries
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });

  // Request refund
  const requestRefund = useMutation({
    mutationFn: ({ 
      paymentId, 
      reason 
    }: { 
      paymentId: string; 
      reason?: string 
    }) => paymentService.requestRefund(paymentId, reason),
    onSuccess: (data) => {
      // Invalidate specific payment, user payments, and reservation payments
      queryClient.invalidateQueries({ queryKey: ['payments', data.id] });
      queryClient.invalidateQueries({ queryKey: ['payments', 'user'] });
      queryClient.invalidateQueries({ 
        queryKey: ['payments', 'reservation', data.reservationId] 
      });
      // Also invalidate the reservation as payment status may change
      queryClient.invalidateQueries({ 
        queryKey: ['reservations', 'user'] 
      });
    },
  });

  // Verify payment
  const verifyPayment = useMutation({
    mutationFn: (paymentId: string) => paymentService.verifyPayment(paymentId),
    onSuccess: (data) => {
      // Invalidate specific payment, user payments, and reservation payments
      queryClient.invalidateQueries({ queryKey: ['payments', data.id] });
      queryClient.invalidateQueries({ queryKey: ['payments', 'user'] });
      queryClient.invalidateQueries({ 
        queryKey: ['payments', 'reservation', data.reservationId] 
      });
    },
  });

  return {
    getUserPayments,
    getPayment,
    getReservationPayments,
    createPayment,
    processPayment,
    updatePayment,
    patchPayment,
    deletePayment,
    requestRefund,
    verifyPayment,
  };
}; 