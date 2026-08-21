import * as React from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Clapperboard, CheckCheck, BellOff, Star } from "lucide-react";
import {
  useInfiniteQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { useNotifications } from "@/context/notification-context";
import * as notificationsApi from "@/api/notifications.api";
import type {
  AppNotification,
  NotificationsResponse,
} from "@/types/notification.types";
import { cn } from "@/lib/utils";

type NotificationFilter = {
  type?: "new_movie" | "review_request";
  read?: boolean;
};

const FILTERS: { key: string; filter: NotificationFilter }[] = [
  { key: "all", filter: {} },
  { key: "unread", filter: { read: false } },
  { key: "newMovies", filter: { type: "new_movie" } },
  { key: "reviews", filter: { type: "review_request" } },
];

function formatTime(dateStr: string, t: TFunction): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return t("notifications.justNow");
  if (minutes < 60) return t("notifications.minutesAgo", { count: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t("notifications.hoursAgo", { count: hours });
  return t("notifications.daysAgo", { count: Math.floor(hours / 24) });
}

export function NotificationBell() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    unreadCount,
    subscription,
    connected,
    toggleSubscription,
    markRead,
    markAllRead,
  } = useNotifications();

  const [open, setOpen] = React.useState(false);
  const [filter, setFilter] = React.useState<NotificationFilter>({});

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["notifications", filter],
    queryFn: ({ pageParam }) =>
      notificationsApi.getNotifications({
        page: pageParam,
        limit: 15,
        ...filter,
      }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.page < last.totalPages ? last.page + 1 : undefined,
    enabled: open,
    staleTime: 30_000,
  });

  const notifications = data?.pages.flatMap((page) => page.data) ?? [];
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const sentinelRef = React.useRef<HTMLLIElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const el = sentinelRef.current;
    const root = scrollRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { root, rootMargin: "120px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [open, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const updateReadState = (id: string) => {
    queryClient.setQueriesData<InfiniteData<NotificationsResponse>>(
      { queryKey: ["notifications"] },
      (old) =>
        old
          ? {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                data: page.data.map((n) =>
                  n.id === id ? { ...n, read: true } : n
                ),
              })),
            }
          : old
    );
  };

  const handleItemClick = async (n: AppNotification) => {
    if (!n.read) {
      await markRead(n.id);
      updateReadState(n.id);
    }
    if (n.data?.movieId) {
      navigate(`/movies/${n.data.movieId}`);
    }
  };

  const handleMarkAll = async () => {
    await markAllRead();
    queryClient.setQueriesData<InfiniteData<NotificationsResponse>>(
      { queryKey: ["notifications"] },
      (old) =>
        old
          ? {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                data: page.data.map((n) => ({ ...n, read: true })),
              })),
            }
          : old
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={t("notifications.title")}
          title={t("notifications.title")}
        >
          <motion.span
            key={unreadCount}
            animate={unreadCount > 0 ? { rotate: [0, -14, 12, -8, 0] } : {}}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="flex"
          >
            <Bell className="size-4" />
          </motion.span>
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 18 }}
                className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[min(24rem,calc(100vw-2rem))] p-0"
      >
        <div className="flex items-center justify-between px-4 pt-4">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold">
              {t("notifications.title")}
            </h2>
            {connected && (
              <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-500">
                <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
                {t("notifications.live")}
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-xs text-muted-foreground"
            onClick={handleMarkAll}
            disabled={unreadCount === 0}
          >
            <CheckCheck className="size-3.5" />
            {t("notifications.markAll")}
          </Button>
        </div>

        <div className="flex items-center justify-between gap-2 px-4 pb-3 pt-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Bell className="size-3.5" />
            {t("notifications.subscribe")}
          </div>
          <Switch
            checked={subscription}
            onCheckedChange={() => void toggleSubscription()}
            size="sm"
          />
        </div>

        <Separator />

        <div className="flex gap-1 px-3 py-2">
          {FILTERS.map(({ key, filter: f }) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                JSON.stringify(filter) === JSON.stringify(f)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              {t(`notifications.filter${key[0].toUpperCase()}${key.slice(1)}`)}
            </button>
          ))}
        </div>

        <Separator />

        <div
          ref={scrollRef}
          className="max-h-80 overflow-y-auto p-2"
        >
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner className="text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <BellOff className="size-8 text-muted-foreground/60" />
              <p className="text-sm font-medium">
                {t("notifications.empty")}
              </p>
              <p className="max-w-[16rem] text-xs text-muted-foreground">
                {t("notifications.emptyDesc")}
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-1">
              <AnimatePresence initial={false}>
                {notifications.map((n) => (
                  <motion.li
                    key={n.id}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <button
                      type="button"
                      onClick={() => void handleItemClick(n)}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-accent",
                        !n.read && "bg-accent/40"
                      )}
                    >
                      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        {n.type === "new_movie" ? (
                          <Clapperboard className="size-4" />
                        ) : n.type === "review_request" ? (
                          <Star className="size-4" />
                        ) : (
                          <Bell className="size-4" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {n.type === "new_movie"
                            ? t("notifications.newMovie")
                            : n.type === "review_request"
                              ? t("notifications.reviewRequest")
                              : t("notifications.showtimeAlert")}
                        </span>
                        <span className="block truncate text-sm text-foreground">
                          {n.title}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {formatTime(n.createdAt, t)}
                        </span>
                      </span>
                      {!n.read && (
                        <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                      )}
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
              <li ref={sentinelRef} className="h-px w-full" />
              {isFetchingNextPage && (
                <li className="flex justify-center py-3">
                  <Spinner className="text-muted-foreground" />
                </li>
              )}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}