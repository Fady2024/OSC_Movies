import { apiClient } from "./client";
import type { Booking, BookingFilter } from "@/types/booking.types";
import type { PaginatedResponse } from "@/types/booking.types";

const SEATS_PER_ROW = 10;

function seatNumberToLabel(seat: number): string {
  const row = String.fromCharCode(65 + Math.floor((seat - 1) / SEATS_PER_ROW));
  return `${row}${((seat - 1) % SEATS_PER_ROW) + 1}`;
}

function seatLabelToNumber(seat: string): number {
  const match = /^([A-Za-z]+)(\d+)$/.exec(seat);
  if (!match) return Number.NaN;
  const row = match[1].toUpperCase().charCodeAt(0) - 65;
  return row * SEATS_PER_ROW + Number(match[2]);
}

function mapBooking(b: any): Booking {
  const showtime = b.showtime ?? {};
  const movie = showtime.movie ?? {};
  return {
    id: b._id ?? b.id,
    bookingRef: b.bookingRef ?? `CIN-${String(b._id ?? b.id).slice(-6).toUpperCase()}`,
    userId: typeof b.customer === "object" ? b.customer._id : b.customer,
    userName: typeof b.customer === "object" ? b.customer.fullName : "",
    userEmail: typeof b.customer === "object" ? b.customer.email : "",
    showtimeId: typeof b.showtime === "object" ? (b.showtime._id ?? b.showtime.id) : b.showtime,
    movieId: movie._id ?? movie.id ?? "",
    movieTitle: movie.title ?? showtime.movieTitle ?? "",
    moviePosterUrl: movie.posterUrl ?? showtime.moviePosterUrl ?? "",
    hallName: showtime.hallName ?? "",
    date: showtime.date?.split("T")[0] ?? showtime.date ?? "",
    startTime: showtime.startTime ?? "",
    endTime: showtime.endTime ?? "",
    seats: (b.selectedSeats ?? b.seats ?? []).map((s: any) =>
      typeof s === "number" ? seatNumberToLabel(s) : s
    ),
    ticketPrice: showtime.ticketPrice ?? 0,
    totalAmount: b.totalPrice ?? b.totalAmount ?? 0,
    status: b.status ?? "confirmed",
    createdAt: b.createdAt ?? new Date().toISOString(),
    cancelledAt: b.cancelledAt,
  };
}

export async function getMyBookings(
  _userId: string,
  filter: BookingFilter = {}
): Promise<PaginatedResponse<Booking>> {
  const params: Record<string, string | number> = {};
  if (filter.status) params.status = filter.status;
  if (filter.page) params.page = filter.page;
  if (filter.limit) params.limit = filter.limit;

  const { data: res } = await apiClient.get("/bookings/my", { params });

  const items = (res.data ?? []).map(mapBooking);
  return {
    data: items,
    total: res.pagination?.total ?? res.total ?? items.length,
    page: res.pagination?.page ?? res.page ?? 1,
    limit: res.pagination?.limit ?? res.limit ?? 20,
    totalPages: res.pagination?.totalPages ?? res.totalPages ?? 1,
  };
}

export async function getAllBookings(
  filter: BookingFilter = {}
): Promise<PaginatedResponse<Booking>> {
  const params: Record<string, string | number> = {};
  if (filter.status) params.status = filter.status;
  if (filter.movieId) params.movie = filter.movieId;
  if (filter.date) params.date = filter.date;
  if (filter.search) params.search = filter.search;
  if (filter.page) params.page = filter.page;
  if (filter.limit) params.limit = filter.limit;

  const { data: res } = await apiClient.get("/admin/bookings", { params });

  const items = (res.data ?? []).map(mapBooking);
  return {
    data: items,
    total: res.pagination?.total ?? res.total ?? items.length,
    page: res.pagination?.page ?? res.page ?? 1,
    limit: res.pagination?.limit ?? res.limit ?? 20,
    totalPages: res.pagination?.totalPages ?? res.totalPages ?? 1,
  };
}

export async function getBookingById(id: string): Promise<Booking> {
  const { data: res } = await apiClient.get(`/bookings/${id}`);
  return mapBooking(res.data);
}

export async function createBooking(data: {
  showtimeId: string;
  seats: string[];
}): Promise<Booking> {
  const seatNumbers = data.seats.map(seatLabelToNumber);

  const { data: res } = await apiClient.post("/bookings", {
    showtimeId: data.showtimeId,
    selectedSeats: seatNumbers,
  });

  return mapBooking(res.data);
}

export async function cancelBooking(id: string): Promise<Booking> {
  const { data: res } = await apiClient.patch(`/bookings/${id}/cancel`);
  return mapBooking(res.data);
}

export async function updateBookingSeats(id: string, seats: string[]): Promise<Booking> {
  const selectedSeats = seats.map(seatLabelToNumber);
  const { data: res } = await apiClient.patch(`/bookings/${id}/seats`, { selectedSeats });
  return mapBooking(res.data);
}
