import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { CalendarDays } from "lucide-react";
import { arEG, enUS } from "date-fns/locale";
import type { DayButton } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/format";

const dateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const parseDate = (key: string) => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
};

interface DateCalendarProps {
  dates: string[];
  value?: string;
  onChange: (v: string) => void;
}

export function DateCalendar({ dates, value, onChange }: DateCalendarProps) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const isAr = i18n.language === "ar";

  const available = useMemo(() => new Set(dates), [dates]);
  const hasShowtimes = (d: Date) => available.has(dateKey(d));

  const defaultMonth = useMemo(() => {
    const first = dates[0];
    if (!first) return undefined;
    const [y, m] = first.split("-").map(Number);
    return new Date(y, m - 1, 1);
  }, [dates]);

  return (
    <div className="space-y-1.5">
      <span className="text-xs font-medium">{t("common.date")}</span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full justify-between"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="truncate">
          {value ? formatDate(value) : t("admin.showtimes.allDates")}
        </span>
        <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
      </Button>
      {open && (
        <div className="rounded-lg border border-border/60 bg-card p-2">
          <Calendar
            mode="single"
            selected={value ? parseDate(value) : undefined}
            onSelect={(d) => {
              if (d) {
                onChange(dateKey(d));
                setOpen(false);
              }
            }}
            defaultMonth={defaultMonth}
            captionLayout="dropdown"
            showOutsideDays={false}
            locale={isAr ? arEG : enUS}
            disabled={(d) => !hasShowtimes(d)}
            modifiers={{ hasShowtimes: (d) => hasShowtimes(d) }}
            formatters={{
              formatMonthDropdown: (d) =>
                new Intl.DateTimeFormat(isAr ? "ar-EG" : "en-US", { month: "long" }).format(d),
              formatYearDropdown: (d) =>
                new Intl.DateTimeFormat(isAr ? "ar-EG" : "en-US", { year: "numeric" }).format(d),
            }}
            components={{ DayButton: CalendarDayButton }}
            className="mx-auto"
          />
          <div className="mt-2 flex items-center justify-between gap-2 border-t border-border/40 pt-2">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="size-2 rounded-full bg-cinema-gold" />
              {t("admin.showtimes.datesWithShows")}
            </span>
            {value && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
              >
                {t("admin.showtimes.allDates")}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  return (
    <button
      type="button"
      className={cn(
        "relative flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-md text-sm font-normal transition-colors",
        modifiers.selected
          ? "bg-primary text-primary-foreground"
          : modifiers.hasShowtimes
            ? "bg-cinema-gold/15 text-cinema-gold hover:bg-cinema-gold/25"
            : modifiers.today
              ? "ring-1 ring-inset ring-cinema-gold/50"
              : "hover:bg-accent",
        modifiers.disabled && !modifiers.selected && "cursor-not-allowed opacity-40 hover:bg-transparent",
        modifiers.focused && "ring-2 ring-ring ring-offset-1",
        className
      )}
      {...props}
    >
      <span>{day.date.getDate()}</span>
      {modifiers.hasShowtimes && (
        <span className="absolute bottom-1 size-1 rounded-full bg-cinema-gold" />
      )}
    </button>
  );
}