import { Request, Response } from "express";
import * as movieService from "./movie.service";
import {
  notifyNewMovie,
  deleteNotificationsForMovie,
} from "../notifications/notification.service";

export const getMovies = async (req: Request, res: Response) => {
  const { search, genre, status, sortBy, sortOrder, page, limit } = req.query;

  const sortMap: Record<string, string> = {
    title: "title",
    rating: "-rating",
    releaseDate: "-releaseDate",
  };
  const sortField = (sortBy as string) || "createdAt";
  const sortDirection = sortOrder === "asc" ? "" : "-";
  const sort = sortMap[sortField] || `${sortDirection}${sortField}`;

  const result = await movieService.getMovies({
    title: (search as string) || undefined,
    genre: genre as string,
    status: status as "now_showing" | "coming_soon",
    sort,
    page: page ? parseInt(page as string, 10) : 1,
    limit: limit ? parseInt(limit as string, 10) : 12,
  });

  res.json(result);
};

export const getMovieById = async (req: Request, res: Response) => {
  const movie = await movieService.getMovieById(String(req.params.id));
  res.json({ data: movie });
};

export const getDeletedMovies = async (req: Request, res: Response) => {
  const { search, genre, page, limit } = req.query;

  const result = await movieService.getDeletedMovies({
    title: (search as string) || undefined,
    genre: genre as string,
    sort: "-deletedAt",
    page: page ? parseInt(page as string, 10) : 1,
    limit: limit ? parseInt(limit as string, 10) : 10,
  });

  res.json(result);
};

export const createMovie = async (req: Request, res: Response) => {
  const movie = await movieService.createMovie(req.body);
  await notifyNewMovie(movie);
  res.status(201).json({ data: movie });
};

export const updateMovie = async (req: Request, res: Response) => {
  const movie = await movieService.updateMovie(String(req.params.id), req.body);
  res.json({ data: movie });
};

export const deleteMovie = async (req: Request, res: Response) => {
  await movieService.deleteMovie(String(req.params.id));
  await deleteNotificationsForMovie(String(req.params.id));
  res.status(204).send();
};

export const restoreMovie = async (req: Request, res: Response) => {
  const movie = await movieService.restoreMovie(String(req.params.id));
  res.json({ data: movie });
};
