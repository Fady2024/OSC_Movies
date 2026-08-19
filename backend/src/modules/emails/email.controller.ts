import { Request, Response } from "express";
import { AuthPayload } from "@/common/middleware/auth.middleware";
import { emailService } from "./email.service";

export const sendBookingConfirmation = async (req: Request, res: Response) => {
  const authUser = req.user as AuthPayload;
  const { bookingId } = req.body;

  const message = await emailService.sendBookingConfirmationEmail(
    bookingId,
    authUser.sub
  );

  res.json({ status: "success", message });
};

export const sendShowtimeReminder = async (req: Request, res: Response) => {
  const { showtimeId } = req.body;

  const message = await emailService.sendShowtimeReminderEmail(showtimeId);

  res.json({ status: "success", message });
};