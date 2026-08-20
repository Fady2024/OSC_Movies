import { Request, Response } from "express";
import * as bookingService from "./booking.service";
import { AuthPayload } from "@/common/middleware/auth.middleware";

export const createBooking = async (req: Request, res: Response) => {
  const { showtimeId, selectedSeats } = req.body;
  const authUser = req.user as AuthPayload;

  const booking = await bookingService.createBooking(authUser.sub, showtimeId, selectedSeats);
  res.status(201).json({ data: booking });
};

export const getMyBookings = async (req: Request, res: Response) => {
  const authUser = req.user as AuthPayload;
  const { status, page, limit } = req.query;

  const result = await bookingService.getMyBookings(authUser.sub, {
    status: status as string,
    page: page ? parseInt(page as string, 10) : 1,
    limit: limit ? parseInt(limit as string, 10) : 20,
  });

  res.json(result);
};

export const getBookingById = async (req: Request, res: Response) => {
  const authUser = req.user as AuthPayload;
  const booking = await bookingService.getBookingById(String(req.params.id), authUser.sub);
  res.json({ data: booking });
};

export const cancelBooking = async (req: Request, res: Response) => {
  const authUser = req.user as AuthPayload;
  const booking = await bookingService.cancelBooking(String(req.params.id), authUser.sub);
  res.json({ data: booking });
};

export const updateBookingSeats = async (req: Request, res: Response) => {
  const authUser = req.user as AuthPayload;
  const booking = await bookingService.updateBookingSeats(
    String(req.params.id),
    authUser.sub,
    req.body.selectedSeats
  );
  res.json({ data: booking });
};
