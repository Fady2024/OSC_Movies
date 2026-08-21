import * as React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { io, type Socket } from "socket.io-client";
import { Clapperboard, AlertTriangle, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/auth-context";
import { useQueryClient } from "@tanstack/react-query";
import type { AppNotification } from "@/types/notification.types";
import * as notificationsApi from "@/api/notifications.api";

const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api/v1";
const socketUrl = apiUrl.replace(/\/api\/v1\/?$/, "") || window.location.origin;

const SUB_CACHE_KEY = (userId?: string) =>
  userId ? `notify_new_movies:${userId}` : "notify_new_movies";

interface NotificationContextValue {
  unreadCount: number;
  subscription: boolean;
  connected: boolean;
  socket: Socket | null;
  refreshUnread: () => Promise<void>;
  toggleSubscription: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}

const NotificationContext = React.createContext<
  NotificationContextValue | undefined
>(undefined);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token, user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const socketRef = React.useRef<Socket | null>(null);
  const [socket, setSocket] = React.useState<Socket | null>(null);
  const subCacheKey = SUB_CACHE_KEY(user?.id);

  const [unreadCount, setUnreadCount] = React.useState(0);
  const [subscription, setSubscription] = React.useState(
    () => localStorage.getItem(subCacheKey) === "true"
  );
  const [connected, setConnected] = React.useState(false);

  React.useEffect(() => {
    if (!user?.id) return;
    const cached = localStorage.getItem(SUB_CACHE_KEY(user.id));
    if (cached !== null) {
      setSubscription(cached === "true");
    }
  }, [user?.id]);

  React.useEffect(() => {
    if (!token) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setSocket(null);
      setConnected(false);
      setUnreadCount(0);
      return;
    }

    notificationsApi
      .getUnreadCount()
      .then(setUnreadCount)
      .catch(() => undefined);
    notificationsApi
      .getSubscription()
      .then((value) => {
        setSubscription(value);
        localStorage.setItem(subCacheKey, String(value));
      })
      .catch(() => undefined);

    const socket = io(socketUrl, {
      auth: { token },
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;
    setSocket(socket);

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("notification:new", (notification: AppNotification) => {
      setUnreadCount((count) => count + 1);
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread"] });

      const movieId = notification.data?.movieId;

      if (notification.type === "showtime_alert") {
        toast(t("notifications.showtimeAlertToast", { title: notification.title }), {
          description: notification.body,
          icon: <AlertTriangle className="size-4" />,
          action: movieId
            ? {
                label: t("notifications.view"),
                onClick: () => navigate(`/movies/${movieId}`),
              }
            : undefined,
        });
***REMOVED***;
      }

      if (notification.type === "review_request") {
        toast(t("notifications.reviewRequestToast", { title: notification.title }), {
          description: notification.body,
          icon: <Star className="size-4 fill-cinema-gold text-cinema-gold" />,
          action: movieId
            ? {
                label: t("notifications.rateNow"),
                onClick: () => navigate(`/movies/${movieId}`),
              }
            : undefined,
        });
***REMOVED***;
      }

      toast(t("notifications.liveToast", { title: notification.title }), {
        description: t("notifications.newMovieBody", {
          title: notification.title,
        }),
        icon: <Clapperboard className="size-4" />,
        action: movieId
          ? {
              label: t("notifications.view"),
              onClick: () => navigate(`/movies/${movieId}`),
            }
          : undefined,
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setSocket(null);
      setConnected(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const refreshUnread = React.useCallback(async () => {
    const count = await notificationsApi.getUnreadCount();
    setUnreadCount(count);
  }, []);

  const toggleSubscription = React.useCallback(async () => {
    const next = await notificationsApi.setSubscription(!subscription);
    setSubscription(next);
    localStorage.setItem(subCacheKey, String(next));
    toast.success(
      next
        ? t("notifications.subscribedOn")
        : t("notifications.subscribedOff")
    );
  }, [subscription, subCacheKey, t]);

  const markRead = React.useCallback(async (id: string) => {
    await notificationsApi.markAsRead(id);
    setUnreadCount((count) => Math.max(0, count - 1));
  }, []);

  const markAllRead = React.useCallback(async () => {
    await notificationsApi.markAllAsRead();
    setUnreadCount(0);
  }, []);

  const value = React.useMemo(
    () => ({
      unreadCount,
      subscription,
      connected,
      socket,
      refreshUnread,
      toggleSubscription,
      markRead,
      markAllRead,
    }),
    [
      unreadCount,
      subscription,
      connected,
      socket,
      refreshUnread,
      toggleSubscription,
      markRead,
      markAllRead,
    ]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = React.useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}