import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Ticket } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { getShowtimeById, getAvailableSeats, mapAvailableSeats } from "@/api/showtimes.api";
import { SeatMap } from "@/components/shared/seat-map";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/states";
import { useAuth } from "@/context/auth-context";
import { useNotifications } from "@/context/notification-context";
import type { SeatRow } from "@/types/showtime.types";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { formatDateLong, formatTime, formatPrice } from "@/utils/format";
import { cn } from "@/lib/utils";

const STEPS = ["Showtime", "Seats", "Review", "Confirmation"];

export function SeatSelectionPage() {
  const { showtimeId } = useParams<{ showtimeId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useNotifications();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  const { data: showtime, isLoading: stLoading, isError: stError, refetch } = useQuery({
    queryKey: ["showtime", showtimeId],
    queryFn: () => getShowtimeById(showtimeId!),
    enabled: !!showtimeId,
  });

  const { data: seatRows, isLoading: seatsLoading } = useQuery({
    queryKey: ["seats", showtimeId],
    queryFn: () => getAvailableSeats(showtimeId!),
    enabled: !!showtimeId,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  useEffect(() => {
    if (!socket || !showtimeId) return;
    const join = () => socket.emit("showtime:join", showtimeId);
    join();
    socket.on("connect", join);

    const onSeatsUpdated = (payload: any) => {
      const rows = mapAvailableSeats(payload);
      queryClient.setQueryData<SeatRow[]>(["seats", showtimeId], rows);
      const reservedNow = new Set(
        rows.flatMap((r) =>
          r.seats.filter((s) => s.status === "reserved").map((s) => s.id)
        )
      );
      setSelectedSeats((prev) => {
        const lost = prev.filter((s) => reservedNow.has(s));
        if (lost.length > 0) {
          toast.warning(t("booking.seat.alreadyReserved"));
        }
return lost.length > 0 ? prev.filter((s) => !reservedNow.has(s)) : prev;
      });
    };
    socket.on("showtime:seats", onSeatsUpdated);

    return () => {
      socket.off("connect", join);
      socket.off("showtime:seats", onSeatsUpdated);
      socket.emit("showtime:leave", showtimeId);
    };
  }, [socket, showtimeId, queryClient, t]);

  const toggleSeat = (seatId: string) => {
    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((s) => s !== seatId)
        : [...prev, seatId]
    );
  };

  const totalPrice = useMemo(
    () => (showtime ? showtime.ticketPrice * selectedSeats.length : 0),
    [showtime, selectedSeats.length]
  );

  if (stLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="mb-6 h-8 w-32" />
        <Skeleton className="mb-8 h-20 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (stError || !showtime) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <ErrorState onRetry={refetch} title="Showtime not found" />
      </div>
    );
  }

  const showtimeDate = new Date(showtime.date);
  const [h, m] = showtime.startTime.split(":").map(Number);
  showtimeDate.setHours(h, m, 0, 0);
  if (showtimeDate <= new Date()) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <ErrorState
          title="Showtime has passed"
          description="This showtime is no longer available. Please go back and select a future showtime."
          onRetry={() => navigate(`/movies/${showtime.movieId}`)}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb / Steps */}
      <div className="mb-6 flex items-center gap-2">
        {STEPS.map((step, idx) => (
          <div key={step} className="flex items-center gap-2">
            <div
              className={cn(
                "flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium",
                idx === 1
                  ? "bg-primary text-primary-foreground"
                  : idx < 1
                    ? "text-muted-foreground"
                    : "text-muted-foreground/50"
              )}
            >
              <span
                className={cn(
                  "flex size-5 items-center justify-center rounded-full text-[10px]",
                  idx === 1 ? "bg-primary-foreground/20" : idx < 1 ? "bg-muted" : "bg-muted/50"
                )}
              >
                {idx + 1}
              </span>
              {step}
            </div>
            {idx < STEPS.length - 1 && (
              <div className="h-px w-4 bg-border sm:w-8" />
            )}
          </div>
        ))}
      </div>

      <Link to={`/movies/${showtime.movieId}`}>
        <Button variant="ghost" size="sm" className="mb-4 gap-1.5">
          <ArrowLeft className="size-4" />
          Back to movie
        </Button>
      </Link>

      {/* Showtime info bar */}
      <div className="mb-6 flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <img
            src={showtime.moviePosterUrl}
            alt={showtime.movieTitle}
            className="size-12 rounded-lg object-cover"
          />
          <div>
            <h1 className="font-semibold">{showtime.movieTitle}</h1>
            <p className="text-sm text-muted-foreground">
              {formatDateLong(showtime.date)} · {formatTime(showtime.startTime)} · {showtime.hallName}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Ticket price</p>
          <p className="text-lg font-bold">{formatPrice(showtime.ticketPrice)}</p>
        </div>
      </div>

      {/* Seat Map */}
      <div className="rounded-2xl border border-border/60 bg-card p-6 sm:p-8">
        <h2 className="mb-1 text-lg font-semibold">Choose your seats</h2>
        <p className="mb-6 text-sm text-muted-foreground">
          Select up to 8 seats. Click a seat to select or deselect it.
        </p>

        {seatsLoading ? (
          <div className="flex justify-center py-20">
            <Skeleton className="h-64 w-full max-w-lg" />
          </div>
        ) : (
          <SeatMap
            rows={seatRows ?? []}
            selectedSeats={selectedSeats}
            onSeatToggle={toggleSeat}
          />
        )}
      </div>

      {/* Summary bar */}
      <div className="sticky bottom-0 mt-6 flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-background/95 p-4 shadow-lg backdrop-blur-xl">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Ticket className="size-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {selectedSeats.length === 0
                ? "No seats selected"
                : `${selectedSeats.length} seat${selectedSeats.length > 1 ? "s" : ""} selected`}
            </span>
          </div>
          {selectedSeats.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {selectedSeats.sort().map((s) => (
                <span
                  key={s}
                  className="rounded-md bg-cinema-gold/15 px-2 py-0.5 text-xs font-medium text-cinema-gold"
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-xl font-bold">{formatPrice(totalPrice)}</p>
          </div>
          <Button
            disabled={selectedSeats.length === 0}
            onClick={() => {
              if (!user) {
                navigate("/login", { state: { from: `/booking/${showtimeId}/seats` } });
              } else {
                navigate(`/booking/${showtimeId}/review`, {
                  state: { selectedSeats },
                });
              }
            }}
            className="gap-2"
          >
            Continue
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
