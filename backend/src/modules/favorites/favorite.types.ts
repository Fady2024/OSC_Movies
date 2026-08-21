import type { PaginatedResponse } from "@/common/types";

export type { PaginatedResponse };

export interface FavoriteFilter {
  page?: number;
  limit?: number;
}
