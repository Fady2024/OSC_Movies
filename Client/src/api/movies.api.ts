import { apiClient } from "./client";
import type { Movie, MovieFormData, MoviesFilter } from "@/types/movie.types";
import type { PaginatedResponse } from "@/types/booking.types";

export async function getMovies(
  filter: MoviesFilter = {}
): Promise<PaginatedResponse<Movie>> {
  const params: Record<string, string | number> = {};
  if (filter.search) params.search = filter.search;
  if (filter.genre) params.genre = filter.genre;
  if (filter.status) params.status = filter.status;
  if (filter.sortBy) params.sort = `${filter.sortBy}_${filter.sortOrder ?? "desc"}`;
  if (filter.page) params.page = filter.page;
  if (filter.limit) params.limit = filter.limit;

  const { data: res } = await apiClient.get("/movies", { params });
  return {
    data: res.data ?? res.data?.data ?? [],
    total: res.pagination?.total ?? res.total ?? 0,
    page: res.pagination?.page ?? res.page ?? 1,
    limit: res.pagination?.limit ?? res.limit ?? 12,
    totalPages: res.pagination?.totalPages ?? res.totalPages ?? 1,
  };
}

export async function getMovieById(id: string): Promise<Movie> {
  const { data: res } = await apiClient.get(`/movies/${id}`);
  const m = res.data;
  return {
    id: m._id ?? m.id,
    title: m.title,
    description: m.description,
    genre: m.genre,
    duration: m.duration,
    rating: m.rating,
    ageRating: m.ageRating ?? "PG",
    status: m.status,
    posterUrl: m.posterUrl,
    director: m.director ?? "",
    cast: m.cast ?? [],
    releaseDate: m.releaseDate ?? "",
    language: m.language ?? "English",
    createdAt: m.createdAt ?? new Date().toISOString(),
    updatedAt: m.updatedAt ?? new Date().toISOString(),
  };
}

export async function createMovie(data: MovieFormData): Promise<Movie> {
  const { data: res } = await apiClient.post("/movies", data);
  const m = res.data;
  return {
    id: m._id ?? m.id,
    title: m.title,
    description: m.description,
    genre: m.genre,
    duration: m.duration,
    rating: m.rating,
    ageRating: m.ageRating ?? "PG",
    status: m.status,
    posterUrl: m.posterUrl,
    director: m.director ?? "",
    cast: m.cast ?? [],
    releaseDate: m.releaseDate ?? "",
    language: m.language ?? "English",
    createdAt: m.createdAt ?? new Date().toISOString(),
    updatedAt: m.updatedAt ?? new Date().toISOString(),
  };
}

export async function updateMovie(
  id: string,
  data: Partial<MovieFormData>
): Promise<Movie> {
  const { data: res } = await apiClient.put(`/movies/${id}`, data);
  const m = res.data;
  return {
    id: m._id ?? m.id,
    title: m.title,
    description: m.description,
    genre: m.genre,
    duration: m.duration,
    rating: m.rating,
    ageRating: m.ageRating ?? "PG",
    status: m.status,
    posterUrl: m.posterUrl,
    director: m.director ?? "",
    cast: m.cast ?? [],
    releaseDate: m.releaseDate ?? "",
    language: m.language ?? "English",
    createdAt: m.createdAt ?? new Date().toISOString(),
    updatedAt: m.updatedAt ?? new Date().toISOString(),
  };
}

export async function deleteMovie(id: string): Promise<void> {
  await apiClient.delete(`/movies/${id}`);
}

function mapMovie(m: Record<string, any>): Movie {
  return {
    id: m._id ?? m.id,
    title: m.title,
    description: m.description,
    genre: m.genre,
    duration: m.duration,
    rating: m.rating,
    ageRating: m.ageRating ?? "PG",
    status: m.status,
    posterUrl: m.posterUrl,
    director: m.director ?? "",
    cast: m.cast ?? [],
    releaseDate: m.releaseDate ?? "",
    language: m.language ?? "English",
    createdAt: m.createdAt ?? new Date().toISOString(),
    updatedAt: m.updatedAt ?? new Date().toISOString(),
    deletedAt: m.deletedAt ?? null,
  };
}

export async function getDeletedMovies(
  filter: { search?: string; page?: number; limit?: number } = {}
): Promise<PaginatedResponse<Movie>> {
  const params: Record<string, string | number> = {};
  if (filter.search) params.search = filter.search;
  if (filter.page) params.page = filter.page;
  if (filter.limit) params.limit = filter.limit;

  const { data: res } = await apiClient.get("/movies/deleted", { params });
  return {
    data: (res.data ?? []).map(mapMovie),
    total: res.total ?? 0,
    page: res.page ?? 1,
    limit: res.limit ?? 10,
    totalPages: res.totalPages ?? 1,
  };
}

export async function restoreMovie(id: string): Promise<Movie> {
  const { data: res } = await apiClient.patch(`/movies/${id}/restore`);
  return mapMovie(res.data);
}
