import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Ticket, Search, CheckCircle, XCircle, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { getAllBookings, cancelBooking } from "@/api/bookings.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { formatDate, formatTime, formatPrice } from "@/utils/format";
import { toast } from "sonner";
import { useNotifications } from "@/context/notification-context";
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
import { useTranslation } from "react-i18next";

const STATUS_CONFIG = (t: (k: string) => string) => ({
  confirmed: { label: t("booking.myBookings.confirmed"), variant: "default" as const, icon: CheckCircle },
  pending: { label: t("booking.myBookings.pending"), variant: "secondary" as const, icon: Clock },
  cancelled: { label: t("booking.myBookings.cancelled"), variant: "destructive" as const, icon: XCircle },
  completed: { label: t("booking.myBookings.completed"), variant: "outline" as const, icon: CheckCircle },
});

export function AdminBookingsPage() {
  const { t } = useTranslation();
  const statusConfig = STATUS_CONFIG(t);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const { socket } = useNotifications();

  useEffect(() => {
    if (!socket) return;

    const onBookingNew = (b: {
      bookingId: string;
      customerName: string;
      customerEmail: string;
      movieTitle: string;
      seats: number[];
      totalPrice: number;
      status: string;
      paymentStatus?: string;
    }) => {
      toast.success(
        t("admin.bookings.newBookingToast", {
          customer: b.customerName || b.customerEmail,
          movie: b.movieTitle || "Movie",
        }),
        {
          description: t("admin.bookings.newBookingDesc", {
            seats: b.seats.length,
            total: formatPrice(b.totalPrice),
          }),
        }
      );
      queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] });
    };

    const onBookingCancelled = (b: {
      bookingId: string;
      customerName: string;
      customerEmail: string;
      movieTitle: string;
      seats: number[];
    }) => {
      toast(
        t("admin.bookings.cancelledBookingToast", {
          customer: b.customerName || b.customerEmail,
          movie: b.movieTitle || "Movie",
        }),
        {
          description: t("admin.bookings.cancelledBookingDesc", {
            seats: b.seats.length,
          }),
        }
      );
      queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] });
    };

    socket.on("booking:new", onBookingNew);
    socket.on("booking:cancelled", onBookingCancelled);
    return () => {
      socket.off("booking:new", onBookingNew);
      socket.off("booking:cancelled", onBookingCancelled);
    };
  }, [socket, queryClient, t]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "bookings", { statusFilter, page }],
    queryFn: () =>
      getAllBookings({
        status: (statusFilter || undefined) as any,
        page,
        limit: 10,
      }),
  });

  const handleCancel = async (id: string) => {
    try {
      await cancelBooking(id);
      toast.success("Booking cancelled");
      queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] });
    } catch {
      toast.error("Failed to cancel booking");
    }
  };

  const bookings = (data?.data ?? []).filter(
    (b) =>
      !search ||
      b.movieTitle.toLowerCase().includes(search.toLowerCase()) ||
      b.userEmail.toLowerCase().includes(search.toLowerCase()) ||
      b.userName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Bookings</h1>
        <p className="mt-1 text-sm text-muted-foreground">View and manage all customer bookings</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by movie, customer..."
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {["", "confirmed", "pending", "cancelled"].map((s) => (
            <button
              key={s}
              onClick={() => {
              setStatusFilter(s);
              setPage(1);
            }}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {s || "All"}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={<Ticket className="size-6" />}
          title="No bookings found"
          description="Bookings will appear here once customers start booking tickets."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/60">
          <table className="hidden w-full md:table">
            <thead className="bg-muted/50">
              <tr className="border-b">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Movie</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Seats</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => {
const cfg = statusConfig[booking.status] ?? statusConfig.pending;
        ***REMOVED*** (
                  <tr key={booking.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium">{booking.userName || "—"}</p>
                      <p className="text-xs text-muted-foreground">{booking.userEmail}</p>
                    </td>
                    <td className="px-4 py-3 text-sm">{booking.movieTitle}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {formatDate(booking.date)} {formatTime(booking.startTime)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {booking.seats.map((s) => (
                          <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">{formatPrice(booking.totalAmount)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={cfg.variant}>{cfg.label}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {booking.status !== "cancelled" && booking.status !== "completed" && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-destructive">
                              Cancel
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will cancel the booking and release the seats. A refund will be processed if payment was made.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleCancel(booking.id)}
                                className="bg-destructive text-white hover:bg-destructive/90"
                              >
                                Cancel Booking
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Mobile cards */}
          <div className="divide-y md:hidden">
            {bookings.map((booking) => {
              const cfg = statusConfig[booking.status] ?? statusConfig.pending;
      ***REMOVED*** (
                <div key={booking.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium">{booking.movieTitle}</p>
                      <p className="text-xs text-muted-foreground">{booking.userName || booking.userEmail}</p>
                    </div>
                    <Badge variant={cfg.variant}>{cfg.label}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatDate(booking.date)} {formatTime(booking.startTime)}</span>
                    <span>·</span>
                    <span>{formatPrice(booking.totalAmount)}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {booking.seats.map((s) => (
                      <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                    ))}
                  </div>
                  {booking.status !== "cancelled" && booking.status !== "completed" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => handleCancel(booking.id)}
                    >
                      Cancel Booking
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <PaginationBar
        page={page}
        totalPages={data?.totalPages ?? 1}
        total={data?.total}
        onPageChange={(p) => {
          setPage(p);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    </div>
  );
}
