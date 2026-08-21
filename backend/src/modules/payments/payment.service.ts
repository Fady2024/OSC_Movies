import Stripe from 'stripe';
import mongoose from 'mongoose';
import { Booking } from '@/modules/bookings/booking.model';
import { Showtime } from '@/modules/showtimes/showtime.model';
import { stripe } from '@/config/stripe';
import { AppError } from '@/common/errors/AppError';
import { env } from '@/config/env';
import { SeatReservation } from '@/modules/bookings/seat-reservation.model';
import { broadcastShowtimeSeats, emitBookingEvent } from '@/socket/events';
import { notifyShowtimeAlmostFull } from '@/modules/notifications/notification.service';
import { hasScreeningStarted } from '@/modules/showtimes/showtime.util';

export const GROUP_DISCOUNT_THRESHOLD = 5;
export const GROUP_DISCOUNT_RATE = 0.1;

export const calculatePrice = (
  seatCount: number,
  ticketPrice: number
): { basePrice: number; discount: number; totalPrice: number } => {
  const basePrice = seatCount * ticketPrice;
  const discount =
    seatCount >= GROUP_DISCOUNT_THRESHOLD
      ? Math.round(basePrice * GROUP_DISCOUNT_RATE * 100) / 100
      : 0;
  return {
    basePrice,
    discount,
    totalPrice: Math.round((basePrice - discount) * 100) / 100,
  };
};

export const createPaymentIntent = async (
  customerId: string,
  showtimeId: string,
  selectedSeats: number[]
): Promise<{ clientSecret: string; bookingId: string }> => {
  const showtime = await Showtime.findById(showtimeId);
  if (!showtime) {
    throw new AppError('Showtime not found', 404, 'SHOWTIME_NOT_FOUND');
  }

  if (hasScreeningStarted(showtime.date, showtime.startTime)) {
    throw new AppError('Cannot book for a past showtime', 400, 'PAST_SHOWTIME');
  }

  const uniqueSeats = [...new Set(selectedSeats)];
  if (uniqueSeats.length !== selectedSeats.length) {
    throw new AppError('Duplicate seats in request', 400, 'DUPLICATE_SEATS');
  }

  for (const seat of uniqueSeats) {
    if (seat < 1 || seat > showtime.totalCapacity) {
      throw new AppError(
        `Seat number ${seat} is invalid. Must be between 1 and ${showtime.totalCapacity}`,
        400,
        'INVALID_SEAT'
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

    const { SeatReservation } = await import('@/modules/bookings/seat-reservation.model');
    const createdReservations = await SeatReservation.insertMany(reservations, { session });

    const totalPrice = calculatePrice(uniqueSeats.length, showtime.ticketPrice).totalPrice;

    const booking = await Booking.create(
      [
        {
          customer: customerId,
          showtime: showtimeId,
          selectedSeats: uniqueSeats,
          totalPrice,
          status: 'pending',
          paymentStatus: 'unpaid',
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

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalPrice * 100),
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: {
        bookingId: bookingDoc._id.toString(),
        customerId,
        showtimeId,
      },
    });

    bookingDoc.paymentIntentId = paymentIntent.id;
    await bookingDoc.save({ session });

    await session.commitTransaction();

    void broadcastShowtimeSeats(showtimeId);
    void emitBookingEvent(bookingDoc.id, 'booking:new');
    void notifyShowtimeAlmostFull(showtime);

    return {
      clientSecret: paymentIntent.client_secret!,
      bookingId: bookingDoc.id,
    };
  } catch (error) {
    await session.abortTransaction();
    if (error instanceof AppError) throw error;
    throw error;
  } finally {
    session.endSession();
  }
};

export const handleWebhook = async (
  sig: string,
  rawBody: Buffer
): Promise<void> => {
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    throw new AppError(`Webhook signature verification failed: ${(err as Error).message}`, 400, 'WEBHOOK_ERROR');
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const { bookingId } = paymentIntent.metadata;

    if (bookingId) {
      await Booking.findByIdAndUpdate(bookingId, {
        status: 'confirmed',
        paymentStatus: 'paid',
        paidAt: new Date(),
      });
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const { bookingId } = paymentIntent.metadata;

    if (bookingId) {
      const booking = await Booking.findByIdAndUpdate(bookingId, {
        status: 'cancelled',
        paymentStatus: 'failed',
      });

      if (booking) {
        const { SeatReservation } = await import('@/modules/bookings/seat-reservation.model');
        await SeatReservation.deleteMany({ booking: bookingId });

        const showtime = await Showtime.findById(booking.showtime);
        if (showtime) {
          showtime.bookedSeats = await SeatReservation.countDocuments({ showtime: showtime._id });
          showtime.availableSeats = showtime.totalCapacity - showtime.bookedSeats;
          await showtime.save();
          void broadcastShowtimeSeats(String(booking.showtime));
        }
      }
    }
  }

  if (event.type === 'charge.refunded') {
    const charge = event.data.object as Stripe.Charge;
    const paymentIntentId = charge.payment_intent as string;

    if (paymentIntentId) {
      const booking = await Booking.findOne({ paymentIntentId });
      if (booking) {
        booking.paymentStatus = 'refunded';
        await booking.save();
      }
    }
  }
};

export const getPaymentStatus = async (
  bookingId: string,
  customerId: string
): Promise<{ status: string; paid: boolean }> => {
  const booking = await Booking.findOne({ _id: bookingId, customer: customerId });
  if (!booking) {
    throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
  }

  return {
    status: booking.paymentStatus,
    paid: booking.paymentStatus === 'paid',
  };
};
