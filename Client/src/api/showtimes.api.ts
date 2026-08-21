import { apiClient } from "./client";
import type {
  Showtime,
  ShowtimeFormData,
  ShowtimesFilter,
} from "@/types/showtime.types";
import type { PaginatedResponse } from "@/types/booking.types";

export interface ShowtimesFiltersMeta {
  dates: string[];
  halls: string[];
}

export async function getShowtimes(
  filter: ShowtimesFilter = {}
): Promise<PaginatedResponse<Showtime> & { filters?: ShowtimesFiltersMeta }> {
  const params: Record<string, string | number> = {};
  if (filter.movieId) params.movie = filter.movieId;
  if (filter.date) params.date = filter.date;
  if (filter.hallName) params.hallName = filter.hallName;
  if (filter.search) params.search = filter.search;
  if (filter.status && filter.status !== "all") params.status = filter.status;
  if (filter.sort) params.sort = filter.sort;
  if (filter.page) params.page = filter.page;
  if (filter.limit) params.limit = filter.limit;

  const { data: res } = await apiClient.get("/showtimes", { params });

  const items = (res.data ?? []).map((s: any) => ({
    id: s._id ?? s.id,
    movieId: s.movie?.id ?? s.movie?._id ?? (typeof s.movie === "string" ? s.movie : "") ?? s.movieId ?? "",
    movieTitle: s.movieTitle ?? s.movie?.title ?? "",
    moviePosterUrl: s.moviePosterUrl ?? s.movie?.posterUrl ?? "",
    hallId: s.hallId ?? "",
    hallName: s.hallName ?? "",
    hallCapacity: s.totalCapacity ?? s.hallCapacity ?? 0,
    date: s.date?.split("T")[0] ?? s.date ?? "",
    startTime: s.startTime ?? "",
    endTime: s.endTime ?? "",
    ticketPrice: s.ticketPrice ?? 0,
    availableSeats: s.availableSeats ?? (s.totalCapacity - s.bookedSeats),
    bookedSeats: s.bookedSeats ?? 0,
    createdAt: s.createdAt ?? new Date().toISOString(),
    updatedAt: s.updatedAt ?? new Date().toISOString(),
  }));

  return {
    data: items,
    total: res.pagination?.total ?? res.total ?? items.length,
    page: res.pagination?.page ?? res.page ?? 1,
    limit: res.pagination?.limit ?? res.limit ?? 50,
    totalPages: res.pagination?.totalPages ?? res.totalPages ?? 1,
    filters: {
      dates: res.filters?.dates ?? [],
      halls: res.filters?.halls ?? [],
    },
  };
}

export async function getShowtimeById(id: string): Promise<Showtime> {
  const { data: res } = await apiClient.get(`/showtimes/${id}`);
  const s = res.data;
  return {
    id: s._id ?? s.id,
    movieId: s.movie?._id ?? s.movie ?? "",
    movieTitle: s.movieTitle ?? s.movie?.title ?? "",
    moviePosterUrl: s.moviePosterUrl ?? s.movie?.posterUrl ?? "",
    hallId: s.hallId ?? "",
    hallName: s.hallName ?? "",
    hallCapacity: s.totalCapacity ?? 0,
    date: s.date?.split("T")[0] ?? s.date ?? "",
    startTime: s.startTime ?? "",
    endTime: s.endTime ?? "",
    ticketPrice: s.ticketPrice ?? 0,
    availableSeats: s.availableSeats ?? 0,
    bookedSeats: s.bookedSeats ?? 0,
    createdAt: s.createdAt ?? new Date().toISOString(),
    updatedAt: s.updatedAt ?? new Date().toISOString(),
  };
}

export async function getHalls() {
  return [
    { id: "hall-1", name: "Hall 1 - IMAX", capacity: 120, rows: 10, seatsPerRow: 12 },
    { id: "hall-2", name: "Hall 2 - Dolby", capacity: 80, rows: 8, seatsPerRow: 10 },
    { id: "hall-3", name: "Hall 3 - Standard", capacity: 60, rows: 6, seatsPerRow: 10 },
  ];
}

export function mapAvailableSeats(apiData: any) {
  const rows: { row: string; seats: any[] }[] = [];

  if (Array.isArray(apiData.rows) && apiData.rows.length > 0) {
    for (const row of apiData.rows) {
      rows.push({
        row: row.row,
        seats: row.seats.map((seat: any) => ({
          id: `${row.row}${seat.number}`,
          row: row.row,
          number: seat.number,
          status: seat.status === "reserved" ? "reserved" : "available",
          price: seat.price ?? 0,
        })),
      });
    }
  }

  if (rows.length === 0) {
    const totalCapacity = apiData.totalCapacity ?? 80;
    const seatsPerRow = 10;
    const count = Math.ceil(totalCapacity / seatsPerRow);
    for (let r = 0; r < count; r++) {
      const rowLetter = String.fromCharCode(65 + r);
      const seatsInRow = Math.min(seatsPerRow, totalCapacity - r * seatsPerRow);
      const seats = [];
      for (let c = 1; c <= seatsInRow; c++) {
        seats.push({
          id: `${rowLetter}${c}`,
          row: rowLetter,
          number: c,
          status: "available",
          price: 0,
        });
      }
      rows.push({ row: rowLetter, seats });
    }
  }

  return rows;
}

export async function getAvailableSeats(showtimeId: string) {
  const { data: res } = await apiClient.get(`/showtimes/${showtimeId}/seats`);
  return mapAvailableSeats(res.data ?? {});
}

export async function createShowtime(data: ShowtimeFormData): Promise<Showtime> {
  const { data: res } = await apiClient.post("/showtimes", {
    movie: data.movieId,
    hallName: data.hallId,
    date: data.date,
    startTime: data.startTime,
    endTime: data.endTime,
    ticketPrice: data.ticketPrice,
    totalCapacity: 80,
  });
  const s = res.data;
  return {
    id: s._id ?? s.id,
    movieId: s.movie ?? "",
    movieTitle: s.movieTitle ?? "",
    moviePosterUrl: s.moviePosterUrl ?? "",
    hallId: s.hallId ?? "",
    hallName: s.hallName ?? "",
    hallCapacity: s.totalCapacity ?? 0,
    date: s.date?.split("T")[0] ?? s.date ?? "",
    startTime: s.startTime ?? "",
    endTime: s.endTime ?? "",
    ticketPrice: s.ticketPrice ?? 0,
    availableSeats: s.availableSeats ?? 0,
    bookedSeats: s.bookedSeats ?? 0,
    createdAt: s.createdAt ?? new Date().toISOString(),
    updatedAt: s.updatedAt ?? new Date().toISOString(),
  };
}

export async function updateShowtime(
  id: string,
  data: Partial<ShowtimeFormData>
): Promise<Showtime> {
  const payload: Record<string, any> = {};
  if (data.movieId) payload.movie = data.movieId;
  if (data.hallId) payload.hallName = data.hallId;
  if (data.date) payload.date = data.date;
  if (data.startTime) payload.startTime = data.startTime;
  if (data.endTime) payload.endTime = data.endTime;
  if (data.ticketPrice) payload.ticketPrice = data.ticketPrice;

  const { data: res } = await apiClient.put(`/showtimes/${id}`, payload);
  const s = res.data;
  return {
    id: s._id ?? s.id,
    movieId: s.movie ?? "",
    movieTitle: s.movieTitle ?? "",
    moviePosterUrl: s.moviePosterUrl ?? "",
    hallId: s.hallId ?? "",
    hallName: s.hallName ?? "",
    hallCapacity: s.totalCapacity ?? 0,
    date: s.date?.split("T")[0] ?? s.date ?? "",
    startTime: s.startTime ?? "",
    endTime: s.endTime ?? "",
    ticketPrice: s.ticketPrice ?? 0,
    availableSeats: s.availableSeats ?? 0,
    bookedSeats: s.bookedSeats ?? 0,
    createdAt: s.createdAt ?? new Date().toISOString(),
    updatedAt: s.updatedAt ?? new Date().toISOString(),
  };
}

export async function deleteShowtime(id: string): Promise<void> {
  await apiClient.delete(`/showtimes/${id}`);
}
