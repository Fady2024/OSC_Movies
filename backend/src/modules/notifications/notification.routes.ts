import { Router } from "express";
import * as notificationController from "./notification.controller";
import { validate } from "@/common/middleware/validation.middleware";
import { authMiddleware } from "@/common/middleware/auth.middleware";
import { asyncHandler } from "@/common/middleware/asyncHandler";
import {
  listNotificationsSchema,
  notificationIdParamSchema,
  subscriptionSchema,
} from "./notification.validation";

const router = Router();

router.get(
  "/",
  authMiddleware,
  validate(listNotificationsSchema),
  asyncHandler(notificationController.getNotifications)
);

router.get(
  "/unread-count",
  authMiddleware,
  asyncHandler(notificationController.getUnreadCount)
);

router.get(
  "/subscription",
  authMiddleware,
  asyncHandler(notificationController.getMySubscription)
);

router.put(
  "/subscription",
  authMiddleware,
  validate(subscriptionSchema),
  asyncHandler(notificationController.updateMySubscription)
);

router.patch(
  "/read-all",
  authMiddleware,
  asyncHandler(notificationController.markAllAsRead)
);

router.patch(
  "/:id/read",
  authMiddleware,
  validate(notificationIdParamSchema),
  asyncHandler(notificationController.markOneAsRead)
);

export default router;