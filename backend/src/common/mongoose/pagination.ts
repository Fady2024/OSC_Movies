import { Model, FilterQuery, PopulateOptions } from "mongoose";
import { PaginatedResponse } from "@/common/types";

export interface PaginateOptions {
  page?: number;
  limit?: number;
  sort?: string;
  populate?: PopulateOptions[] | string[];
}

/**
 * Shared pagination pipeline — count + slice + page metadata 
 */
export const paginate = async <T>(
  model: Model<T>,
  query: FilterQuery<T>,
  { page = 1, limit = 10, sort = "-createdAt", populate = [] }: PaginateOptions = {}
): Promise<PaginatedResponse<T>> => {
  const total = await model.countDocuments(query);
  const data = await model
    .find(query)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit)
    .populate(populate as any);

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};