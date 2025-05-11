import React from 'react';
import { format } from 'date-fns';
import { Reservation } from '@/types/reservation';

interface ReservationSummaryProps {
  reservation: Reservation;
}

const ReservationSummary: React.FC<ReservationSummaryProps> = ({ reservation }) => {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM dd, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  const checkInDate = formatDate(reservation.check_in);
  const checkOutDate = formatDate(reservation.check_out);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">Reservation Summary</h2>

      <div className="border-b border-gray-200 pb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Reservation ID:</span>
          <span className="font-medium">{reservation.id}</span>
        </div>

        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Room Type:</span>
          <span className="font-medium">{reservation.room_type}</span>
        </div>

        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Check-in:</span>
          <span className="font-medium">{checkInDate}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">Check-out:</span>
          <span className="font-medium">{checkOutDate}</span>
        </div>
      </div>

      <div className="pt-4">
        <div className="flex justify-between items-center text-lg font-bold">
          <span>Total Amount:</span>
          <span>${reservation.total_amount.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default ReservationSummary; 