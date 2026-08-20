import { z } from "zod";

export const listNotificationsSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    type: z.enum(["new_movie"]).optional(),
    read: z.enum(["true", "false"]).optional(),
  }),
});

export const notificationIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid notification ID"),
  }),
});

export const subscriptionSchema = z.object({
  body: z.object({
    subscribe: z.boolean(),
  }),
});