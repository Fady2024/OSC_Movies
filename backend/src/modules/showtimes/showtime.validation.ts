import { z } from "zod";
import { screeningDateTime } from "@/common/utils/timezone";

export const createShowtimeSchema = z.object({
  body: z
    .object({
      movie: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid movie ID"),
      hallName: z.string().min(1, "Hall name is required").trim(),
      date: z.string().transform((val) => new Date(val)),
      startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Start time must be in HH:mm format"),
      endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "End time must be in HH:mm format"),
      ticketPrice: z.number().positive("Ticket price must be positive"),
      totalCapacity: z.number().int().positive("Total capacity must be positive"),
    })
    .superRefine((val, ctx) => {
      if (screeningDateTime(val.date, val.startTime).getTime() <= Date.now()) {
        ctx.addIssue({
          code: "custom",
          message: "Showtime must be in the future",
          path: ["date"],
        });
      }
    }),
});

export const updateShowtimeSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid showtime ID"),
  }),
  body: z
    .object({
      movie: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid movie ID").optional(),
      hallName: z.string().min(1, "Hall name is required").trim().optional(),
      date: z.string().transform((val) => new Date(val)).optional(),
      startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Start time must be in HH:mm format").optional(),
      endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "End time must be in HH:mm format").optional(),
      ticketPrice: z.number().positive("Ticket price must be positive").optional(),
      totalCapacity: z.number().int().positive("Total capacity must be positive").optional(),
    })
    .superRefine((val, ctx) => {
      if (val.date) {
        const datetime = screeningDateTime(val.date, val.startTime ?? "00:00");
        if (datetime.getTime() <= Date.now()) {
          ctx.addIssue({
            code: "custom",
            message: "Showtime must be in the future",
            path: ["date"],
          });
        }
      }
    }),
});

export const getShowtimeByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid showtime ID"),
  }),
});

export const deleteShowtimeSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid showtime ID"),
  }),
});
