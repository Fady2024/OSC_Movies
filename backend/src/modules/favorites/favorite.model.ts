import mongoose, { Schema, Document } from 'mongoose';
import {
  transformId,
  auditPlugin,
  type AuditFields,
} from "@/common/mongoose";

export interface IFavorite extends Document, AuditFields {
  user: mongoose.Types.ObjectId;
  movie: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const favoriteSchema = new Schema<IFavorite>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    movie: {
      type: Schema.Types.ObjectId,
      ref: 'Movie',
      required: [true, 'Movie is required'],
    },
  },
  {
    timestamps: true,
    toJSON: { transform: transformId },
  }
);

favoriteSchema.index({ user: 1, movie: 1 }, { unique: true });
favoriteSchema.index({ user: 1 });

favoriteSchema.plugin(auditPlugin);

export const Favorite = mongoose.model<IFavorite>('Favorite', favoriteSchema);
