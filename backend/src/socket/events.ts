import { Booking } from "@/modules/bookings/booking.model";
import { getAvailableSeats } from "@/modules/showtimes/showtime.service";
import { emitToShowtime, emitToAdmins } from "./io";
import { log } from "@/common/logging/logger";

export async function broadcastShowtimeSeats(showtimeId: string): Promise<void> {
  try {
    const rows = await getAvailableSeats(showtimeId);
    emitToShowtime(showtimeId, "showtime:seats", rows);
  } catch (error) {
    log("error", "broadcast_showtime_seats_failed", {
      showtimeId,
      error: String(error),
    });
  }
}

interface BookingEventPayload {
  bookingId: string;
  status: string;
  paymentStatus?: string;
  seats: number[];
  totalPrice: number;
  customerName: string;
  customerEmail: string;
  movieTitle: string;
  moviePosterUrl?: string;
  movieId?: string;
  hallName?: string;
  date?: Date;
  startTime?: string;
  createdAt?: Date;
}

export async function emitBookingEvent(
  bookingId: string,
  event: "booking:new" | "booking:cancelled"
): Promise<void> {
  try {
    const booking = await Booking.findById(bookingId)
      .populate("customer", "fullName email")
      .populate("showtime", "hallName date startTime endTime movieTitle movie moviePosterUrl");
    if (!booking) return;

    const customer = booking.customer as {
      fullName?: string;
      email?: string;
    } | null;
    const showtime = booking.showtime as {
      hallName?: string;
      date?: Date;
      startTime?: string;
      movieTitle?: string;
      moviePosterUrl?: string;
      movie?: unknown;
    } | null;

    const payload: BookingEventPayload = {
      bookingId: booking.id,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      seats: booking.selectedSeats,
      totalPrice: booking.totalPrice,
      customerName: customer?.fullName ?? "",
      customerEmail: customer?.email ?? "",
      movieTitle: showtime?.movieTitle ?? "",
      moviePosterUrl: showtime?.moviePosterUrl ?? "",
      movieId: showtime?.movie ? String(showtime.movie) : undefined,
      hallName: showtime?.hallName ?? "",
      date: showtime?.date,
      startTime: showtime?.startTime ?? "",
      createdAt: booking.createdAt,
    };

    emitToAdmins(event, payload);
  } catch (error) {
    log("error", "emit_booking_event_failed", {
      bookingId,
      event,
      error: String(error),
    });
  }
}