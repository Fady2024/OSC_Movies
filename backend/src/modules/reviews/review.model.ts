import mongoose, { Schema, Document } from "mongoose";
import {
  transformId,
  auditPlugin,
  type AuditFields,
} from "@/common/mongoose";

export interface IReview extends Document, AuditFields {
  movie: mongoose.Types.ObjectId;
  customer: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    movie: {
      type: Schema.Types.ObjectId,
      ref: "Movie",
      required: [true, "Movie is required"],
      index: true,
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Customer is required"],
      index: true,
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [10, "Rating must be at most 10"],
    },
    comment: {
      type: String,
      required: [true, "Comment is required"],
      trim: true,
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
    },
  },
  {
    timestamps: true,
    toJSON: { transform: transformId },
  }
);

reviewSchema.index({ movie: 1, customer: 1 }, { unique: true });
reviewSchema.index({ movie: 1, createdAt: -1 });

reviewSchema.plugin(auditPlugin);

export const Review = mongoose.model<IReview>("Review", reviewSchema);
