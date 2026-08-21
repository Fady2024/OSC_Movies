import { Request, Response } from "express";
import * as notificationService from "./notification.service";

const parsePage = (value: string | undefined, fallback: number): number => {
  const parsed = value ? parseInt(value, 10) : fallback;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: List current user's notifications (paginated, filterable)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [new_movie] }
 *       - in: query
 *         name: read
 *         schema: { type: string, enum: [true, false] }
 *     responses:
 *       200:
 *         description: Paginated notifications
 */
export const getNotifications = async (req: Request, res: Response) => {
  const authUser = req.user as { sub: string };
  const { page, limit, type, read } = req.query;

  const result = await notificationService.listNotifications(authUser.sub, {
    page: parsePage(page as string, 1),
    limit: parsePage(limit as string, 10),
    type: (type as "new_movie") || undefined,
    read: read === undefined ? undefined : read === "true",
  });

  res.json(result);
};

/**
 * @swagger
 * /notifications/unread-count:
 *   get:
 *     summary: Number of unread notifications
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Unread count
 */
export const getUnreadCount = async (req: Request, res: Response) => {
  const authUser = req.user as { sub: string };
  const count = await notificationService.unreadCount(authUser.sub);
  res.json({ unreadCount: count });
};

/**
 * @swagger
 * /notifications/{id}/read:
 *   patch:
 *     summary: Mark a notification as read
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Updated notification
 */
export const markOneAsRead = async (req: Request, res: Response) => {
  const authUser = req.user as { sub: string };
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const notification = await notificationService.markAsRead(authUser.sub, id);
  res.json({ data: notification });
};

/**
 * @swagger
 * /notifications/read-all:
 *   patch:
 *     summary: Mark all notifications as read
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: All marked as read
 */
export const markAllAsRead = async (req: Request, res: Response) => {
  const authUser = req.user as { sub: string };
  await notificationService.markAllAsRead(authUser.sub);
  res.json({ success: true });
};

/**
 * @swagger
 * /notifications/subscription:
 *   get:
 *     summary: Get new-movie notification subscription status
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Subscription status
 *   put:
 *     summary: Subscribe/unsubscribe to new-movie notifications
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subscribe: { type: boolean }
 *     responses:
 *       200:
 *         description: Updated subscription status
 */
export const getMySubscription = async (req: Request, res: Response) => {
  const authUser = req.user as { sub: string };
  const subscribed = await notificationService.getSubscription(authUser.sub);
  res.json({ subscribed });
};

export const updateMySubscription = async (req: Request, res: Response) => {
  const authUser = req.user as { sub: string };
  const { subscribe } = req.body;
  const subscribed = await notificationService.setSubscription(
    authUser.sub,
    subscribe
  );
  res.json({ subscribed });
};