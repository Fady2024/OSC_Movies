import { Schema, Types, Document, Query } from "mongoose";
import { getContext } from "../context";

export interface AuditFields {
  createdBy?: Types.ObjectId | null;
  updatedBy?: Types.ObjectId | null;
}

export const auditPlugin = (schema: Schema): void => {
  const currentUserId = (): Types.ObjectId | null => {
    const { userId } = getContext();
    return userId ? new Types.ObjectId(userId) : null;
  };

  schema.add({
    createdBy: { type: Schema.Types.ObjectId, ref: "User", select: false, default: null },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", select: false, default: null },
  });

  schema.pre("save", function (this: Document & AuditFields, next) {
    const userId = currentUserId();
    if (!userId) return next();
    if (this.isNew) {
      this.createdBy = userId;
    }
    this.updatedBy = userId;
    next();
  });

  const stampUpdatedBy = function (this: Query<any, any>, next: () => void): void {
    const userId = currentUserId();
    if (!userId) return next();
    this.set({ updatedBy: userId });
    next();
  };

  schema.pre("findOneAndUpdate", stampUpdatedBy);
  schema.pre("updateOne", stampUpdatedBy);
  schema.pre("updateMany", stampUpdatedBy);
};
