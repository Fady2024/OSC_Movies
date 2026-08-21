export type NotificationType = "new_movie" | "showtime_alert" | "review_request";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: {
    movieId?: string;
    showtimeId?: string;
  };
  read: boolean;
  readAt?: string | null;
  createdAt: string;
}

export interface NotificationsResponse {
  data: AppNotification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ListNotificationsParams {
  page: number;
  limit?: number;
  type?: NotificationType;
  read?: boolean;
}