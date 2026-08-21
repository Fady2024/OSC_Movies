import { Router } from "express";
import * as bookingController from "./booking.controller";
import { asyncHandler } from "@/common/middleware/asyncHandler";
import { authMiddleware } from "@/common/middleware/auth.middleware";
import { validate } from "@/common/middleware/validation.middleware";
import { updateBookingSeatsSchema } from "./booking.validation";

const router = Router();

router.use(authMiddleware);

router.post("/", asyncHandler(bookingController.createBooking));
router.get("/my", asyncHandler(bookingController.getMyBookings));
router.get("/:id", asyncHandler(bookingController.getBookingById));
router.patch(
  "/:id/seats",
  validate(updateBookingSeatsSchema),
  asyncHandler(bookingController.updateBookingSeats)
);
router.patch("/:id/cancel", asyncHandler(bookingController.cancelBooking));

export default router;
