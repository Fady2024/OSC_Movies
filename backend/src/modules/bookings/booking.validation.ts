import { z } from 'zod';

export const createBookingSchema = z.object({
  showtimeId: z.string().min(1, 'Showtime ID is required'),
  selectedSeats: z
    .array(z.number().int().min(1, 'Seat number must be at least 1'))
    .min(1, 'At least one seat must be selected'),
});

export const updateBookingSeatsSchema = z.object({
  selectedSeats: z
    .array(z.number().int().min(1, 'Seat number must be at least 1'))
    .min(1, 'At least one seat must be selected'),
});
