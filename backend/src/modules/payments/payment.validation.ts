import { z } from "zod";

export const createPaymentIntentSchema = z.object({
  body: z.object({
    showtimeId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid showtime ID"),
    selectedSeats: z
      .array(z.number().int().min(1, "Seat number must be at least 1"))
      .min(1, "At least one seat must be selected"),
  }),
});

export const getPaymentStatusSchema = z.object({
  params: z.object({
    bookingId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid booking ID"),
  }),
});