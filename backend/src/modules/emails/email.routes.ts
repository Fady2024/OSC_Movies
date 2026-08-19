import { Router } from "express";
import { authenticate } from "@/common/middleware/auth.middleware";
import { asyncHandler } from "@/common/middleware/asyncHandler";
import { validate } from "@/common/middleware/validation.middleware";
import {
  sendBookingConfirmation,
  sendShowtimeReminder,
} from "./email.controller";
import {
  sendBookingConfirmationSchema,
  sendShowtimeReminderSchema,
} from "./email.validation";

const router = Router();

router.post(
  "/send-booking-confirmation",
  authenticate,
  validate(sendBookingConfirmationSchema),
  asyncHandler(sendBookingConfirmation)
);

router.post(
  "/send-showtime-reminder",
  authenticate,
  validate(sendShowtimeReminderSchema),
  asyncHandler(sendShowtimeReminder)
);

export default router;