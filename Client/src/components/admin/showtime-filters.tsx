import { SlidersHorizontal, RotateCcw } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { DateCalendar } from "@/components/admin/date-calendar";

interface ShowtimeFiltersProps {
  status: ShowtimeStatus;
  onStatusChange: (v: ShowtimeStatus) => void;
  sort: ShowtimeSort;
  onSortChange: (v: ShowtimeSort) => void;
  date?: string;
  onDateChange?: (v: string) => void;
  dates?: string[];
  movieId?: string;
  onMovieChange?: (v: string) => void;
  movies?: { id: string; title: string }[];
  hallName?: string;
  onHallChange?: (v: string) => void;
  halls?: { id: string; name: string }[];
  onReset: () => void;
}

function FilterSelect({
  label,
  value,
  onValueChange,
  children,
}: {
  label: string;
  value: string;
  onValueChange: (v: string) => void;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="h-8 w-full text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
    </div>
  );
}

export function ShowtimeFilters({
  status,
  onStatusChange,
  sort,
  onSortChange,
  date,
  onDateChange,
  dates,
  movieId,
  onMovieChange,
  movies,
  hallName,
  onHallChange,
  halls,
  onReset,
}: ShowtimeFiltersProps) {
  const { t } = useTranslation();

  const activeCount =
    (status !== "all" ? 1 : 0) +
    (sort !== "date-asc" ? 1 : 0) +
    (date ? 1 : 0) +
    (movieId ? 1 : 0) +
    (hallName ? 1 : 0);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <SlidersHorizontal className="size-4" />
          {t("common.filters")}
          {activeCount > 0 && (
            <Badge variant="secondary" className="ml-1 px-1.5">{activeCount}</Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <div className="space-y-4">
          <FilterSelect label={t("common.status")} value={status} onValueChange={(v) => onStatusChange(v as ShowtimeStatus)}>
            {SHOWTIME_STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{t(opt.labelKey)}</SelectItem>
            ))}
          </FilterSelect>

          <FilterSelect label={t("common.sortBy")} value={sort} onValueChange={(v) => onSortChange(v as ShowtimeSort)}>
            {SHOWTIME_SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{t(opt.labelKey)}</SelectItem>
            ))}
          </FilterSelect>

          {dates && onDateChange && (
            <DateCalendar dates={dates} value={date} onChange={(v) => onDateChange(v)} />
          )}

          {movies && onMovieChange && (
            <FilterSelect label={t("common.movie")} value={movieId || "all"} onValueChange={(v) => onMovieChange(v === "all" ? "" : v)}>
              <SelectItem value="all">{t("admin.showtimes.allMovies")}</SelectItem>
              {movies.map((m) => (
                <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>
              ))}
            </FilterSelect>
          )}

          {halls && onHallChange && (
            <FilterSelect label={t("common.hall")} value={hallName || "all"} onValueChange={(v) => onHallChange(v === "all" ? "" : v)}>
              <SelectItem value="all">{t("admin.showtimes.allHalls")}</SelectItem>
              {halls.map((h) => (
                <SelectItem key={h.id} value={h.name}>{h.name}</SelectItem>
              ))}
            </FilterSelect>
          )}

          {activeCount > 0 && (
            <Button variant="ghost" size="sm" className="w-full gap-2" onClick={onReset}>
              <RotateCcw className="size-3.5" />
              {t("common.reset")}
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}