import { Favorite, IFavorite } from "./favorite.model";
import { FavoriteFilter, PaginatedResponse } from "./favorite.types";
import { AppError } from "@/common/errors/AppError";
import { Movie } from "../movies/movie.model";
import { paginate } from "@/common/mongoose";

export const getFavorites = async (
  userId: string,
  filter: FavoriteFilter
): Promise<PaginatedResponse<any>> => {
  const { page = 1, limit = 10 } = filter;
  return paginate(Favorite, { user: userId }, {
    page,
    limit,
    sort: "-createdAt",
    populate: ["movie"],
  });
};

export const addFavorite = async (
  userId: string,
  movieId: string
): Promise<IFavorite> => {
  const movie = await Movie.findById(movieId);
  if (!movie) {
    throw new AppError("Movie not found", 404);
  }

  const existingFavorite = await Favorite.findOne({
    user: userId,
    movie: movieId,
  });

  if (existingFavorite) {
    return existingFavorite;
  }

  return Favorite.create({
    user: userId,
    movie: movieId,
  });
};

export const removeFavorite = async (
  userId: string,
  favoriteId: string
): Promise<void> => {
  const favorite = await Favorite.findOneAndDelete({
    _id: favoriteId,
    user: userId,
  });

  if (!favorite) {
    throw new AppError("Favorite not found", 404);
  }
};

export const isFavorite = async (
  userId: string,
  movieId: string
): Promise<{ isFavorite: boolean; favoriteId?: string }> => {
  const favorite = await Favorite.findOne({
    user: userId,
    movie: movieId,
  });
  return {
    isFavorite: !!favorite,
    favoriteId: favorite?._id?.toString(),
  };
};
