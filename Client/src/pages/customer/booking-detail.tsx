import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Building2, Ticket, XCircle, CheckCircle2, Pencil } from "lucide-react";
import { getBookingById } from "@/api/bookings.api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/states";
import { formatDateLong, formatTime, formatPrice } from "@/utils/format";

export function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: booking, isLoading, isError, refetch } = useQuery({
    queryKey: ["booking", id],
    queryFn: () => getBookingById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="mb-6 h-8 w-32" />
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

  const isCancelled = booking.status === "cancelled";

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <Link to="/my-bookings">
        <Button variant="ghost" size="sm" className="mb-6 gap-1.5">
          <ArrowLeft className="size-4" />
          Back to My Bookings
        </Button>
      </Link>

      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-lg">
        <div className={`${isCancelled ? "bg-muted" : "bg-gradient-to-br from-primary to-primary/80"} p-6 text-primary-foreground`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] opacity-70">Booking Reference</p>
              <p className="mt-1 font-mono text-lg font-bold">{booking.bookingRef}</p>
            </div>
            <Badge variant={isCancelled ? "destructive" : "default"} className="gap-1">
              {isCancelled ? <XCircle className="size-3" /> : <CheckCircle2 className="size-3" />}
              {booking.status === "confirmed" ? "Confirmed" : booking.status === "cancelled" ? "Cancelled" : "Pending"}
            </Badge>
          </div>
        </div>

        <div className="relative flex h-6 items-center">
          <div className="absolute left-0 size-6 -translate-x-1/2 rounded-full bg-background" />
          <div className="mx-6 flex-1 border-t-2 border-dashed border-border" />
          <div className="absolute right-0 size-6 translate-x-1/2 rounded-full bg-background" />
        </div>

        <div className="p-6">
          <div className="flex gap-4">
            <img src={booking.moviePosterUrl} alt={booking.movieTitle} className="size-20 rounded-lg object-cover" />
            <div className="flex-1">
              <h2 className="font-bold text-lg">{booking.movieTitle}</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">{booking.hallName}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Calendar className="size-3" /> Date
              </p>
              <p className="mt-1 text-sm font-medium">{formatDateLong(booking.date)}</p>
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Clock className="size-3" /> Time
              </p>
              <p className="mt-1 text-sm font-medium">{formatTime(booking.startTime)} – {formatTime(booking.endTime)}</p>
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Building2 className="size-3" /> Hall
              </p>
              <p className="mt-1 text-sm font-medium">{booking.hallName}</p>
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Ticket className="size-3" /> Seats
              </p>
              <p className="mt-1 font-mono text-sm font-medium">{booking.seats.join(", ")}</p>
            </div>
          </div>
        </div>

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
          {!isCancelled && (
            <div className="mt-5 border-t border-border/60 pt-5">
              <Link to={`/booking/${booking.id}/modify`}>
                <Button variant="outline" className="gap-2"><Pencil className="size-4" />Change seats</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
