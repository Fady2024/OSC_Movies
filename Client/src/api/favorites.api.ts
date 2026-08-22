import { apiClient } from "./client";
import type { PaginatedResponse } from "@/types/booking.types";

export interface Favorite {
  id: string;
  user: string;
  movie: any;
  createdAt: string;
  updatedAt: string;
}

export async function getFavorites(
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<Favorite>> {
  const { data: res } = await apiClient.get("/favorites", {
    params: { page, limit },
  });
  return {
    data: res.data ?? res.data?.data ?? [],
    total: res.pagination?.total ?? res.total ?? 0,
    page: res.pagination?.page ?? res.page ?? 1,
    limit: res.pagination?.limit ?? res.limit ?? 10,
    totalPages: res.pagination?.totalPages ?? res.totalPages ?? 1,
  };
}

export async function addFavorite(movieId: string): Promise<Favorite> {
  const { data: res } = await apiClient.post("/favorites", { movieId });
  return res.data;
}

export async function removeFavorite(favoriteId: string): Promise<void> {
  await apiClient.delete(`/favorites/${favoriteId}`);
}

export async function isFavorite(movieId: string): Promise<{ isFavorite: boolean; favoriteId?: string }> {
  const { data: res } = await apiClient.get(`/favorites/check/${movieId}`);
  return res;
}
