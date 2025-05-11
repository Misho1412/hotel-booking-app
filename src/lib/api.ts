import { Reservation } from '@/types/reservation';

const API_BASE_URL = 'https://bookingengine.onrender.com/reservations/api/v1';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function fetchReservation(id: string): Promise<Reservation> {
  const response = await fetch(`${API_BASE_URL}/${id}/`);
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new ApiError(404, 'Reservation not found');
    }
    throw new ApiError(
      response.status,
      'Failed to load reservation details'
    );
  }

  const data = await response.json();
  return data;
}

export async function updateReservationStatus(id: string, status: Reservation['status']) {
  const response = await fetch(`${API_BASE_URL}/${id}/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new ApiError(
      response.status,
      'Failed to update reservation status'
    );
  }

  return await response.json();
} 