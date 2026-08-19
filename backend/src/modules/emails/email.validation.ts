import { z } from "zod";

export const sendBookingConfirmationSchema = z.object({
  body: z.object({
    bookingId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid booking ID"),
  }),
});

export const sendShowtimeReminderSchema = z.object({
  body: z.object({
    showtimeId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid showtime ID"),
  }),
});