import { Movie, IMovie } from "./movie.model";
import { MovieFilter, PaginatedResponse } from "./movie.types";
import { AppError } from "@/common/errors/AppError";
import { paginate } from "@/common/mongoose";

export const getMovies = async (
  filter: MovieFilter
): Promise<PaginatedResponse<IMovie>> => {
  const { title, director, genre, status, sort = "-createdAt", page = 1, limit = 10 } = filter;

  const query: Record<string, unknown> = {};

  if (title) {
    query.$or = [
      { title: { $regex: title, $options: "i" } },
      { description: { $regex: title, $options: "i" } },
      { director: { $regex: title, $options: "i" } },
    ];
  }
  if (director) {
    query.director = { $regex: director, $options: "i" };
  }
  if (genre) {
    query.genre = { $in: Array.isArray(genre) ? genre : [genre] };
  }
  if (status) {
    query.status = status;
  }

  return paginate(Movie, query, { page, limit, sort });
};

export const getMovieById = async (id: string): Promise<IMovie> => {
  const movie = await Movie.findOne({ _id: id });
  if (!movie) {
    throw new AppError("Movie not found", 404);
  }
  return movie;
};

export const getDeletedMovies = async (
  filter: MovieFilter
): Promise<PaginatedResponse<IMovie>> => {
  const { title, genre, sort = "-deletedAt", page = 1, limit = 10 } = filter;

  const query: Record<string, unknown> = { deletedAt: { $ne: null } };

  if (title) {
    query.$or = [
      { title: { $regex: title, $options: "i" } },
      { description: { $regex: title, $options: "i" } },
      { director: { $regex: title, $options: "i" } },
    ];
  }
  if (genre) {
    query.genre = { $in: Array.isArray(genre) ? genre : [genre] };
  }

  return paginate(Movie, query, { page, limit, sort });
};

export const createMovie = async (data: Partial<IMovie>): Promise<IMovie> => {
  return Movie.create(data);
};

export const updateMovie = async (
  id: string,
  data: Partial<IMovie>
): Promise<IMovie> => {
  const movie = await Movie.findOneAndUpdate({ _id: id }, data, {
    new: true,
    runValidators: true,
  });
  if (!movie) {
    throw new AppError("Movie not found", 404);
  }
  return movie;
};

export const deleteMovie = async (id: string): Promise<void> => {
  const movie = await Movie.findOneAndUpdate(
    { _id: id },
    { deletedAt: new Date() },
    { new: true }
  );
  if (!movie) {
    throw new AppError("Movie not found", 404);
  }
};

export const restoreMovie = async (id: string): Promise<IMovie> => {
  const movie = await Movie.findOneAndUpdate(
    { _id: id, deletedAt: { $ne: null } },
    { deletedAt: null },
    { new: true }
  );
  if (!movie) {
    throw new AppError("Movie not found", 404);
  }
  return movie;
};
