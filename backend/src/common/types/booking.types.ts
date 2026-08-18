export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

export interface BookingFilter {
  status?: BookingStatus | string;
  movie?: string;
  date?: string;
  customer?: string;
  search?: string;
  page?: number;
  limit?: number;
}
