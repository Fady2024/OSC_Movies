import { Router } from 'express';
import { asyncHandler } from '@/common/middleware/asyncHandler';
import { authMiddleware } from '@/common/middleware/auth.middleware';
import { validate } from '@/common/middleware/validation.middleware';
import * as paymentController from './payment.controller';
import {
  createPaymentIntentSchema,
  getPaymentStatusSchema,
} from './payment.validation';

const router = Router();

router.use(authMiddleware);

router.post(
  '/create-intent',
  validate(createPaymentIntentSchema),
  asyncHandler(paymentController.createPaymentIntent)
);

router.get(
  '/status/:bookingId',
  validate(getPaymentStatusSchema),
  asyncHandler(paymentController.getPaymentStatus)
);

export default router;
