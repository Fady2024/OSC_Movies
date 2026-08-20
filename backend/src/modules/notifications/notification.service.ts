import { Notification, INotification, NotificationType } from "./notification.model";
import { AppError } from "@/common/errors/AppError";
import { User } from "../users/user.model";
import { Showtime } from "@/modules/showtimes/showtime.model";
import { hasScreeningStarted } from "@/modules/showtimes/showtime.util";
import { Booking } from "@/modules/bookings/booking.model";
import { Review } from "@/modules/reviews/review.model";
import { emitToUser } from "@/socket/io";
import { toLocalDateString } from "@/common/utils/timezone";

export const SHOWTIME_LOW_SEATS_THRESHOLD = 0.8;

interface ListFilter {
  page: number;
  limit: number;
  type?: NotificationType;
  read?: boolean;
}

interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const listNotifications = async (
  userId: string,
  filter: ListFilter
): Promise<Paginated<INotification>> => {
  const { page = 1, limit = 10, type, read } = filter;

  const query: Record<string, unknown> = { user: userId };
  if (type) query.type = type;
  if (typeof read === "boolean") query.read = read;

  const total = await Notification.countDocuments(query);
  const data = await Notification.find(query)
    .sort("-createdAt")
    .skip((page - 1) * limit)
    .limit(limit);

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export const unreadCount = async (userId: string): Promise<number> => {
  return Notification.countDocuments({ user: userId, read: false });
};

export const markAsRead = async (
  userId: string,
  notificationId: string
): Promise<INotification> => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { read: true, readAt: new Date() },
    { new: true }
  );
  if (!notification) {
    throw new AppError("Notification not found", 404);
  }
  return notification;
};

export const markAllAsRead = async (userId: string): Promise<void> => {
  await Notification.updateMany(
    { user: userId, read: false },
    { read: true, readAt: new Date() }
  );
};

export const getSubscription = async (userId: string): Promise<boolean> => {
  const user = await User.findById(userId).select("notifyNewMovies");
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return user.notifyNewMovies;
};

export const setSubscription = async (
  userId: string,
  subscribe: boolean
): Promise<boolean> => {
  const user = await User.findByIdAndUpdate(
    userId,
    { notifyNewMovies: subscribe },
    { new: true, runValidators: true }
  );
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return user.notifyNewMovies;
};

export const deleteNotificationsForMovie = async (
  movieId: string
): Promise<void> => {
  await Notification.deleteMany({ "data.movieId": movieId });
};

export const notifyNewMovie = async (movie: {
  _id: unknown;
  title: string;
}): Promise<void> => {
  const subscribers = await User.find({
    role: "customer",
    notifyNewMovies: true,
    deletedAt: null,
  }).select("_id");

  if (subscribers.length === 0) return;

  const docs = subscribers.map((user) => ({
    user: user._id,
    type: "new_movie" as NotificationType,
    title: movie.title,
    body: movie.title,
    data: { movieId: String(movie._id) },
  }));

  const inserted = await Notification.insertMany(docs);

  for (const notification of inserted) {
    emitToUser(String(notification.user), "notification:new", {
      id: String(notification._id),
      type: notification.type,
      title: notification.title,
      body: notification.body,
      data: notification.data,
      read: notification.read,
      createdAt: notification.createdAt,
    });
  }
};

interface ShowtimeLike {
  _id: unknown;
  movie?: unknown;
  movieTitle?: string;
  hallName?: string;
  date?: Date;
  startTime?: string;
  bookedSeats?: number;
  totalCapacity?: number;
}

/**
 * Sends a one-time "seats running out" alert to subscribed customers when a
 * showtime reaches SHOWTIME_LOW_SEATS_THRESHOLD occupancy. Each showtime is
 * only alerted once (availabilityAlerted flag).
 */
export const notifyShowtimeAlmostFull = async (
  showtime: ShowtimeLike
): Promise<void> => {
  const total = showtime.totalCapacity ?? 0;
  const booked = showtime.bookedSeats ?? 0;
  if (total <= 0 || booked / total < SHOWTIME_LOW_SEATS_THRESHOLD) return;

  const showtimeDoc = await Showtime.findById(showtime._id).select(
    "availabilityAlerted movie movieTitle hallName date startTime"
  );
  if (!showtimeDoc || showtimeDoc.availabilityAlerted) return;

  showtimeDoc.availabilityAlerted = true;
  await showtimeDoc.save();

  const subscribers = await User.find({
    role: "customer",
    notifyNewMovies: true,
    deletedAt: null,
  }).select("_id");
  if (subscribers.length === 0) return;

  const movieId = String(showtime.movie ?? showtimeDoc.movie ?? "");
  const available = Math.max(0, total - booked);
  const when = showtimeDoc.date
    ? `${toLocalDateString(showtimeDoc.date)} ${showtimeDoc.startTime ?? ""}`
    : (showtimeDoc.startTime ?? "");

  const docs = subscribers.map((user) => ({
    user: user._id,
    type: "showtime_alert" as NotificationType,
    title: `Almost full: ${showtimeDoc.movieTitle ?? "Showtime"}`,
    body: `Only ${available} seats left for ${showtimeDoc.movieTitle ?? "this showtime"} in ${showtimeDoc.hallName ?? "the hall"} at ${when}`,
    data: { showtimeId: String(showtime._id), movieId },
  }));

  const inserted = await Notification.insertMany(docs);

  for (const notification of inserted) {
    emitToUser(String(notification.user), "notification:new", {
      id: String(notification._id),
      type: notification.type,
      title: notification.title,
      body: notification.body,
      data: notification.data,
      read: notification.read,
      createdAt: notification.createdAt,
    });
  }
};

/**
 * One-time "rate the movie you watched" prompts. Runs on a schedule: for every
 * customer with a confirmed booking on a showtime that has already started, if
 * they have not reviewed the movie and were not prompted before, a
 * review_request notification is created and pushed live.
 */
export const notifyReviewRequests = async (): Promise<number> => {
  const now = new Date();

  const bookings = await Booking.find({ status: "confirmed" })
    .populate("showtime", "movie date startTime movieTitle")
    .lean();

  const candidates = new Map<
    string,
    { customer: string; movie: string; title: string }
  >();

  for (const booking of bookings) {
    const showtime = booking.showtime as unknown as {
      movie?: unknown;
      date?: Date;
      startTime?: string;
      movieTitle?: string;
    };
    if (!showtime?.movie || !showtime.date || !showtime.startTime) continue;

    if (!hasScreeningStarted(showtime.date, showtime.startTime, now)) continue;

    const key = `${booking.customer}_${String(showtime.movie)}`;
    if (!candidates.has(key)) {
      candidates.set(key, {
        customer: String(booking.customer),
        movie: String(showtime.movie),
        title: showtime.movieTitle ?? "this movie",
      });
    }
  }

  if (candidates.size === 0) return 0;
  const pairs = [...candidates.values()];

  const reviewed = await Review.find({
    $or: pairs.map((p) => ({ customer: p.customer, movie: p.movie })),
  }).select("customer movie").lean();
  const reviewedSet = new Set(reviewed.map((r) => `${r.customer}_${r.movie}`));
  const pending = pairs.filter((p) => !reviewedSet.has(`${p.customer}_${p.movie}`));
  if (pending.length === 0) return 0;

  const notified = await Notification.find({
    type: "review_request",
    $or: pending.map((p) => ({ user: p.customer, "data.movieId": p.movie })),
  }).select("user data").lean();
  const notifiedSet = new Set(
    notified.map(
      (n) => `${n.user}_${(n.data as { movieId?: string } | undefined)?.movieId ?? ""}`
    )
  );
  const final = pending.filter(
    (p) => !notifiedSet.has(`${p.customer}_${p.movie}`)
  );
  if (final.length === 0) return 0;

  const docs = final.map((p) => ({
    user: p.customer,
    type: "review_request" as NotificationType,
    title: `Rate ${p.title}`,
    body: `You watched ${p.title} — share your rating and review`,
    data: { movieId: p.movie },
  }));

  const inserted = await Notification.insertMany(docs);

  for (const notification of inserted) {
    emitToUser(String(notification.user), "notification:new", {
      id: String(notification._id),
      type: notification.type,
      title: notification.title,
      body: notification.body,
      data: notification.data,
      read: notification.read,
      createdAt: notification.createdAt,
    });
  }

  return inserted.length;
};