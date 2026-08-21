import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Ticket,
  Calendar,
  Clock,
  Building2,
  XCircle,
  CheckCircle2,
  Film,
  ArrowRight,
  Sparkles,
  MapPin,
  CreditCard,
  CircleDot,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getMyBookings, cancelBooking } from "@/api/bookings.api";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/states";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatDate,
  formatPrice,
  formatTime,
  canCancelBooking,
} from "@/utils/format";
import type { Booking, BookingStatus } from "@/types/booking.types";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import {
  ScrollReveal,
  CountUp,
  fadeInUp,
  staggerContainer,
} from "@/components/shared/animations";

import { useTranslation } from "react-i18next";

const STATUS_CONFIG = (t: (k: string) => string) => ({
  confirmed: {
    label: t("booking.myBookings.confirmed"),
    variant: "default" as const,
    icon: CheckCircle2,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
  cancelled: {
    label: t("booking.myBookings.cancelled"),
    variant: "destructive" as const,
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-500/10 border-red-500/20",
  },
  pending: {
    label: t("booking.myBookings.pending"),
    variant: "secondary" as const,
    icon: Clock,
    color: "text-amber-500",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  completed: {
    label: t("booking.myBookings.completed"),
    variant: "default" as const,
    icon: CheckCircle2,
    color: "text-blue-500",
    bg: "bg-blue-500/10 border-blue-500/20",
  },
});

function BookingCard({ booking, index, onCancel }: { booking: Booking; index: number; onCancel: (id: string) => void }) {
  const { t } = useTranslation();
  const statusConfig = STATUS_CONFIG(t);
  const statusCfg = statusConfig[booking.status];
  const StatusIcon = statusCfg.icon;
  const cancellable =
    booking.status === "confirmed" && canCancelBooking(booking.date);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{
        duration: 0.5,
        delay: index * 0.06,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border border-border/60 bg-card transition-all duration-300",
          "hover:border-border hover:shadow-lg hover:shadow-black/5",
          booking.status === "cancelled" && "opacity-60 grayscale-[30%]"
        )}
      >
        <div className="flex flex-col sm:flex-row">
          {/* Poster */}
          <div className="relative sm:w-40 lg:w-48 flex-shrink-0">
            <div className="aspect-[3/4] sm:aspect-auto sm:h-full overflow-hidden">
              <motion.img
                src={booking.moviePosterUrl}
                alt={booking.movieTitle}
                className="h-full w-full object-cover"
                whileHover={{ scale: 1.08 }}
                transition={{ duration: 0.6 }}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-card/80 hidden sm:block" />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent sm:hidden" />

            {/* Status badge on poster */}
            <div className="absolute top-3 left-3">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.06 + 0.2 }}
              >
                <Badge
                  className={cn(
                    "gap-1 border shadow-lg backdrop-blur-sm",
                    statusCfg.bg,
                    statusCfg.color
                  )}
                >
                  <StatusIcon className="size-3" />
                  {statusCfg.label}
                </Badge>
              </motion.div>
            </div>

            {/* Price on poster */}
            <div className="absolute bottom-3 right-3 hidden sm:block">
              <div className="rounded-lg bg-black/60 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-sm">
                {formatPrice(booking.totalAmount)}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-1 flex-col p-4 sm:p-5">
            {/* Header */}
            <div className="mb-3">
              <h3 className="text-lg font-bold tracking-tight group-hover:text-cinema-gold transition-colors duration-300">
                {booking.movieTitle}
              </h3>
              <p className="mt-0.5 text-xs font-mono text-muted-foreground tracking-wider">
                {booking.bookingRef}
              </p>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="size-3.5 text-cinema-gold/70" />
                <span>{formatDate(booking.date)}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="size-3.5 text-cinema-gold/70" />
                <span>
                  {formatTime(booking.startTime)} – {formatTime(booking.endTime)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="size-3.5 text-cinema-gold/70" />
                <span>{booking.hallName}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <CreditCard className="size-3.5 text-cinema-gold/70" />
                <span>{formatPrice(booking.ticketPrice)} / ticket</span>
              </div>
            </div>

            {/* Seats */}
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <MapPin className="size-3 text-muted-foreground" />
              {booking.seats.map((seat, i) => (
                <motion.span
                  key={seat}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.06 + i * 0.03 + 0.3 }}
                  className="inline-flex items-center gap-1 rounded-md bg-cinema-gold/10 border border-cinema-gold/20 px-2 py-0.5 text-xs font-mono font-semibold text-cinema-gold"
                >
                  <CircleDot className="size-2.5" />
                  {seat}
                </motion.span>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-auto pt-4 flex items-center justify-between border-t border-border/40">
              <div className="text-right sm:hidden">
                <p className="text-lg font-bold">{formatPrice(booking.totalAmount)}</p>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <Link to={`/booking/${booking.id}`}>
                  <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                    <Button variant="outline" size="sm" className="gap-1.5">
                      View Details
                      <ArrowRight className="size-3.5" />
                    </Button>
                  </motion.div>
                </Link>
                {cancellable && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                        <Button variant="destructive" size="sm" className="gap-1.5">
                          <XCircle className="size-3.5" />
                          Cancel
                        </Button>
                      </motion.div>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. Your{" "}
                          {booking.seats.length} seat(s) will be released and
                          become available for other customers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onCancel(booking.id)}
                          className="bg-destructive text-white hover:bg-destructive/90"
                        >
                          Yes, Cancel Booking
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function BookingCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
      <div className="flex flex-col sm:flex-row">
        <Skeleton className="aspect-[3/4] sm:aspect-auto sm:h-64 sm:w-40 lg:w-48 flex-shrink-0" />
        <div className="flex flex-1 flex-col gap-3 p-5">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-3 w-24" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-5 w-10" />
            <Skeleton className="h-5 w-10" />
            <Skeleton className="h-5 w-10" />
          </div>
          <div className="mt-auto pt-4 flex justify-end gap-2">
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function MyBookingsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">(
    "all"
  );

  const { data, isLoading } = useQuery({
    queryKey: ["my-bookings", user?.id],
    queryFn: () => getMyBookings(user!.id, {}),
    enabled: !!user,
  });

  const handleCancelBooking = async (id: string) => {
    try {
      await cancelBooking(id);
      toast.success("Booking cancelled successfully");
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to cancel booking"
      );
    }
  };

  const bookings = data?.data ?? [];
  const filtered =
    statusFilter === "all"
      ? bookings
      : bookings.filter((b) => b.status === statusFilter);

  const PAGE_SIZE = 5;
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const [page, setPage] = useState(1);
  const safePage = Math.min(page, pageCount);
  const pagedBookings = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const upcoming = bookings.filter(
    (b) =>
      b.status === "confirmed" && new Date(b.date) >= new Date()
  );
  const past = bookings.filter(
    (b) =>
      b.status === "confirmed" && new Date(b.date) < new Date()
  );
  const cancelled = bookings.filter((b) => b.status === "cancelled");

  const stats = [
    {
      label: "Upcoming",
      count: upcoming.length,
      icon: Calendar,
      color: "text-emerald-500",
      glow: "from-emerald-500/20",
    },
    {
      label: "Past",
      count: past.length,
      icon: Ticket,
      color: "text-blue-500",
      glow: "from-blue-500/20",
    },
    {
      label: "Cancelled",
      count: cancelled.length,
      icon: XCircle,
      color: "text-red-500",
      glow: "from-red-500/20",
    },
  ];

  return (
    <div className="relative min-h-screen">
      {/* Hero Header */}
      <section className="relative overflow-hidden border-b border-border/60">
        <motion.div
          className="absolute inset-0 cinema-grid"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 2 }}
        />
        <motion.div
          className="absolute -left-32 -top-32 size-96 rounded-full bg-cinema-gold/5 blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-32 -right-32 size-96 rounded-full bg-cinema-teal/5 blur-3xl"
          animate={{
            x: [0, -30, 0],
            y: [0, 20, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />

        <div className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <Badge
              variant="outline"
              className="mb-4 w-fit gap-1.5 border-cinema-gold/30 bg-cinema-gold/5 text-cinema-gold"
            >
              <Sparkles className="size-3" />
              Your reservations
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              My Bookings
            </h1>
            <p className="mt-2 max-w-lg text-sm text-muted-foreground sm:text-base">
              Track your upcoming movies, review past visits, and manage your
              reservations all in one place.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="mb-8 grid grid-cols-3 gap-3">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
    return (
              <ScrollReveal key={stat.label} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -4, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 sm:p-5"
                >
                  <div
                    className={cn(
                      "absolute -right-6 -top-6 size-24 rounded-full bg-gradient-to-br to-transparent blur-2xl opacity-50",
                      stat.glow
                    )}
                  />
                  <div className="relative flex items-center gap-2.5">
                    <div
                      className={cn(
                        "flex size-9 items-center justify-center rounded-xl bg-muted/80",
                        stat.color
                      )}
                    >
                      <Icon className="size-4" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        <CountUp to={stat.count} />
                      </p>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </ScrollReveal>
            );
          })}
        </div>

        {/* Filter tabs */}
        <ScrollReveal delay={0.3}>
          <Tabs
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v as BookingStatus | "all");
              setPage(1);
            }}
          >
            <TabsList className="bg-muted/50 p-1">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-card data-[state=active]:shadow-sm"
              >
                All
                <Badge
                  variant="secondary"
                  className="ml-1.5 h-5 px-1.5 text-[10px]"
                >
                  {bookings.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="confirmed"
                className="data-[state=active]:bg-card data-[state=active]:shadow-sm"
              >
                Confirmed
                <Badge
                  variant="secondary"
                  className="ml-1.5 h-5 px-1.5 text-[10px]"
                >
                  {upcoming.length + past.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="cancelled"
                className="data-[state=active]:bg-card data-[state=active]:shadow-sm"
              >
                Cancelled
                <Badge
                  variant="secondary"
                  className="ml-1.5 h-5 px-1.5 text-[10px]"
                >
                  {cancelled.length}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </ScrollReveal>

        {/* Bookings list */}
        <div className="mt-6 space-y-4">
          {isLoading ? (
            <motion.div
              className="space-y-4"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {Array.from({ length: 3 }).map((_, i) => (
                <motion.div key={i} variants={fadeInUp}>
                  <BookingCardSkeleton />
                </motion.div>
              ))}
            </motion.div>
          ) : filtered.length === 0 ? (
            <ScrollReveal>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <EmptyState
                  icon={<Film className="size-6" />}
                  title={
                    statusFilter === "all"
                      ? "No bookings yet"
                      : `No ${statusFilter} bookings`
                  }
                  description={
                    statusFilter === "all"
                      ? "Browse movies and book your first seat to see it here."
                      : `You don't have any ${statusFilter} reservations.`
                  }
                  action={
                    <Link to="/movies">
                      <motion.div
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                      >
                        <Button className="gap-2">
                          Browse Movies
                          <ArrowRight className="size-4" />
                        </Button>
                      </motion.div>
                    </Link>
                  }
                />
              </motion.div>
            </ScrollReveal>
          ) : (
            <AnimatePresence mode="popLayout">
              {pagedBookings.map((booking, index) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  index={index}
                  onCancel={handleCancelBooking}
                />
              ))}
            </AnimatePresence>
          )}

          {filtered.length > 0 && (
            <PaginationBar
              page={safePage}
              totalPages={pageCount}
              onPageChange={setPage}
            />
          )}
        </div>
      </div>
    </div>
  );
}
