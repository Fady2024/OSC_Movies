export type BookingStatus = "confirmed" | "cancelled" | "pending" | "completed";
export type SeatStatus = "available" | "reserved" | "selected" | "unavailable";

export interface Seat {
  id: string;
  row: string;
  number: number;
  status: SeatStatus;
  price: number;
}

export interface SeatRow {
  row: string;
  seats: Seat[];
}

export interface Booking {
  id: string;
  bookingRef: string;
  userId: string;
  userName: string;
  userEmail: string;
  showtimeId: string;
  movieId: string;
  movieTitle: string;
  moviePosterUrl: string;
  hallName: string;
  date: string;
  startTime: string;
  endTime: string;
  seats: string[]; // seat ids like "A1", "A2"
  ticketPrice: number;
  totalAmount: number;
  status: BookingStatus;
  createdAt: string;
  cancelledAt?: string;
}

export interface BookingFormData {
  showtimeId: string;
  seats: string[];
}

export interface BookingFilter {
  status?: BookingStatus;
  movieId?: string;
  date?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
