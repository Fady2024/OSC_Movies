import { Router } from "express";
import * as movieController from "./movie.controller";
import { validate } from "@/common/middleware/validation.middleware";
import { authMiddleware } from "@/common/middleware/auth.middleware";
import { authorize } from "@/common/middleware/role.middleware";
import { asyncHandler } from "@/common/middleware/asyncHandler";
import {
  createMovieSchema,
  updateMovieSchema,
  getMovieByIdSchema,
  deleteMovieSchema,
} from "./movie.validation";

const router = Router();

router.get("/", asyncHandler(movieController.getMovies));

router.get(
  "/deleted",
  authMiddleware,
  authorize("admin"),
  asyncHandler(movieController.getDeletedMovies)
);

router.get("/:id", validate(getMovieByIdSchema), asyncHandler(movieController.getMovieById));

router.patch(
  "/:id/restore",
  authMiddleware,
  authorize("admin"),
  validate(getMovieByIdSchema),
  asyncHandler(movieController.restoreMovie)
);

router.post(
  "/",
  authMiddleware,
  authorize("admin"),
  validate(createMovieSchema),
  asyncHandler(movieController.createMovie)
);

router.put(
  "/:id",
  authMiddleware,
  authorize("admin"),
  validate(updateMovieSchema),
  asyncHandler(movieController.updateMovie)
);

router.delete(
  "/:id",
  authMiddleware,
  authorize("admin"),
  validate(deleteMovieSchema),
  asyncHandler(movieController.deleteMovie)
);

export default router;
