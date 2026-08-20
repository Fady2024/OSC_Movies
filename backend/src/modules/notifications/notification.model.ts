import mongoose, { Schema, Document } from "mongoose";
import {
  transformId,
  auditPlugin,
  type AuditFields,
} from "@/common/mongoose";

export type NotificationType = "new_movie" | "showtime_alert" | "review_request";

export interface INotification extends Document, AuditFields {
  user: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  read: boolean;
  readAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true,
    },
      type: {
        type: String,
        enum: ["new_movie", "showtime_alert", "review_request"],
        required: [true, "Type is required"],
      },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    body: {
      type: String,
      required: [true, "Body is required"],
      trim: true,
    },
    data: {
      type: Schema.Types.Mixed,
      default: {},
    },
    read: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { transform: transformId },
  }
);

notificationSchema.index({ user: 1, read: 1 });
notificationSchema.index({ user: 1, createdAt: -1 });

notificationSchema.plugin(auditPlugin);

export const Notification = mongoose.model<INotification>(
  "Notification",
  notificationSchema
);