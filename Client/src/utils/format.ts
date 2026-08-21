import type { MovieGenre, MovieStatus } from "@/types/movie.types";
import i18n from "@/i18n";

function currentLocale(): string {
  return i18n.language?.toLowerCase().startsWith("ar") ? "ar-EG" : "en-US";
}

export const GENRE_LABELS: Record<MovieGenre, string> = {
  action: "Action",
  drama: "Drama",
  comedy: "Comedy",
  thriller: "Thriller",
  horror: "Horror",
  "sci-fi": "Sci-Fi",
  romance: "Romance",
  animation: "Animation",
  documentary: "Documentary",
  fantasy: "Fantasy",
  mystery: "Mystery",
  adventure: "Adventure",
};

export const STATUS_LABELS: Record<MovieStatus, string> = {
  now_showing: "Now Showing",
  coming_soon: "Coming Soon",
};

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString(currentLocale(), {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatDateLong(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString(currentLocale(), {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatTime(time: string): string {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return time;
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString(currentLocale(), { hour: "numeric", minute: "2-digit" });
}

export function showtimeTimestamp(date: string, startTime: string): number {
  const d = new Date(date);
  const [h, m] = startTime.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return Number.NaN;
  d.setHours(h, m, 0, 0);
  return d.getTime();
}

export function isUpcomingShowtime(
  date: string,
  startTime: string,
  now: Date = new Date()
): boolean {
  return showtimeTimestamp(date, startTime) > now.getTime();
}

export function formatPrice(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export function getDayLabel(dateStr: string): { day: string; date: string; full: string } {
  const d = new Date(dateStr);
  return {
    day: d.toLocaleDateString(currentLocale(), { weekday: "short" }).toUpperCase(),
    date: d.toLocaleDateString(currentLocale(), { day: "numeric" }),
    full: d.toLocaleDateString(currentLocale(), { weekday: "long", month: "long", day: "numeric" }),
  };
}

export function isPastDate(dateStr: string): boolean {
  const d = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
}

export function canCancelBooking(bookingDate: string, startTime: string): boolean {
  const showtime = new Date(`${bookingDate}T${convertTo24Hour(startTime)}`);
  const now = new Date();
  return showtime.getTime() > now.getTime();
}

function convertTo24Hour(time12h: string): string {
  const [time, modifier] = time12h.split(" ");
  let [hours, minutes] = time.split(":").map(Number);
  if (modifier === "PM" && hours < 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;
}
