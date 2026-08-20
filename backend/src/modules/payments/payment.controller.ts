import { Request, Response } from 'express';
import { AuthPayload } from '@/common/middleware/auth.middleware';
import * as paymentService from './payment.service';

export const createPaymentIntent = async (req: Request, res: Response) => {
  const authUser = req.user as AuthPayload;
  const { showtimeId, selectedSeats } = req.body;

  const result = await paymentService.createPaymentIntent(
    authUser.sub,
    showtimeId,
    selectedSeats
  );

  res.status(201).json({
    success: true,
    data: result,
  });
};

export const webhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string | undefined;
  if (!sig) {
    res.status(400).json({ success: false, message: 'Missing stripe-signature header' });
    return;
  }

  await paymentService.handleWebhook(sig, req.body);

  res.json({ received: true });
};

export const getPaymentStatus = async (req: Request, res: Response) => {
  const authUser = req.user as AuthPayload;

  const result = await paymentService.getPaymentStatus(
    String(req.params.bookingId),
    authUser.sub
  );

  res.json({ success: true, data: result });
};
