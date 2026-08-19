import type { Document } from "mongoose";

export type ToJSONTransform = (doc: Document, ret: Record<string, any>) => void;

/**
 * Converts `_id` to `id`, dropping the version key. Shared across every model
 */
export const transformId: ToJSONTransform = (_doc, ret) => {
  if (ret._id != null) {
    ret.id = String(ret._id);
  }
  delete ret._id;
  delete ret.__v;
};


export const composeTransforms =
  (...transforms: ToJSONTransform[]): ToJSONTransform =>
  (doc, ret) => {
    for (const transform of transforms) {
      transform(doc, ret);
    }
  };