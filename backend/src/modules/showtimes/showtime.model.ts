import mongoose, { Schema, Document } from 'mongoose';
import {
  transformId,
  composeTransforms,
  auditPlugin,
  type AuditFields,
} from "@/common/mongoose";

export interface IShowtime extends Document, AuditFields {
  movie: mongoose.Types.ObjectId;
  hallName: string;
  date: Date;
  startTime: string;
  endTime: string;
  ticketPrice: number;
  totalCapacity: number;
  bookedSeats: number;
  availableSeats: number;
  movieTitle: string;
  moviePosterUrl: string;
  availabilityAlerted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const formatLocalDate = (_doc: Document, ret: Record<string, any>) => {
  if (ret.date instanceof Date) {
    const y = ret.date.getFullYear();
    const m = String(ret.date.getMonth() + 1).padStart(2, "0");
    const d = String(ret.date.getDate()).padStart(2, "0");
    ret.date = `${y}-${m}-${d}`;
  }
};

const showtimeSchema = new Schema<IShowtime>(
  {
    movie: {
      type: Schema.Types.ObjectId,
      ref: 'Movie',
      required: [true, 'Movie reference is required'],
    },
    hallName: {
      type: String,
      required: [true, 'Hall name is required'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'Start time must be in HH:mm format'],
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'End time must be in HH:mm format'],
    },
    ticketPrice: {
      type: Number,
      required: [true, 'Ticket price is required'],
      min: [0, 'Ticket price cannot be negative'],
    },
    totalCapacity: {
      type: Number,
      required: [true, 'Total capacity is required'],
      min: [1, 'Total capacity must be at least 1'],
    },
    bookedSeats: {
      type: Number,
      default: 0,
      min: 0,
    },
    availableSeats: {
      type: Number,
    },
    movieTitle: {
      type: String,
      trim: true,
    },
    moviePosterUrl: {
      type: String,
      trim: true,
    },
    availabilityAlerted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { transform: composeTransforms(transformId, formatLocalDate) },
  }
);

showtimeSchema.index({ movie: 1 });
showtimeSchema.index({ date: 1 });

showtimeSchema.plugin(auditPlugin);

showtimeSchema.pre('save', function (next) {
  this.availableSeats = this.totalCapacity - this.bookedSeats;
  next();
});

export const Showtime = mongoose.model<IShowtime>('Showtime', showtimeSchema);
