import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Clock, Ticket, Building2, Armchair, MapPin, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getShowtimes } from "@/api/showtimes.api";
import type { Showtime } from "@/types/showtime.types";
import {
  TiltCard,
  TextReveal,
  staggerContainer,
  fadeInUp,
  ScrollReveal,
} from "@/components/shared/animations";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatDate,
  formatTime,
  formatPrice,
  getDayLabel,
  isUpcomingShowtime,
} from "@/utils/format";
import { cn } from "@/lib/utils";

export function ShowtimesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeDate, setActiveDate] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["showtimes", "all-upcoming"],
    queryFn: () => getShowtimes({ limit: 100, status: "upcoming" }),
  });

  const showtimes = useMemo(
    () => (data?.data ?? []).filter((st) => isUpcomingShowtime(st.date, st.startTime)),
    [data]
  );

  const dates = useMemo(() => {
    const set = new Set(showtimes.map((st) => st.date));
    return Array.from(set).sort();
  }, [showtimes]);

  const active = activeDate ?? dates[0] ?? null;
  const dayShowtimes = useMemo(
    () => showtimes.filter((st) => st.date === active),
    [showtimes, active]
  );

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 cinema-grid" />
        <motion.div
          className="absolute -left-24 -top-24 size-80 rounded-full bg-cinema-gold/10 blur-3xl"
          animate={{ x: [0, 30, 0], y: [0, 20, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-32 -right-24 size-80 rounded-full bg-cinema-teal/10 blur-3xl"
          animate={{ x: [0, -30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <Badge
            variant="outline"
            className="mb-4 w-fit gap-1.5 border-cinema-gold/30 bg-cinema-gold/5 text-cinema-gold"
          >
            <Clock className="size-3" />
            {t("nav.showtimes")}
          </Badge>
          <TextReveal className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            {t("home.upcomingShowtimes")}
          </TextReveal>
          <motion.p
            className="mt-4 max-w-lg text-base text-muted-foreground sm:text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            {t("home.upcomingShowtimesSub")}
          </motion.p>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-2xl" />
            ))}
          </div>
        ) : showtimes.length === 0 ? (
          <div className="rounded-2xl border border-border/60 bg-card p-12 text-center">
            <p className="text-lg font-semibold">{t("movieDetail.noShowtimes")}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("movieDetail.noShowtimesDesc")}
            </p>
          </div>
        ) : (
          <>
            {/* Date selector */}
            <motion.div
              className="sticky top-16 z-30 -mx-4 mb-8 flex gap-2 overflow-x-auto border-b border-border/60 bg-background/80 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              {dates.map((date) => {
                const d = getDayLabel(date);
                const isActive = date === active;
        ***REMOVED*** (
                  <button
                    key={date}
                    onClick={() => setActiveDate(date)}
                    className={cn(
                      "flex min-w-[76px] shrink-0 flex-col items-center gap-0.5 rounded-xl border px-4 py-2.5 transition-all",
                      isActive
                        ? "border-cinema-gold bg-cinema-gold/10 text-cinema-gold shadow-[0_0_20px_rgba(212,175,55,0.15)]"
                        : "border-border hover:border-cinema-gold/40 hover:bg-accent"
                    )}
                  >
                    <span className="text-[10px] font-medium uppercase tracking-wider opacity-80">
                      {d.day}
                    </span>
                    <span className="text-lg font-bold">{d.date}</span>
                  </button>
                );
              })}
            </motion.div>

            {/* Cards */}
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -10, transition: { duration: 0.15 } }}
              >
                {dayShowtimes.map((st: Showtime) => (
                  <motion.div key={st.id} variants={fadeInUp}>
                    <TiltCard className="group relative h-full overflow-hidden rounded-2xl border border-border/60 bg-card transition-colors hover:border-cinema-gold/40">
                      <div className="flex gap-4 p-4">
                        <div className="relative shrink-0">
                          <img
                            src={st.moviePosterUrl}
                            alt={st.movieTitle}
                            className="size-24 rounded-xl object-cover shadow-lg transition-transform duration-500 group-hover:scale-105"
                          />
                          <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-cinema-gold text-black">
                            {formatTime(st.startTime)}
                          </Badge>
                        </div>

                        <div className="flex min-w-0 flex-1 flex-col">
                          <h3 className="truncate font-semibold leading-snug">{st.movieTitle}</h3>
                          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="size-3.5" />
                              {formatDate(st.date)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Building2 className="size-3.5" />
                              {st.hallName}
                            </span>
                          </div>

                          <div className="mt-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold">{formatPrice(st.ticketPrice)}</span>
                              <span className="text-xs text-muted-foreground">/ ticket</span>
                            </div>
                            <Button
                              size="sm"
                              className="gap-1.5"
                              onClick={() => navigate(`/booking/${st.id}/seats`)}
                            >
                              <Ticket className="size-3.5" />
                              {t("showtimes.book")}
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-border/40 px-4 py-2.5">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Armchair className="size-3.5" />
                            {st.availableSeats} / {st.hallCapacity} {t("showtimes.seats")}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MapPin className="size-3.5" />
                            {st.endTime ? `${formatTime(st.startTime)} – ${formatTime(st.endTime)}` : formatTime(st.startTime)}
                          </span>
                        </div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-cinema-teal to-cinema-gold"
                            initial={{ width: 0 }}
                            animate={{
                              width: `${Math.max(0, Math.min(100, (st.availableSeats / (st.hallCapacity || 1)) * 100))}%`,
                            }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                          />
                        </div>
                      </div>
                    </TiltCard>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

            <ScrollReveal className="mt-10 text-center">
              <Button
                variant="outline"
                className="gap-1.5"
                onClick={() => navigate("/movies")}
              >
                <MapPin className="size-4" />
                {t("home.viewAll")} {t("nav.movies")}
              </Button>
            </ScrollReveal>
          </>
        )}
      </section>
    </div>
  );
}