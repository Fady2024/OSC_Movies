import { Router } from "express";
import * as favoriteController from "./favorite.controller";
import { validate } from "@/common/middleware/validation.middleware";
import { authMiddleware } from "@/common/middleware/auth.middleware";
import { asyncHandler } from "@/common/middleware/asyncHandler";
import {
  addFavoriteSchema,
  removeFavoriteSchema,
  getFavoritesSchema,
} from "./favorite.validation";

const router = Router();

router.get(
  "/",
  authMiddleware,
  validate(getFavoritesSchema),
  asyncHandler(favoriteController.getFavorites)
);

router.post(
  "/",
  authMiddleware,
  asyncHandler(favoriteController.addFavorite)
);

router.delete(
  "/:id",
  authMiddleware,
  validate(removeFavoriteSchema),
  asyncHandler(favoriteController.removeFavorite)
);

router.get(
  "/check/:movieId",
  authMiddleware,
  asyncHandler(favoriteController.isFavorite)
);

export default router;
