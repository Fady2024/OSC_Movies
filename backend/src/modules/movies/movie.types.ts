import type { PaginatedResponse } from "@/common/types";

export type { PaginatedResponse };

export interface MovieFilter {
  title?: string;
  director?: string;
  genre?: string;
  status?: "now_showing" | "coming_soon";
  sort?: string;
  page?: number;
  limit?: number;
}
