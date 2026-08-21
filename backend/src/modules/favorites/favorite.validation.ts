import { z } from 'zod';

export const addFavoriteSchema = z.object({
  body: z.object({
    movieId: z.string().min(1, 'Movie ID is required'),
  }),
});

export const removeFavoriteSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid favorite ID'),
  }),
});

export const getFavoritesSchema = z.object({
  query: z.object({
    page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
    limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 10),
  }),
});
