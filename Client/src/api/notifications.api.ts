import { apiClient } from "./client";
import type {
  AppNotification,
  ListNotificationsParams,
  NotificationsResponse,
} from "@/types/notification.types";

export async function getNotifications(
  params: ListNotificationsParams
): Promise<NotificationsResponse> {
  const { data } = await apiClient.get<NotificationsResponse>("/notifications", {
    params: {
      page: params.page,
      limit: params.limit ?? 15,
      type: params.type,
      read: params.read,
    },
  });
  return data;
}

export async function getUnreadCount(): Promise<number> {
  const { data } = await apiClient.get<{ unreadCount: number }>(
    "/notifications/unread-count"
  );
  return data.unreadCount;
}

export async function markAsRead(id: string): Promise<AppNotification> {
  const { data } = await apiClient.patch<{ data: AppNotification }>(
    `/notifications/${id}/read`
  );
  return data.data;
}

export async function markAllAsRead(): Promise<void> {
  await apiClient.patch("/notifications/read-all");
}

export async function getSubscription(): Promise<boolean> {
  const { data } = await apiClient.get<{ subscribed: boolean }>(
    "/notifications/subscription"
  );
  return data.subscribed;
}

export async function setSubscription(
  subscribe: boolean
): Promise<boolean> {
  const { data } = await apiClient.put<{ subscribed: boolean }>(
    "/notifications/subscription",
    { subscribe }
  );
  return data.subscribed;
}