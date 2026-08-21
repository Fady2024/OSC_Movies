import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Film, Calendar, Ticket, DollarSign, TrendingUp, Percent, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { getMovies } from "@/api/movies.api";
import { getShowtimes } from "@/api/showtimes.api";
import { getAllBookings } from "@/api/bookings.api";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate, formatTime, formatPrice, isUpcomingShowtime, showtimeTimestamp } from "@/utils/format";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SHOWTIME_SORT_OPTIONS,
  SHOWTIME_STATUS_OPTIONS,
  type ShowtimeSort,
  type ShowtimeStatus,
} from "@/constants/showtimes";
import { useTranslation } from "react-i18next";

export function AdminDashboardPage() {
  const { t } = useTranslation();

  const chartConfig = {
    bookings: { label: t("admin.dashboard.bookingsChartLabel"), color: "var(--chart-1)" },
    revenue: { label: t("admin.dashboard.revenueChartLabel"), color: "var(--chart-2)" },
  };

  const { data: moviesData } = useQuery({
    queryKey: ["admin", "movies"],
    queryFn: () => getMovies({ limit: 100 }),
  });
  const { data: showtimesData } = useQuery({
    queryKey: ["admin", "showtimes"],
    queryFn: () => getShowtimes({ limit: 100 }),
  });
  const { data: bookingsData } = useQuery({
    queryKey: ["admin", "bookings"],
    queryFn: () => getAllBookings({ limit: 100 }),
  });

  const isLoading = !moviesData || !showtimesData || !bookingsData;

  const totalMovies = moviesData?.total ?? 0;
  const activeShowtimes = showtimesData?.data.filter((s) => isUpcomingShowtime(s.date, s.startTime)).length ?? 0;
  const localToday = new Date().toLocaleDateString("en-CA");
  const todayBookings = bookingsData?.data.filter((b) => {
    const bookingDay = new Date(b.createdAt).toLocaleDateString("en-CA");
    return bookingDay === localToday;
  }).length ?? 0;
  const revenue = bookingsData?.data
    .filter((b) => b.status === "confirmed")
    .reduce((sum, b) => sum + b.totalAmount, 0) ?? 0;
  const totalSeats = showtimesData?.data.reduce((sum, s) => sum + s.hallCapacity, 0) ?? 0;
  const bookedSeats = showtimesData?.data.reduce((sum, s) => sum + s.bookedSeats, 0) ?? 0;
  const occupancyRate = totalSeats > 0 ? Math.round((bookedSeats / totalSeats) * 100) : 0;

  const [showtimeFilter, setShowtimeFilter] = useState<ShowtimeStatus>("all");
  const [sortOption, setSortOption] = useState<ShowtimeSort>("date-asc");

  const sortedShowtimes = (showtimesData?.data ?? []).slice().sort((a, b) => {
    if (sortOption === "date-desc") return showtimeTimestamp(b.date, b.startTime) - showtimeTimestamp(a.date, a.startTime);
    if (sortOption === "seats-asc") return a.availableSeats - b.availableSeats;
    if (sortOption === "seats-desc") return b.availableSeats - a.availableSeats;
    return showtimeTimestamp(a.date, a.startTime) - showtimeTimestamp(b.date, b.startTime);
  });

  const filteredShowtimes = sortedShowtimes.filter((s) => {
    if (showtimeFilter === "upcoming") return isUpcomingShowtime(s.date, s.startTime);
    if (showtimeFilter === "past") return !isUpcomingShowtime(s.date, s.startTime);
    return true;
  });

  // Chart data: bookings per movie
  const chartData = (moviesData?.data ?? [])
    .map((movie) => {
      const movieBookings = (bookingsData?.data ?? []).filter(
        (b) => b.movieTitle === movie.title && b.status === "confirmed"
      );
      return {
        name: movie.title.slice(0, 12),
        bookings: movieBookings.length,
        revenue: movieBookings.reduce((sum, b) => sum + b.totalAmount, 0),
      };
    })
    .filter((d) => d.bookings > 0)
    .sort((a, b) => b.bookings - a.bookings)
    .slice(0, 6);

  const stats = [
    { label: t("admin.dashboard.totalMovies"), value: totalMovies, icon: Film, color: "text-cinema-teal" },
    { label: t("admin.dashboard.activeShowtimes"), value: activeShowtimes, icon: Calendar, color: "text-cinema-gold" },
    { label: t("admin.dashboard.totalBookings"), value: todayBookings, icon: Ticket, color: "text-cinema-teal" },
    { label: t("admin.dashboard.totalRevenue"), value: formatPrice(revenue), icon: DollarSign, color: "text-cinema-gold" },
    { label: t("admin.dashboard.totalSeatsBooked"), value: `${occupancyRate}%`, icon: Percent, color: "text-cinema-teal" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("admin.dashboard.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("admin.dashboard.subtitle")}</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
          : stats.map((stat) => {
              const Icon = stat.icon;
      return (
                <div key={stat.label} className="rounded-xl border border-border/60 bg-card p-4">
                  <div className={`flex items-center gap-1.5 ${stat.color}`}>
                    <Icon className="size-4" />
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{stat.label}</span>
                  </div>
                  <p className="mt-2 text-2xl font-bold">{stat.value}</p>
                </div>
              );
            })}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="size-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">{t("admin.dashboard.recentBookings")}</h2>
          </div>
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : chartData.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">{t("admin.dashboard.noBookingData")}</p>
          ) : (
            <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
              <BarChart data={chartData} accessibilityLayer>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="bookings" fill="var(--color-bookings)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          )}
        </div>

        <div className="rounded-xl border border-border/60 bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <DollarSign className="size-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">{t("admin.dashboard.revenueChart")}</h2>
          </div>
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : chartData.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">{t("admin.dashboard.noRevenueData")}</p>
          ) : (
            <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
              <BarChart data={chartData} accessibilityLayer>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border/60 bg-card p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold">{t("admin.dashboard.upcomingShowtimes")}</h2>
          <div className="flex flex-wrap items-center gap-3">
            <Select value={sortOption} onValueChange={(v) => setSortOption(v as ShowtimeSort)}>
              <SelectTrigger className="w-full sm:w-[160px] h-8 text-xs">
                <SelectValue placeholder={t("common.sortBy")} />
              </SelectTrigger>
              <SelectContent>
                {SHOWTIME_SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{t(opt.labelKey)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Tabs value={showtimeFilter} onValueChange={(v) => setShowtimeFilter(v as ShowtimeStatus)}>
              <TabsList variant="line">
                {SHOWTIME_STATUS_OPTIONS.map((opt) => (
                  <TabsTrigger key={opt.value} value={opt.value}>{t(opt.labelKey)}</TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <Link to="/admin/showtimes">
              <button className="flex items-center gap-1 text-xs text-primary hover:underline">
                {t("admin.dashboard.viewAll")} <ArrowRight className="size-3" />
              </button>
            </Link>
          </div>
        </div>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : filteredShowtimes.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">{t("admin.dashboard.noBookingData")}</p>
        ) : (
          <div className="space-y-2">
            {filteredShowtimes
              .slice(0, 6)
              .map((st) => (
                <div key={st.id} className="flex items-center justify-between rounded-lg border border-border/40 px-3 py-2.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={st.moviePosterUrl} alt={st.movieTitle} className="size-8 rounded object-cover" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{st.movieTitle}</p>
                      <p className="text-xs text-muted-foreground">{st.hallName} · {formatDate(st.date)} · {formatTime(st.startTime)}</p>
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    <p className="font-semibold">{st.availableSeats}/{st.hallCapacity}</p>
                    <p className="text-muted-foreground">{t("admin.dashboard.available")}</p>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
