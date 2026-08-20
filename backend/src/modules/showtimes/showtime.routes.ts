import { Router } from "express";
import * as showtimeController from "./showtime.controller";
import { asyncHandler } from "@/common/middleware/asyncHandler";
import { authMiddleware } from "@/common/middleware/auth.middleware";
import { authorize } from "@/common/middleware/role.middleware";
import { validate } from "@/common/middleware/validation.middleware";
import {
  createShowtimeSchema,
  updateShowtimeSchema,
  getShowtimeByIdSchema,
  deleteShowtimeSchema,
} from "./showtime.validation";

const router = Router();

router.get("/", asyncHandler(showtimeController.getShowtimes));
router.get("/:id", validate(getShowtimeByIdSchema), asyncHandler(showtimeController.getShowtimeById));
router.get("/:id/seats", asyncHandler(showtimeController.getAvailableSeats));

router.post(
  "/",
  authMiddleware,
  authorize("admin"),
  validate(createShowtimeSchema),
  asyncHandler(showtimeController.createShowtime)
);

router.put(
  "/:id",
  authMiddleware,
  authorize("admin"),
  validate(updateShowtimeSchema),
  asyncHandler(showtimeController.updateShowtime)
);

router.delete(
  "/:id",
  authMiddleware,
  authorize("admin"),
  validate(deleteShowtimeSchema),
  asyncHandler(showtimeController.deleteShowtime)
);

export default router;
