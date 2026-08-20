import mongoose, { Schema, Document } from 'mongoose';
import {
  transformId,
  softDeletePlugin,
  auditPlugin,
  type SoftDeleteStatics,
  type AuditFields,
} from "@/common/mongoose";

export interface IMovie extends Document, AuditFields {
  title: string;
  genre: string[];
  duration: number;
  description: string;
  posterUrl: string;
  rating: number;
  status: 'now_showing' | 'coming_soon';
  director?: string;
  cast?: string[];
  releaseDate?: Date;
  language?: string;
  ageRating?: string;
  trailerUrl?: string;
  deletedAt?: Date | null;
  deletedBy?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const movieSchema = new Schema<IMovie>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    genre: {
      type: [String],
      required: [true, 'Genre is required'],
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      min: 1,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    posterUrl: {
      type: String,
      required: [true, 'Poster URL is required'],
      trim: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    status: {
      type: String,
      enum: ['now_showing', 'coming_soon'],
      default: 'coming_soon',
    },
    director: {
      type: String,
      trim: true,
    },
    cast: {
      type: [String],
    },
    releaseDate: {
      type: Date,
    },
    language: {
      type: String,
      trim: true,
    },
    ageRating: {
      type: String,
      trim: true,
    },
    trailerUrl: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { transform: transformId },
  }
);

movieSchema.plugin(softDeletePlugin);
movieSchema.plugin(auditPlugin);

movieSchema.index({ title: 1 });
movieSchema.index({ genre: 1 });
movieSchema.index({ status: 1 });

export const Movie = mongoose.model<IMovie, SoftDeleteStatics<IMovie>>('Movie', movieSchema);
