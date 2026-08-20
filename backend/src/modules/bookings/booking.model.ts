import mongoose, { Schema, Document } from 'mongoose';
import {
  transformId,
  auditPlugin,
  type AuditFields,
} from "@/common/mongoose";

export interface IBooking extends Document, AuditFields {
  customer: mongoose.Types.ObjectId;
  showtime: mongoose.Types.ObjectId;
  selectedSeats: number[];
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  paymentIntentId?: string;
  paymentStatus: 'unpaid' | 'paid' | 'failed' | 'refunded';
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer is required'],
    },
    showtime: {
      type: Schema.Types.ObjectId,
      ref: 'Showtime',
      required: [true, 'Showtime is required'],
    },
    selectedSeats: {
      type: [Number],
      required: [true, 'Selected seats are required'],
      validate: {
        validator: (seats: number[]) => seats.length > 0,
        message: 'At least one seat must be selected',
      },
    },
    totalPrice: {
      type: Number,
      required: [true, 'Total price is required'],
      min: [0, 'Total price cannot be negative'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending',
    },
    paymentIntentId: {
      type: String,
      sparse: true,
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'failed', 'refunded'],
      default: 'unpaid',
    },
    paidAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { transform: transformId },
  }
);

bookingSchema.index({ customer: 1 });
bookingSchema.index({ showtime: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ paymentIntentId: 1 }, { sparse: true });

bookingSchema.plugin(auditPlugin);

export const Booking = mongoose.model<IBooking>('Booking', bookingSchema);
