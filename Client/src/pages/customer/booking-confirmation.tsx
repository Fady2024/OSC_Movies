import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { CheckCircle2, Calendar, Clock, Building2, Ticket, Download, Home } from "lucide-react";
import { getBookingById } from "@/api/bookings.api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/states";
import { formatDateLong, formatTime, formatPrice } from "@/utils/format";

export function BookingConfirmationPage() {
  const { bookingId } = useParams<{ bookingId: string }>();

  const { data: booking, isLoading, isError, refetch } = useQuery({
    queryKey: ["booking", bookingId],
    queryFn: () => getBookingById(bookingId!),
    enabled: !!bookingId,
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="mb-6 h-8 w-48" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError || !booking) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <ErrorState onRetry={refetch} title="Booking not found" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Success header */}
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-cinema-teal/15 text-cinema-teal">
          <CheckCircle2 className="size-8" />
        </div>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">Booking Confirmed</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your seats are reserved. See you at the cinema.
        </p>
      </div>

      {/* Digital ticket */}
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-lg">
        {/* Top section */}
        <div className="relative bg-gradient-to-br from-primary to-primary/80 p-6 text-primary-foreground">
          <div className="absolute inset-0 cinema-grid opacity-20" />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] opacity-70">Booking Reference</p>
              <p className="mt-1 font-mono text-lg font-bold">{booking.bookingRef}</p>
            </div>
            <Ticket className="size-6 opacity-50" />
          </div>
        </div>

        {/* Perforation */}
        <div className="relative flex h-6 items-center">
          <div className="absolute left-0 size-6 -translate-x-1/2 rounded-full bg-background" />
          <div className="mx-6 flex-1 border-t-2 border-dashed border-border" />
          <div className="absolute right-0 size-6 translate-x-1/2 rounded-full bg-background" />
        </div>

        {/* Movie info */}
        <div className="p-6">
          <div className="flex gap-4">
            <img
              src={booking.moviePosterUrl}
              alt={booking.movieTitle}
              className="size-20 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h2 className="font-bold text-lg leading-tight">{booking.movieTitle}</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">{booking.hallName}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Calendar className="size-3" />
                Date
              </p>
              <p className="mt-1 text-sm font-medium">{formatDateLong(booking.date)}</p>
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Clock className="size-3" />
                Time
              </p>
              <p className="mt-1 text-sm font-medium">{formatTime(booking.startTime)} – {formatTime(booking.endTime)}</p>
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Building2 className="size-3" />
                Hall
              </p>
              <p className="mt-1 text-sm font-medium">{booking.hallName}</p>
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Ticket className="size-3" />
                Seats
              </p>
              <p className="mt-1 font-mono text-sm font-medium">{booking.seats.join(", ")}</p>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-border/60 bg-muted/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total Paid</p>
              <p className="text-2xl font-bold">{formatPrice(booking.totalAmount)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Tickets</p>
              <p className="text-lg font-semibold">{booking.seats.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link to="/my-bookings" className="flex-1">
          <Button variant="outline" className="w-full gap-2">
            <Download className="size-4" />
            View My Bookings
          </Button>
        </Link>
        <Link to="/" className="flex-1">
          <Button className="w-full gap-2">
            <Home className="size-4" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
