import { Router } from "express";
import { authenticate } from "@/common/middleware/auth.middleware";
import { authorize } from "@/common/middleware/role.middleware";
import { asyncHandler } from "@/common/middleware/asyncHandler";
import { validate } from "@/common/middleware/validation.middleware";
import {
  updateBookingStatusSchema,
  updateUserRoleSchema,
  deleteReviewSchema,
} from "./admin.validation";
import {
  getDashboardStats,
  getBookings,
  updateBookingStatus,
  getUsers,
  getLogs,
  updateUserRole,
  getReviews,
  deleteReview,
} from "./admin.controller";

const router = Router();

router.use(authenticate);
router.use(authorize("admin"));

router.get("/stats", asyncHandler(getDashboardStats));
router.get("/bookings", asyncHandler(getBookings));
router.patch("/bookings/:id/status", validate(updateBookingStatusSchema), asyncHandler(updateBookingStatus));
router.get("/users", asyncHandler(getUsers));
router.patch("/users/:id/role", validate(updateUserRoleSchema), asyncHandler(updateUserRole));
router.get("/logs", asyncHandler(getLogs));
router.get("/reviews", asyncHandler(getReviews));
router.delete("/reviews/:id", validate(deleteReviewSchema), asyncHandler(deleteReview));

export default router;
