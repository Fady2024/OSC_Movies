import { apiClient } from "./client";
import type { PaginatedResponse } from "@/types/booking.types";

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: "customer" | "admin";
  notifyNewMovies: boolean;
  deletedAt?: string | null;
  createdAt: string;
  bookingCount: number;
  totalSpent: number;
}

export interface LogEntry {
  id: string;
  [key: string]: unknown;
}

export interface LogsResponse extends PaginatedResponse<LogEntry> {
  enabled: boolean;
}

export interface ListUsersParams {
  search?: string;
  role?: string;
  page?: number;
  limit?: number;
}

export interface ListLogsParams {
  search?: string;
  level?: string;
  page?: number;
  limit?: number;
}

export async function getAdminUsers(
  filter: ListUsersParams = {}
): Promise<PaginatedResponse<AdminUser>> {
  const params: Record<string, string | number> = {};
  if (filter.search) params.search = filter.search;
  if (filter.role) params.role = filter.role;
  if (filter.page) params.page = filter.page;
  if (filter.limit) params.limit = filter.limit;

  const { data: res } = await apiClient.get("/admin/users", { params });
  return {
    data: res.data ?? [],
    total: res.total ?? 0,
    page: res.page ?? 1,
    limit: res.limit ?? 20,
    totalPages: res.totalPages ?? 1,
  };
}

export async function getAdminLogs(
  filter: ListLogsParams = {}
): Promise<LogsResponse> {
  const params: Record<string, string | number> = {};
  if (filter.search) params.search = filter.search;
  if (filter.level) params.level = filter.level;
  if (filter.page) params.page = filter.page;
  if (filter.limit) params.limit = filter.limit;

  const { data: res } = await apiClient.get("/admin/logs", { params });
  return {
    data: res.data ?? [],
    total: res.total ?? 0,
    page: res.page ?? 1,
    limit: res.limit ?? 20,
    totalPages: res.totalPages ?? 1,
    enabled: res.enabled ?? false,
  };
}

export async function updateUserRole(id: string, role: string) {
  const { data } = await apiClient.patch(`/admin/users/${id}/role`, { role });
  return data;
}