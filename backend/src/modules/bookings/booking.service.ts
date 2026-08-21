import mongoose from "mongoose";
import { Booking, IBooking } from "./booking.model";
import { SeatReservation } from "./seat-reservation.model";
import { Showtime } from "@/modules/showtimes/showtime.model";
import { Movie } from "@/modules/movies/movie.model";
import { AppError } from "@/common/errors/AppError";
import { stripe } from "@/config/stripe";
import { broadcastShowtimeSeats, emitBookingEvent } from "@/socket/events";
import { notifyShowtimeAlmostFull } from "@/modules/notifications/notification.service";
import { hasScreeningStarted } from "@/modules/showtimes/showtime.util";

export const createBooking = async (
  customerId: string,
  showtimeId: string,
  selectedSeats: number[]
): Promise<IBooking> => {
  const showtime = await Showtime.findById(showtimeId);
  if (!showtime) {
    throw new AppError("Showtime not found", 404, "SHOWTIME_NOT_FOUND");
  }

  if (hasScreeningStarted(showtime.date, showtime.startTime)) {
    throw new AppError("Cannot book for a past showtime", 400, "PAST_SHOWTIME");
  }

  const uniqueSeats = [...new Set(selectedSeats)];
  if (uniqueSeats.length !== selectedSeats.length) {
    throw new AppError("Duplicate seats in request", 400, "DUPLICATE_SEATS");
  }

  for (const seat of uniqueSeats) {
    if (seat < 1 || seat > showtime.totalCapacity) {
      throw new AppError(
        `Seat number ${seat} is invalid. Must be between 1 and ${showtime.totalCapacity}`,
        400,
        "INVALID_SEAT"
      );
    }
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const reservations = uniqueSeats.map((seatNumber) => ({
      showtime: new mongoose.Types.ObjectId(showtimeId),
      seatNumber,
      booking: new mongoose.Types.ObjectId(),
    }));

    const createdReservations = await SeatReservation.insertMany(reservations, { session });

    const totalPrice = uniqueSeats.length * showtime.ticketPrice;

    const booking = await Booking.create(
      [
        {
          customer: customerId,
          showtime: showtimeId,
          selectedSeats: uniqueSeats,
          totalPrice,
          status: "confirmed",
        },
      ],
      { session }
    );

    const bookingDoc = booking[0];

    for (const reservation of createdReservations) {
      reservation.booking = bookingDoc._id;
      await reservation.save({ session });
    }

    showtime.bookedSeats = await SeatReservation.countDocuments({ showtime: showtimeId }).session(session);
    showtime.availableSeats = showtime.totalCapacity - showtime.bookedSeats;
    await showtime.save({ session });

    await session.commitTransaction();

    void broadcastShowtimeSeats(showtimeId);
    void emitBookingEvent(bookingDoc.id, "booking:new");
    void notifyShowtimeAlmostFull(showtime);

    return bookingDoc;
  } catch (error) {
    await session.abortTransaction();
    if (error instanceof AppError) throw error;
    if ((error as any).code === 11000) {
      throw new AppError(
        "One or more selected seats are no longer available",
        409,
        "SEAT_CONFLICT"
      );
    }
    throw error;
  } finally {
    session.endSession();
  }
};

export const getMyBookings = async (
  customerId: string,
  filter: { status?: string; page?: number; limit?: number }
) => {
  const { status, page = 1, limit = 20 } = filter;

  const query: Record<string, any> = { customer: customerId };
  if (status) {
    query.status = status;
  }

  const total = await Booking.countDocuments(query);
  const skip = (page - 1) * limit;
  const data = await Booking.find(query)
    .populate("showtime", "hallName date startTime endTime ticketPrice movieTitle moviePosterUrl movie")
    .sort("-createdAt")
    .skip(skip)
    .limit(limit);

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export const getBookingById = async (bookingId: string, customerId: string): Promise<IBooking> => {
  const booking = await Booking.findOne({ _id: bookingId, customer: customerId }).populate(
    "showtime",
    "hallName date startTime endTime ticketPrice movieTitle moviePosterUrl movie"
  );
  if (!booking) {
    throw new AppError("Booking not found", 404, "BOOKING_NOT_FOUND");
  }
  return booking;
};

export const cancelBooking = async (bookingId: string, customerId: string): Promise<IBooking> => {
  const booking = await Booking.findOne({ _id: bookingId, customer: customerId });
  if (!booking) {
    throw new AppError("Booking not found", 404, "BOOKING_NOT_FOUND");
  }

  if (booking.status === "cancelled") {
    throw new AppError("Booking is already cancelled", 400, "ALREADY_CANCELLED");
  }

  const showtime = await Showtime.findById(booking.showtime);
  if (!showtime) {
    throw new AppError("Showtime not found", 404, "SHOWTIME_NOT_FOUND");
  }

  if (hasScreeningStarted(showtime.date, showtime.startTime)) {
    throw new AppError("Cannot cancel a booking for a past showtime", 400, "PAST_SHOWTIME");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    booking.status = "cancelled";
    await booking.save({ session });

    if (booking.paymentIntentId) {
      try {
        await stripe.refunds.create({
          payment_intent: booking.paymentIntentId,
        });
        booking.paymentStatus = "refunded";
        await booking.save({ session });
      } catch (refundError) {
        console.error("Refund failed:", refundError);
      }
    }

    await SeatReservation.deleteMany({ booking: bookingId }, { session });

    showtime.bookedSeats = await SeatReservation.countDocuments({ showtime: showtime._id }).session(session);
    showtime.availableSeats = showtime.totalCapacity - showtime.bookedSeats;
    await showtime.save({ session });

    await session.commitTransaction();

    void broadcastShowtimeSeats(String(booking.showtime));
    void emitBookingEvent(bookingId, "booking:cancelled");

    return booking;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Replaces the seats of a confirmed booking while keeping its ticket count and
 * payment total unchanged. Reservations are replaced in one transaction, so a
 * conflicting seat change cannot leave a booking without seats.
 */
export const updateBookingSeats = async (
  bookingId: string,
  customerId: string,
  selectedSeats: number[]
): Promise<IBooking> => {
  const booking = await Booking.findOne({ _id: bookingId, customer: customerId });
  if (!booking) {
    throw new AppError("Booking not found", 404, "BOOKING_NOT_FOUND");
  }
  if (booking.status !== "confirmed") {
    throw new AppError("Only confirmed bookings can be modified", 400, "BOOKING_NOT_MODIFIABLE");
  }

  const showtime = await Showtime.findById(booking.showtime);
  if (!showtime) {
    throw new AppError("Showtime not found", 404, "SHOWTIME_NOT_FOUND");
  }

  if (hasScreeningStarted(showtime.date, showtime.startTime)) {
    throw new AppError("Cannot modify a booking for a past showtime", 400, "PAST_SHOWTIME");
  }

  const uniqueSeats = [...new Set(selectedSeats)];
  if (uniqueSeats.length !== selectedSeats.length) {
    throw new AppError("Duplicate seats in request", 400, "DUPLICATE_SEATS");
  }
  if (uniqueSeats.length !== booking.selectedSeats.length) {
    throw new AppError(
      "Seat changes must keep the same number of tickets",
      400,
      "SEAT_COUNT_MISMATCH"
    );
  }
  for (const seat of uniqueSeats) {
    if (seat < 1 || seat > showtime.totalCapacity) {
      throw new AppError(
        `Seat number ${seat} is invalid. Must be between 1 and ${showtime.totalCapacity}`,
        400,
        "INVALID_SEAT"
      );
    }
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    await SeatReservation.deleteMany({ booking: booking._id }, { session });
    await SeatReservation.insertMany(
      uniqueSeats.map((seatNumber) => ({
        showtime: showtime._id,
        seatNumber,
        booking: booking._id,
      })),
      { session }
    );

    booking.selectedSeats = uniqueSeats;
    await booking.save({ session });
    await session.commitTransaction();

    void broadcastShowtimeSeats(String(showtime._id));

    return booking;
  } catch (error) {
    await session.abortTransaction();
    if ((error as any).code === 11000) {
      throw new AppError(
        "One or more selected seats are no longer available",
        409,
        "SEAT_CONFLICT"
      );
    }
    throw error;
  } finally {
    session.endSession();
  }
};
