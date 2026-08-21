export interface Hall {
  id: string;
  name: string;
  capacity: number;
  rows: number;
  seatsPerRow: number;
}

import type { Seat, SeatRow } from "@/types/booking.types";
import type { ShowtimeSort, ShowtimeStatus } from "@/constants/showtimes";

export type { Seat, SeatRow };

export interface Showtime {
  id: string;
  movieId: string;
  movieTitle: string;
  moviePosterUrl: string;
  hallId: string;
  hallName: string;
  hallCapacity: number;
  date: string; // ISO date string
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  ticketPrice: number;
  availableSeats: number;
  bookedSeats: number;
  createdAt: string;
  updatedAt: string;
}

export interface ShowtimeFormData {
  movieId: string;
  hallId: string;
  date: string;
  startTime: string;
  endTime: string;
  ticketPrice: number;
}

export interface ShowtimesFilter {
  movieId?: string;
  date?: string;
  hallName?: string;
  search?: string;
  status?: ShowtimeStatus;
  sort?: ShowtimeSort;
  page?: number;
  limit?: number;
}
