import { Router } from "express";
import * as reviewController from "./review.controller";
import { validate } from "@/common/middleware/validation.middleware";
import { authMiddleware } from "@/common/middleware/auth.middleware";
import { asyncHandler } from "@/common/middleware/asyncHandler";
import {
  createReviewSchema,
  updateReviewSchema,
  deleteReviewSchema,
  listReviewsSchema,
  getMyReviewSchema,
} from "./review.validation";

const router = Router();

router.get(
  "/movies/:id/reviews",
  validate(listReviewsSchema),
  asyncHandler(reviewController.listReviews)
);

router.post(
  "/movies/:id/reviews",
  authMiddleware,
  validate(createReviewSchema),
  asyncHandler(reviewController.createReview)
);

router.get(
  "/movies/:id/reviews/me",
  authMiddleware,
  validate(getMyReviewSchema),
  asyncHandler(reviewController.getMyReview)
);

router.patch(
  "/reviews/:id",
  authMiddleware,
  validate(updateReviewSchema),
  asyncHandler(reviewController.updateReview)
);

router.delete(
  "/reviews/:id",
  authMiddleware,
  validate(deleteReviewSchema),
  asyncHandler(reviewController.deleteReview)
);

export default router;