import { z } from 'zod';

const movieStatusEnum = z.enum(['now_showing', 'coming_soon']);

export const createMovieSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').trim(),
    genre: z.array(z.string()).min(1, 'At least one genre is required'),
    duration: z.number().int().positive('Duration must be a positive number'),
    description: z.string().min(1, 'Description is required').trim(),
    posterUrl: z.string().url('Invalid poster URL').trim(),
    rating: z.number().min(0, 'Rating must be at least 0').max(10, 'Rating must be at most 10').default(0),
    status: movieStatusEnum.default('coming_soon'),
    director: z.string().trim().optional(),
    cast: z.array(z.string()).optional(),
    releaseDate: z.string().optional(),
    language: z.string().trim().optional(),
    ageRating: z.string().trim().optional(),
    trailerUrl: z.string().url().optional().or(z.literal("")),
  }),
});

export const updateMovieSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid movie ID'),
  }),
  body: z.object({
    title: z.string().min(1, 'Title is required').trim().optional(),
    genre: z.array(z.string()).min(1, 'At least one genre is required').optional(),
    duration: z.number().int().positive('Duration must be a positive number').optional(),
    description: z.string().min(1, 'Description is required').trim().optional(),
    posterUrl: z.string().url('Invalid poster URL').trim().optional(),
    rating: z.number().min(0, 'Rating must be at least 0').max(10, 'Rating must be at most 10').optional(),
    status: movieStatusEnum.optional(),
    director: z.string().trim().optional(),
    cast: z.array(z.string()).optional(),
    releaseDate: z.string().optional(),
    language: z.string().trim().optional(),
    ageRating: z.string().trim().optional(),
    trailerUrl: z.string().url().optional().or(z.literal("")),
  }),
});

export const getMovieByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid movie ID'),
  }),
});

export const deleteMovieSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid movie ID'),
  }),
});
