import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  Clock,
  Calendar,
  Film,
  Users,
  Globe,
  MessageSquare,
  Pencil,
  Trash2,
  PlayCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { getMovieById } from "@/api/movies.api";
import { getShowtimes } from "@/api/showtimes.api";
import {
  getMovieReviews,
  getMyReview,
  createReview,
  updateReview,
  deleteReview,
} from "@/api/reviews.api";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ErrorState } from "@/components/shared/states";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import type { ReviewFormData } from "@/types/review.types";
import {
  GENRE_LABELS,
  STATUS_LABELS,
  formatDuration,
  formatDateLong,
  formatTime,
  getDayLabel,
  isUpcomingShowtime,
} from "@/utils/format";
import { cn } from "@/lib/utils";

function getYouTubeEmbedUrl(url: string): string {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  if (match) return `https://www.youtube.com/embed/${match[1]}`;
  if (url.includes("/embed/")) return url;
  return url;
}

export function MovieDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);

  const { data: movie, isLoading, isError, refetch } = useQuery({
    queryKey: ["movie", id],
    queryFn: () => getMovieById(id!),
    enabled: !!id,
  });

  const { data: showtimesData } = useQuery({
    queryKey: ["showtimes", "movie", id],
    queryFn: () => getShowtimes({ movieId: id, status: "upcoming" }),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
          <Skeleton className="aspect-[2/3] w-full max-w-xs rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !movie) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ErrorState
          title={t("movieDetail.notFound")}
          description="This movie may have been removed or doesn't exist."
          onRetry={refetch}
        />
      </div>
    );
  }

  const showtimes = (showtimesData?.data ?? []).filter((s) => isUpcomingShowtime(s.date, s.startTime));
  const dates = [...new Set(showtimes.map((s) => s.date))].sort();
  const activeDate = selectedDate ?? dates[0] ?? null;
  const dayShowtimes = showtimes.filter((s) => s.date === activeDate);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link to="/movies">
        <motion.div whileHover={{ x: -4 }} whileTap={{ scale: 0.96 }}>
          <Button variant="ghost" size="sm" className="mb-6 gap-1.5">
            <ArrowLeft className="size-4" />
            Back to Movies
          </Button>
        </motion.div>
      </Link>

      <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
        {/* Poster */}
        <motion.div
          className="mx-auto w-full max-w-xs lg:mx-0"
          initial={{ opacity: 0, x: -40, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="relative overflow-hidden rounded-2xl border border-border/60 shadow-xl">
            <motion.img
              src={movie.posterUrl}
              alt={movie.title}
              className="aspect-[2/3] w-full object-cover"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>

        {/* Details */}
        <motion.div
          className="flex flex-col gap-6"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant={movie.status === "now_showing" ? "default" : "secondary"}
                className={movie.status === "now_showing" ? "bg-cinema-gold text-cinema-gold-foreground" : ""}
              >
                {STATUS_LABELS[movie.status]}
              </Badge>
              <Badge variant="outline">{movie.ageRating}</Badge>
              <Badge variant="outline">{movie.language}</Badge>
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {movie.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Star className="size-4 fill-cinema-gold text-cinema-gold" />
                <span className="font-semibold text-foreground">{movie.rating.toFixed(1)}</span>
                <span>/ 10</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="size-4" />
                {formatDuration(movie.duration)}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="size-4" />
                {formatDateLong(movie.releaseDate)}
              </span>
              <span className="flex items-center gap-1.5">
                <Film className="size-4" />
                {movie.genre.map((g) => GENRE_LABELS[g]).join(", ")}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {t("movieDetail.synopsis")}
            </h2>
            <p className="leading-relaxed text-foreground/90">{movie.description}</p>
          </div>

          {/* Trailer */}
          {movie.trailerUrl && (
            <div className="space-y-2">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {t("movieDetail.trailer", "Trailer")}
              </h2>
              <button
                onClick={() => setShowTrailer(true)}
                className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-3 transition-colors hover:bg-accent w-full text-left"
              >
                <PlayCircle className="size-8 text-red-500" />
                <div>
                  <p className="font-medium">{t("movieDetail.watchTrailer", "Watch Trailer")}</p>
                  <p className="text-xs text-muted-foreground">YouTube</p>
                </div>
              </button>
            </div>
          )}

          <Dialog open={showTrailer} onOpenChange={setShowTrailer}>
            <DialogContent className="max-w-3xl p-0 border-0 bg-black">
              <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                <iframe
                  src={getYouTubeEmbedUrl(movie.trailerUrl!)}
                  title={`${movie.title} Trailer`}
                  className="absolute inset-0 h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </DialogContent>
          </Dialog>

          {/* Cast & Crew */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Director</p>
              <p className="text-sm font-medium">{movie.director}</p>
            </div>
            {movie.cast.length > 0 && (
              <div className="space-y-1">
                <p className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <Users className="size-3" />
                  Cast
                </p>
                <p className="text-sm font-medium">{movie.cast.join(", ")}</p>
              </div>
            )}
            <div className="space-y-1">
              <p className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Globe className="size-3" />
                Language
              </p>
              <p className="text-sm font-medium">{movie.language}</p>
            </div>
          </div>

          {/* Showtimes */}
          {movie.status === "now_showing" && (
            <div className="space-y-4 border-t border-border/60 pt-6">
              <h2 className="text-lg font-semibold">{t("movieDetail.showtimes")}</h2>

              {dates.length === 0 ? (
                <div className="space-y-1">
                  <p className="text-sm font-medium">{t("movieDetail.noShowtimes")}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("movieDetail.noShowtimesDesc")}
                  </p>
                </div>
              ) : (
                <>
                  {/* Date selector */}
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {dates.map((date) => {
                      const d = getDayLabel(date);
                      const isActive = date === activeDate;
              return (
                        <button
                          key={date}
                          onClick={() => setSelectedDate(date)}
                          className={cn(
                            "flex min-w-[64px] flex-col items-center gap-0.5 rounded-xl border px-4 py-3 transition-all",
                            isActive
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border hover:border-primary/50 hover:bg-accent"
                          )}
                        >
                          <span className="text-[10px] font-medium uppercase tracking-wider opacity-80">
                            {d.day}
                          </span>
                          <span className="text-lg font-bold">{d.date}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Showtime slots */}
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {dayShowtimes.map((st) => (
                      <motion.button
                        key={st.id}
                        onClick={() => navigate(`/booking/${st.id}/seats`)}
                        className="group flex items-center justify-between rounded-xl border border-border/60 bg-card p-4 transition-all hover:border-cinema-gold/40 hover:shadow-md"
                        whileHover={{ y: -3, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      >
                        <div className="flex flex-col items-start gap-1">
                          <span className="font-mono text-lg font-semibold">
                            {formatTime(st.startTime)}
                          </span>
                          <span className="text-xs text-muted-foreground">{st.hallName}</span>
                          <span className="text-xs text-muted-foreground">
                            {st.availableSeats} seats available
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold">${st.ticketPrice}</span>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground group-hover:text-cinema-gold">
                            {t("movieDetail.selectSeats")} →
                          </p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </motion.div>
      </div>

      <ReviewsSection movieId={movie.id} />
    </div>
  );
}

function formatRelative(dateStr: string, t: TFunction): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return t("notifications.justNow");
  if (minutes < 60) return t("notifications.minutesAgo", { count: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t("notifications.hoursAgo", { count: hours });
  return t("notifications.daysAgo", { count: Math.floor(hours / 24) });
}

function errorMessage(err: unknown): string {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data
      ?.message ??
    (err as { message?: string })?.message ??
    "Something went wrong"
  );
}

function ReviewsSection({ movieId }: { movieId: string }) {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  const isCustomer = isAuthenticated && user?.role === "customer";

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [editing, setEditing] = useState(false);

  const { data: reviewsData, isLoading: reviewsLoading } = useQuery({
    queryKey: ["reviews", "movie", movieId],
    queryFn: () => getMovieReviews(movieId, 1, 10),
  });

  const { data: myReviewData, isLoading: myLoading } = useQuery({
    queryKey: ["reviews", "me", movieId],
    queryFn: () => getMyReview(movieId),
    enabled: isCustomer,
  });

  useEffect(() => {
    if (!editing && myReviewData?.review) {
      setRating(myReviewData.review.rating);
      setComment(myReviewData.review.comment);
    }
  }, [myReviewData, editing]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["reviews", "movie", movieId] });
    queryClient.invalidateQueries({ queryKey: ["reviews", "me", movieId] });
  };

  const submitMutation = useMutation({
    mutationFn: (payload: ReviewFormData) =>
      editing && myReviewData?.review
        ? updateReview(myReviewData.review.id, payload)
        : createReview(movieId, payload),
    onSuccess: () => {
      toast.success(
        editing ? t("movieDetail.updateReview") : t("movieDetail.submitReview")
      );
      setEditing(false);
      setComment("");
      setRating(0);
      invalidate();
    },
    onError: (err: unknown) => toast.error(errorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (reviewId: string) => deleteReview(reviewId),
    onSuccess: () => {
      toast.success(t("movieDetail.deleteReview"));
      setEditing(false);
      invalidate();
    },
    onError: (err: unknown) => toast.error(errorMessage(err)),
  });

  const handleSubmit = () => {
    if (rating < 1) {
      toast.error(t("movieDetail.ratingRequired"));
      return;
    }
    if (!comment.trim()) {
      toast.error(t("movieDetail.commentRequired"));
      return;
    }
    submitMutation.mutate({ rating, comment: comment.trim() });
  };

  const reviews = reviewsData?.data ?? [];
  const maxCount = Math.max(
    1,
    ...(reviewsData?.distribution ?? []).map((d) => d.count)
  );

  return (
    <div className="mt-10 border-t border-border/60 pt-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <MessageSquare className="size-5" />
          {t("movieDetail.reviews")}
        </h2>
        {reviewsData && reviewsData.totalReviews > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Star className="size-4 fill-cinema-gold text-cinema-gold" />
            <span className="font-semibold text-foreground">
              {reviewsData.averageRating.toFixed(1)}
            </span>
            <span>/ 10</span>
            <span className="text-xs">
              {t("movieDetail.reviewsCount", {
                count: reviewsData.totalReviews,
              })}
            </span>
          </div>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Review form / my review */}
        <div className="order-2 lg:order-1">
          {reviewsLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-6 text-center">
              <p className="text-sm font-medium">{t("movieDetail.noReviews")}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("movieDetail.noReviewsDesc")}
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {reviews.map((review) => (
                <li
                  key={review.id}
                  className="rounded-xl border border-border/60 bg-card p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {(review.customerName ?? "?").charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <p className="text-sm font-medium">
                          {review.customerName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatRelative(review.createdAt, t)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 rounded-lg bg-cinema-gold/10 px-2 py-1 text-sm font-semibold text-cinema-gold">
                        <Star className="size-3.5 fill-cinema-gold" />
                        {review.rating}/10
                      </span>
                      {isCustomer && myReviewData?.review?.id === review.id && (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            onClick={() => {
                              setEditing(true);
                              setRating(review.rating);
                              setComment(review.comment);
                            }}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-destructive"
                            onClick={() => deleteMutation.mutate(review.id)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-foreground/90">
                    {review.comment}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Right column: distribution + form */}
        <div className="order-1 space-y-6 lg:order-2">
          {reviewsData && reviewsData.totalReviews > 0 && (
            <div className="rounded-xl border border-border/60 bg-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold">
                  {t("movieDetail.fromCustomers")}
                </h3>
                <span className="text-lg font-bold text-cinema-gold">
                  {reviewsData.averageRating.toFixed(1)}
                </span>
              </div>
              <div className="space-y-1.5">
                {[...reviewsData.distribution]
                  .reverse()
                  .map(({ value, count }) => (
                    <div key={value} className="flex items-center gap-2">
                      <span className="w-6 text-right text-xs font-medium tabular-nums">
                        {value}
                      </span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-accent">
                        <div
                          className="h-full rounded-full bg-cinema-gold"
                          style={{ width: `${(count / maxCount) * 100}%` }}
                        />
                      </div>
                      <span className="w-6 text-xs tabular-nums text-muted-foreground">
                        {count}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Form */}
          {isCustomer &&
            (myLoading ? (
              <Skeleton className="h-40 w-full rounded-xl" />
            ) : myReviewData?.review && !editing ? (
              <div className="rounded-xl border border-border/60 bg-card p-4 text-sm text-muted-foreground">
                {t("movieDetail.reviewed")}
              </div>
            ) : myReviewData?.canReview || editing ? (
              <div className="rounded-xl border border-border/60 bg-card p-4">
                <h3 className="mb-3 text-sm font-semibold">
                  {editing ? t("movieDetail.updateReview") : t("movieDetail.yourReview")}
                </h3>
                <div className="mb-3 flex items-center gap-1">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      className="transition-transform hover:scale-125"
                    >
                      <Star
                        className={cn(
                          "size-6 transition-colors",
                          value <= rating
                            ? "fill-cinema-gold text-cinema-gold"
                            : "text-muted-foreground/40"
                        )}
                      />
                    </button>
                  ))}
                </div>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={t("movieDetail.commentPlaceholder")}
                  rows={3}
                />
                <div className="mt-3 flex items-center gap-2">
                  <Button
                    onClick={handleSubmit}
                    disabled={submitMutation.isPending}
                  >
                    {editing
                      ? t("movieDetail.updateReview")
                      : t("movieDetail.submitReview")}
                  </Button>
                  {editing && (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setEditing(false);
                        if (myReviewData?.review) {
                          setRating(myReviewData.review.rating);
                          setComment(myReviewData.review.comment);
                        }
                      }}
                    >
                      {t("movieDetail.cancelEdit")}
                    </Button>
                  )}
                </div>
              </div>
            ) : myReviewData && !myReviewData.attended ? (
              <div className="rounded-xl border border-dashed border-border p-4 text-sm">
                <p className="font-medium text-muted-foreground">
                  {t("movieDetail.attendedOnly")}
                </p>
                <p className="mt-1 text-xs text-muted-foreground/70">
                  {t("movieDetail.attendedOnlyDesc")}
                </p>
              </div>
            ) : null)}
        </div>
      </div>
    </div>
  );
}
