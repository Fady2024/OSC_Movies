import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Ticket } from "lucide-react";
import { getBookingById, updateBookingSeats } from "@/api/bookings.api";
import { getAvailableSeats } from "@/api/showtimes.api";
import { SeatMap } from "@/components/shared/seat-map";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/states";
import { formatDateLong, formatTime } from "@/utils/format";
import { toast } from "sonner";

export function ModifyBookingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedSeats, setSelectedSeats] = useState<string[] | null>(null);

  const { data: booking, isLoading, isError, refetch } = useQuery({
    queryKey: ["booking", id],
    queryFn: () => getBookingById(id!),
    enabled: !!id,
  });
  const { data: rows, isLoading: seatsLoading } = useQuery({
    queryKey: ["seats", booking?.showtimeId],
    queryFn: () => getAvailableSeats(booking!.showtimeId),
    enabled: !!booking?.showtimeId,
    staleTime: 0,
  });

  const currentSeats = selectedSeats ?? booking?.seats ?? [];
  const mutation = useMutation({
    mutationFn: () => updateBookingSeats(id!, currentSeats),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking", id] });
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["seats", booking?.showtimeId] });
      toast.success("Your seats have been updated");
      navigate(`/booking/${id}`);
    },
    onError: (error: Error) => toast.error(error.message || "Unable to update seats"),
  });

  const canSave = useMemo(
    () => !!booking && currentSeats.length === booking.seats.length && currentSeats.length > 0,
    [booking, currentSeats.length]
  );

  if (isLoading) return <div className="mx-auto max-w-4xl px-4 py-8"><Skeleton className="h-96 w-full" /></div>;
  if (isError || !booking) return <div className="mx-auto max-w-4xl px-4 py-8"><ErrorState title="Booking not found" onRetry={refetch} /></div>;
  if (booking.status !== "confirmed") return <div className="mx-auto max-w-4xl px-4 py-8"><ErrorState title="This booking cannot be modified" description="Only active bookings can have their seats changed." onRetry={() => navigate(`/booking/${id}`)} /></div>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Link to={`/booking/${id}`}><Button variant="ghost" size="sm" className="mb-5 gap-1.5"><ArrowLeft className="size-4" />Back to booking</Button></Link>
      <div className="mb-6 rounded-xl border border-border/60 bg-card p-4">
        <h1 className="text-xl font-bold">Change seats</h1>
        <p className="mt-1 text-sm text-muted-foreground">{booking.movieTitle} · {formatDateLong(booking.date)} · {formatTime(booking.startTime)}</p>
        <p className="mt-2 text-sm text-muted-foreground">Choose exactly {booking.seats.length} seat{booking.seats.length === 1 ? "" : "s"}. Your ticket count and price will not change.</p>
      </div>
      <div className="rounded-2xl border border-border/60 bg-card p-6 sm:p-8">
        {seatsLoading ? <Skeleton className="h-64 w-full" /> : <SeatMap rows={rows ?? []} selectedSeats={currentSeats} selectableReservedSeats={booking.seats} maxSeats={booking.seats.length} onSeatToggle={(seat) => setSelectedSeats((previous) => {
          const seats = previous ?? booking.seats;
  ***REMOVED*** seats.includes(seat) ? seats.filter((item) => item !== seat) : [...seats, seat];
        })} />}
      </div>
      <div className="mt-6 flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-card p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground"><Ticket className="size-4" />{currentSeats.length} of {booking.seats.length} seats selected</div>
        <Button disabled={!canSave || mutation.isPending} onClick={() => mutation.mutate()} className="gap-2"><Save className="size-4" />{mutation.isPending ? "Saving…" : "Save seats"}</Button>
      </div>
    </div>
  );
}
