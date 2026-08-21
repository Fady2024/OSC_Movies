import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus, Search, Calendar, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { getShowtimes, deleteShowtime } from "@/api/showtimes.api";
import { getMovies } from "@/api/movies.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { formatDate, formatTime, formatPrice } from "@/utils/format";
import type { ShowtimeSort, ShowtimeStatus } from "@/constants/showtimes";
import { toast } from "sonner";
import { ShowtimeFilters } from "@/components/admin/showtime-filters";
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

export function AdminShowtimesPage() {
  const [search, setSearch] = useState("");
  const [movieFilter, setMovieFilter] = useState<string>("");
  const [hallFilter, setHallFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<ShowtimeStatus>("all");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [sortOption, setSortOption] = useState<ShowtimeSort>("date-asc");
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "showtimes", { search, movieFilter, hallFilter, statusFilter, dateFilter, sortOption, page }],
    queryFn: () =>
      getShowtimes({
        search: search || undefined,
        movieId: movieFilter || undefined,
        hallName: hallFilter || undefined,
        status: statusFilter,
        sort: sortOption,
        date: dateFilter || undefined,
        page,
        limit: 10,
      }),
  });

  const { data: moviesData } = useQuery({
    queryKey: ["admin", "movies"],
    queryFn: () => getMovies({ limit: 100 }),
  });

  const handleDelete = async (id: string) => {
    try {
      await deleteShowtime(id);
      toast.success("Showtime deleted");
      queryClient.invalidateQueries({ queryKey: ["admin", "showtimes"] });
    } catch {
      toast.error("Failed to delete showtime");
    }
  };

  const availableDates = data?.filters?.dates ?? [];
  const availableHalls = (data?.filters?.halls ?? []).map((name) => ({ id: name, name }));
  const showtimes = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Showtimes</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage screenings and schedules</p>
        </div>
        <Link to="/admin/showtimes/new">
          <Button className="gap-2">
            <Plus className="size-4" />
            Add Showtime
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search showtimes..."
            className="pl-9"
          />
        </div>
        <ShowtimeFilters
          status={statusFilter}
          onStatusChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
          sort={sortOption}
          onSortChange={(v) => {
            setSortOption(v);
            setPage(1);
          }}
          date={dateFilter}
          onDateChange={(v) => {
            setDateFilter(v);
            setPage(1);
          }}
          dates={availableDates}
          movieId={movieFilter}
          onMovieChange={(v) => {
            setMovieFilter(v);
            setPage(1);
          }}
          movies={moviesData?.data ?? []}
          hallName={hallFilter}
          onHallChange={(v) => {
            setHallFilter(v);
            setPage(1);
          }}
          halls={availableHalls}
          onReset={() => {
            setSearch("");
            setMovieFilter("");
            setHallFilter("");
            setStatusFilter("all");
            setDateFilter("");
            setSortOption("date-asc");
            setPage(1);
          }}
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : showtimes.length === 0 ? (
        <EmptyState
          icon={<Calendar className="size-6" />}
          title="No showtimes found"
          description="Create a showtime to schedule a screening."
          action={
            <Link to="/admin/showtimes/new">
              <Button>Add Showtime</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-2">
          {showtimes.map((st) => (
            <div
              key={st.id}
              className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-4 sm:flex-row sm:items-center"
            >
              <img src={st.moviePosterUrl} alt={st.movieTitle} className="size-12 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium">{st.movieTitle}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(st.date)} · {formatTime(st.startTime)}–{formatTime(st.endTime)} · {st.hallName}
                </p>
                <div className="mt-1.5 flex items-center gap-2">
                  <Badge variant="outline">{formatPrice(st.ticketPrice)}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {st.availableSeats}/{st.hallCapacity} seats
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Link to={`/admin/showtimes/${st.id}/edit`}>
                  <Button variant="ghost" size="icon-sm">
                    <Pencil className="size-4" />
                  </Button>
                </Link>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon-sm" className="text-destructive">
                      <Trash2 className="size-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this showtime?</AlertDialogTitle>
                      <AlertDialogDescription>This will remove the screening and release all held seats.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(st.id)}
                        className="bg-destructive text-white hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}

      <PaginationBar
        page={data?.page ?? page}
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
