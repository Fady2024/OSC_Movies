import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID");

export const createReviewSchema = {
  params: z.object({ id: objectId }),
  body: z.object({
    rating: z.number().int().min(1, "Rating must be at least 1").max(10, "Rating must be at most 10"),
    comment: z.string().min(1, "Comment is required").max(1000, "Comment cannot exceed 1000 characters").trim(),
  }),
};

export const updateReviewSchema = {
  params: z.object({ id: objectId }),
  body: z
    .object({
      rating: z.number().int().min(1, "Rating must be at least 1").max(10, "Rating must be at most 10").optional(),
      comment: z.string().min(1, "Comment is required").max(1000, "Comment cannot exceed 1000 characters").trim().optional(),
    })
    .refine((d) => d.rating !== undefined || d.comment !== undefined, {
      message: "Provide at least a rating or a comment",
    }),
};

export const deleteReviewSchema = {
  params: z.object({ id: objectId }),
};

export const listReviewsSchema = {
  params: z.object({ id: objectId }),
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(50).optional(),
  }),
};

export const getMyReviewSchema = {
  params: z.object({ id: objectId }),
};

export const adminListReviewsSchema = {
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(50).optional(),
    search: z.string().optional(),
    rating: z.string().optional(),
  }),
};

export const adminDeleteReviewSchema = {
  params: z.object({ id: objectId }),
};
