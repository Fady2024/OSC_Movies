import mongoose, { Schema, Document } from 'mongoose';

export interface ISeatReservation extends Document {
  showtime: mongoose.Types.ObjectId;
  seatNumber: number;
  booking: mongoose.Types.ObjectId;
  createdAt: Date;
}

const seatReservationSchema = new Schema<ISeatReservation>(
  {
    showtime: {
      type: Schema.Types.ObjectId,
      ref: 'Showtime',
      required: [true, 'Showtime is required'],
    },
    seatNumber: {
      type: Number,
      required: [true, 'Seat number is required'],
      min: [1, 'Seat number must be at least 1'],
    },
    booking: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Booking is required'],
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

seatReservationSchema.index({ showtime: 1, seatNumber: 1 }, { unique: true });
seatReservationSchema.index({ showtime: 1 });
seatReservationSchema.index({ booking: 1 });

export const SeatReservation = mongoose.model<ISeatReservation>(
  'SeatReservation',
  seatReservationSchema
);
