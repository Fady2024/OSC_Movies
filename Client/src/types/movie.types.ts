export type MovieStatus = "now_showing" | "coming_soon";
export type MovieGenre =
  | "action"
  | "drama"
  | "comedy"
  | "thriller"
  | "horror"
  | "sci-fi"
  | "romance"
  | "animation"
  | "documentary"
  | "fantasy"
  | "mystery"
  | "adventure";

export interface Movie {
  id: string;
  title: string;
  description: string;
  genre: MovieGenre[];
  duration: number; // minutes
  rating: number; // 0-10
  ageRating: string; // PG, PG-13, R, etc.
  status: MovieStatus;
  posterUrl: string;
  trailerUrl?: string;
  director: string;
  cast: string[];
  releaseDate: string;
  language: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface MovieFormData {
  title: string;
  description: string;
  genre: MovieGenre[];
  duration: number;
  rating: number;
  ageRating: string;
  status: MovieStatus;
  posterUrl: string;
  trailerUrl?: string;
  director: string;
  cast: string[];
  releaseDate: string;
  language: string;
}

export interface MoviesFilter {
  search?: string;
  genre?: MovieGenre;
  status?: MovieStatus;
  page?: number;
  limit?: number;
  sortBy?: "title" | "rating" | "releaseDate";
  sortOrder?: "asc" | "desc";
}
