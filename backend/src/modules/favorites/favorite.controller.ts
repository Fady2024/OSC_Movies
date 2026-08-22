import { Request, Response } from "express";
import * as favoriteService from "./favorite.service";
import { AuthPayload } from "@/common/middleware/auth.middleware";

export const getFavorites = async (req: Request, res: Response) => {
  const authUser = req.user as AuthPayload;
  const { page, limit } = req.query;

  const result = await favoriteService.getFavorites(authUser.sub, {
    page: page ? parseInt(page as string, 10) : 1,
    limit: limit ? parseInt(limit as string, 10) : 10,
  });

  res.json(result);
};

export const addFavorite = async (req: Request, res: Response) => {
  const authUser = req.user as AuthPayload;
  const { movieId } = req.body;

  const favorite = await favoriteService.addFavorite(authUser.sub, movieId);
  res.status(201).json({ data: favorite });
};

export const removeFavorite = async (req: Request, res: Response) => {
  const authUser = req.user as AuthPayload;
  const favoriteId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  await favoriteService.removeFavorite(authUser.sub, favoriteId);
  res.status(204).send();
};

export const isFavorite = async (req: Request, res: Response) => {
  const authUser = req.user as AuthPayload;
  const movieId = Array.isArray(req.params.movieId) ? req.params.movieId[0] : req.params.movieId;

  const result = await favoriteService.isFavorite(authUser.sub, movieId);
  res.json(result);
};