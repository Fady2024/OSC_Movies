import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Search, ArrowRight, Calendar, Sparkles, Star, Clock } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { getMovies } from "@/api/movies.api";
import { getShowtimes } from "@/api/showtimes.api";
import { MovieCard } from "@/components/shared/movie-card";
import { MovieGridSkeleton } from "@/components/shared/skeletons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  STATUS_LABELS,
  formatDuration,
  formatDate,
  formatTime,
  isUpcomingShowtime,
  showtimeTimestamp,
} from "@/utils/format";
import {
  ScrollReveal,
  Floating,
  CountUp,
  GlowPulse,
  fadeInUp,
  scaleIn,
  staggerContainer,
} from "@/components/shared/animations";
import type { Movie } from "@/types/movie.types";

export function HomePage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");

  const { data: nowShowing, isLoading: loadingNow } = useQuery({
    queryKey: ["movies", "now_showing"],
    queryFn: () => getMovies({ status: "now_showing", limit: 10 }),
  });

  const { data: comingSoon, isLoading: loadingSoon } = useQuery({
    queryKey: ["movies", "coming_soon"],
    queryFn: () => getMovies({ status: "coming_soon", limit: 5 }),
  });

const { data: showtimesData } = useQuery({
    queryKey: ["showtimes", "upcoming"],
    queryFn: () => getShowtimes({ limit: 30 }),
  });

  const showtimes = (showtimesData?.data ?? [])
    .filter((st) => isUpcomingShowtime(st.date, st.startTime))
    .sort(
      (a, b) =>
        showtimeTimestamp(a.date, a.startTime) - showtimeTimestamp(b.date, b.startTime)
    )
    .slice(0, 6);

  const seatsBooked =
    (showtimesData?.data.reduce((sum, st) => sum + (st.bookedSeats ?? 0), 0) ?? 0);

  const featured = nowShowing?.data[0];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search);
    window.location.href = `/movies?${params.toString()}`;
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/60">
        <motion.div
          className="absolute inset-0 cinema-grid"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 2 }}
        />
        <motion.div
          className="absolute -left-32 -top-32 size-96 rounded-full bg-cinema-gold/5 blur-3xl"
          animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-32 -right-32 size-96 rounded-full bg-cinema-teal/5 blur-3xl"
          animate={{ x: [0, -30, 0], y: [0, 20, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div className="flex flex-col gap-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
<Badge variant="outline" className="w-fit gap-1.5 border-cinema-gold/30 bg-cinema-gold/5 text-cinema-gold">
                  <Sparkles className="size-3" />
                  {t("home.heroBadge")} — August 2026
                </Badge>
              </motion.div>

              <div className="space-y-2">
<motion.h1
                  className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                >
                  {t("home.heroTitle")}
                </motion.h1>
                <motion.p
                  className="max-w-lg text-base text-muted-foreground sm:text-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  {t("home.heroSubtitle")}
                </motion.p>
              </div>

              <motion.form
                onSubmit={handleSearch}
                className="flex w-full max-w-md gap-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.55 }}
              >
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by title, director..."
                    className="pl-9 bg-muted/50"
                  />
                </div>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button type="submit" size="default">Search</Button>
                </motion.div>
              </motion.form>

              <motion.div
                className="flex items-center gap-4 pt-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.65 }}
              >
                <Link to="/movies">
                  <motion.div whileHover={{ scale: 1.04, x: 4 }} whileTap={{ scale: 0.96 }}>
                    <Button size="lg" className="gap-2">
                      Browse Movies
                      <ArrowRight className="size-4" />
                    </Button>
                  </motion.div>
                </Link>
<Link to="/movies?status=now_showing">
                  <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                    <Button variant="outline" size="lg">{t("home.nownShowing")}</Button>
                  </motion.div>
                </Link>
              </motion.div>

              <motion.div
                className="flex items-center gap-8 pt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <div className="flex flex-col">
                  <span className="text-2xl font-bold">
                    <CountUp to={nowShowing?.total ?? 0} />
                  </span>
                  <span className="text-xs text-muted-foreground">{t("home.statsMovies")}</span>
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="flex flex-col">
                  <span className="text-2xl font-bold">
                    <CountUp to={seatsBooked} />
                  </span>
                  <span className="text-xs text-muted-foreground">{t("home.statsSeats")}</span>
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="flex flex-col">
                  <span className="text-2xl font-bold">
                    <CountUp to={4} suffix="K+" />
                  </span>
                  <span className="text-xs text-muted-foreground">{t("home.statsHappy")}</span>
                </div>
              </motion.div>
            </div>

            {featured && (
              <motion.div
                className="relative hidden lg:block"
                initial={{ opacity: 0, x: 60, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-cinema-gold/10 via-transparent to-cinema-teal/10 blur-2xl" />
                <Link
                  to={`/movies/${featured.id}`}
                  className="group relative block overflow-hidden rounded-2xl border border-border/60 shadow-2xl"
                >
                  <motion.img
                    src={featured.posterUrl}
                    alt={featured.title}
                    className="aspect-[3/4] w-full object-cover"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.7 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 p-6"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                  >
                    <Badge className="mb-2 bg-cinema-gold text-cinema-gold-foreground">
                      {STATUS_LABELS[featured.status]}
                    </Badge>
                    <h2 className="text-2xl font-bold tracking-tight">{featured.title}</h2>
                    <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Star className="size-3.5 fill-cinema-gold text-cinema-gold" />
                        {featured.rating.toFixed(1)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-3.5" />
                        {formatDuration(featured.duration)}
                      </span>
                    </div>
                  </motion.div>
                </Link>
                <Floating className="absolute -right-4 -top-4" amplitude={6} duration={4}>
<GlowPulse>
                    <Badge className="bg-cinema-gold text-cinema-gold-foreground shadow-lg">
                      <Star className="size-3 mr-1 fill-current" />
                      {t("home.featured")}
                    </Badge>
                  </GlowPulse>
                </Floating>
              </motion.div>
            )}
          </div>
        </div>
      </section>
      {/* Now Showing */}
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <ScrollReveal variants={fadeInUp}>
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">{t("home.nownShowing")}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Currently in theaters — book your seats today
              </p>
            </div>
<Link to="/movies?status=now_showing">
              <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.96 }}>
                <Button variant="ghost" size="sm" className="gap-1">
                  {t("home.viewAll")}
                  <ArrowRight className="size-4" />
                </Button>
              </motion.div>
            </Link>
          </div>
        </ScrollReveal>

        {loadingNow ? (
          <MovieGridSkeleton count={5} />
        ) : (
          <motion.div
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
          >
            {nowShowing?.data.slice(0, 5).map((movie: Movie) => (
              <motion.div
                key={movie.id}
                variants={scaleIn}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <MovieCard movie={movie} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* Upcoming Showtimes */}
      {showtimes && showtimes.length > 0 && (
        <section className="border-y border-border/60 bg-muted/20">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <ScrollReveal>
              <div className="mb-6 flex items-end justify-between">
                <div>
<h2 className="text-2xl font-bold tracking-tight">{t("home.upcomingShowtimes")}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("home.upcomingShowtimesSub")}
                  </p>
                </div>
              </div>
            </ScrollReveal>

            <motion.div
              className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
            >
              {showtimes.map((st) => (
                <motion.div
                  key={st.id}
                  variants={fadeInUp}
                  whileHover={{ y: -4, scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Link
                    to={`/movies/${st.movieId}`}
                    className="group flex items-center gap-4 rounded-xl border border-border/60 bg-card p-4 transition-all hover:border-border hover:shadow-md"
                  >
                    <motion.img
                      src={st.moviePosterUrl}
                      alt={st.movieTitle}
                      className="size-16 rounded-lg object-cover"
                      whileHover={{ scale: 1.1, rotate: 2 }}
                      transition={{ duration: 0.3 }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="truncate font-medium text-sm">{st.movieTitle}</h3>
                      <p className="mt-0.5 text-xs text-muted-foreground">{st.hallName}</p>
                      <div className="mt-2 flex items-center gap-2">
<Badge variant="outline" className="font-mono">
                          {formatTime(st.startTime)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(st.date)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">${st.ticketPrice}</p>
                      <p className="text-xs text-muted-foreground">{st.availableSeats} left</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* Coming Soon */}
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">{t("home.comingSoon")}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Anticipated releases on the horizon
              </p>
            </div>
<Link to="/movies?status=coming_soon">
              <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.96 }}>
                <Button variant="ghost" size="sm" className="gap-1">
                  {t("home.viewAll")}
                  <ArrowRight className="size-4" />
                </Button>
              </motion.div>
            </Link>
          </div>
        </ScrollReveal>

        {loadingSoon ? (
          <MovieGridSkeleton count={5} />
        ) : (
          <motion.div
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
          >
            {comingSoon?.data.map((movie: Movie) => (
              <motion.div
                key={movie.id}
                variants={scaleIn}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <MovieCard movie={movie} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* Discovery CTA */}
      <section className="border-t border-border/60 bg-muted/20">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <ScrollReveal>
            <motion.div
              whileHover={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.6 }}
            >
              <Calendar className="mx-auto size-10 text-cinema-gold" />
            </motion.div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight">
              Your next story starts here.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Browse our full catalog, filter by genre, find the perfect showtime, and
              reserve your seats in minutes.
            </p>
            <Link to="/movies" className="mt-6 inline-block">
              <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.96 }}>
                <Button size="lg" className="gap-2">
                  Explore All Movies
                  <ArrowRight className="size-4" />
                </Button>
              </motion.div>
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
