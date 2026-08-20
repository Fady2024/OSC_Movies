import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID");

export const updateBookingStatusSchema = z.object({
  params: z.object({
    id: objectId,
  }),
  body: z.object({
    status: z.enum(["pending", "confirmed", "cancelled", "completed"]),
  }),
});

export const updateUserRoleSchema = z.object({
  params: z.object({
    id: objectId,
  }),
  body: z.object({
    role: z.enum(["customer", "admin"]),
  }),
});

export const deleteReviewSchema = z.object({
  params: z.object({
    id: objectId,
  }),
});