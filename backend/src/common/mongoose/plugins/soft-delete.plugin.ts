import { Schema, Model, Document, FilterQuery, Query, Types } from "mongoose";
import { getContext } from "../context";

export interface SoftDeleteFields {
  deletedAt: Date | null;
  deletedBy?: Types.ObjectId | null;
}

export interface SoftDeleteStatics<T extends Document> extends Model<T> {
  softDelete(filter: FilterQuery<T>): Promise<T | null>;
  restore(filter: FilterQuery<T>): Promise<T | null>;
  findWithDeleted(filter?: FilterQuery<T>): Query<T[], T, SoftDeleteStatics<T>>;
  findDeleted(filter?: FilterQuery<T>): Query<T[], T, SoftDeleteStatics<T>>;
}


export const softDeletePlugin = (schema: Schema): void => {
  const currentUserId = (): Types.ObjectId | null => {
    const { userId } = getContext();
    return userId ? new Types.ObjectId(userId) : null;
  };

  const excludeDeleted = function (this: Query<any, any>, next: () => void): void {
    if (this.getFilter().deletedAt === undefined) {
      this.where({ deletedAt: null });
    }
    next();
  };

  schema.add({
    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      select: false,
      default: null,
    },
  });

  schema.pre("find", excludeDeleted);
  schema.pre("findOne", excludeDeleted);
  schema.pre("countDocuments", excludeDeleted);

  schema.pre("findOneAndUpdate", function (next) {
    excludeDeleted.call(this, next);

    const update = this.getUpdate() as Record<string, any> | undefined;
    if (update == null) return next();
    const rawDeletedAt =
      update.deletedAt !== undefined ? update.deletedAt : update.$set?.deletedAt;
    if (rawDeletedAt === undefined) return next();

    const deletedBy = rawDeletedAt === null ? null : currentUserId();
    if (update.$set) {
      update.$set.deletedBy = deletedBy;
    } else {
      update.deletedBy = deletedBy;
    }
    next();
  });

  schema.methods.softDelete = function (this: Document & SoftDeleteFields) {
    this.deletedAt = new Date();
    this.deletedBy = currentUserId();
    return this.save();
  };

  schema.methods.restore = function (this: Document & SoftDeleteFields) {
    this.deletedAt = null;
    this.deletedBy = null;
    return this.save();
  };

  schema.statics.softDelete = function <T extends Document>(
    this: Model<T>,
    filter: FilterQuery<T>
  ) {
    return this.findOneAndUpdate(
      filter,
      {
        deletedAt: new Date(),
        deletedBy: currentUserId(),
      },
      { new: true }
    );
  };

  schema.statics.restore = function <T extends Document>(
    this: Model<T>,
    filter: FilterQuery<T>
  ) {
    return this.findOneAndUpdate(
      filter,
      { deletedAt: null, deletedBy: null },
      { new: true }
    );
  };

  schema.statics.findWithDeleted = function <T extends Document>(
    this: Model<T>,
    filter: FilterQuery<T> = {}
  ) {
    return this.find({ ...filter, deletedAt: { $exists: true } });
  };

  schema.statics.findDeleted = function <T extends Document>(
    this: Model<T>,
    filter: FilterQuery<T> = {}
  ) {
    return this.find({ ...filter, deletedAt: { $ne: null } });
  };
};