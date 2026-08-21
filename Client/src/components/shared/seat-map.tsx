import { useMemo, useCallback } from "react";
import type { SeatRow, Seat } from "@/types/showtime.types";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/utils/format";

interface SeatMapProps {
  rows: SeatRow[];
  selectedSeats: string[];
  onSeatToggle: (seatId: string) => void;
  maxSeats?: number;
  /** Reserved seats that belong to the current customer and may be replaced. */
  selectableReservedSeats?: string[];
}

const SEAT_STATUSES = {
  available: "available",
  reserved: "reserved",
  selected: "selected",
} as const;

export function SeatMap({
  rows,
  selectedSeats,
  onSeatToggle,
  maxSeats = 8,
  selectableReservedSeats = [],
}: SeatMapProps) {
  const getSeatStatus = useCallback(
    (seat: Seat): string => {
      if (selectedSeats.includes(seat.id)) return SEAT_STATUSES.selected;
      if (seat.status === "reserved" && !selectableReservedSeats.includes(seat.id)) return SEAT_STATUSES.reserved;
      return SEAT_STATUSES.available;
    },
    [selectedSeats]
  );

  const handleSeatClick = useCallback(
    (seat: Seat) => {
      const isReservedByAnotherBooking =
        seat.status === "reserved" && !selectableReservedSeats.includes(seat.id);
      if (isReservedByAnotherBooking) return;
      if (
        !selectedSeats.includes(seat.id) &&
        selectedSeats.length >= maxSeats
      )
***REMOVED***;
      onSeatToggle(seat.id);
    },
    [selectedSeats, onSeatToggle, maxSeats, selectableReservedSeats]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, seat: Seat) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleSeatClick(seat);
      }
    },
    [handleSeatClick]
  );

  const legendItems = useMemo(
    () => [
      { label: "Available", className: "bg-muted-foreground/15 border-muted-foreground/30" },
      { label: "Selected", className: "bg-cinema-gold border-cinema-gold" },
      { label: "Reserved", className: "bg-red-500/30 border-red-500/50" },
    ],
    []
  );

  const maxRowLength = rows[0]?.seats.length ?? 0;
  const aisleAfter = Math.floor(maxRowLength / 2);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Screen */}
      <div className="relative w-full max-w-2xl">
        <div className="mx-auto h-2 w-3/4 rounded-t-full bg-gradient-to-r from-transparent via-cinema-gold/60 to-transparent screen-glow" />
        <div className="mx-auto mt-1 h-8 w-3/4 bg-gradient-to-b from-cinema-gold/10 to-transparent" />
        <p className="mt-1 text-center text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
          Screen
        </p>
      </div>

      {/* Seat grid */}
      <div className="w-full overflow-x-auto pb-2">
        <div className="mx-auto w-fit min-w-full">
          {rows.map((row) => (
            <div key={row.row} className="flex items-center justify-center gap-1.5 py-1 sm:gap-2">
              {/* Row label left */}
              <span className="w-5 text-center text-[10px] font-medium text-muted-foreground sm:text-xs">
                {row.row}
              </span>

              <div className="flex gap-1 sm:gap-1.5">
                {row.seats.map((seat, idx) => {
                  const status = getSeatStatus(seat);
                  const isReserved =
                    seat.status === "reserved" && !selectableReservedSeats.includes(seat.id);
                  const isSelected = status === SEAT_STATUSES.selected;
                  const isMaxed =
                    !isSelected &&
                    !isReserved &&
                    selectedSeats.length >= maxSeats;

          ***REMOVED*** (
                    <div key={seat.id} className="flex items-center">
                      {idx === aisleAfter && <div className="w-3 sm:w-4" />}
                      <button
                        type="button"
                        disabled={isReserved || isMaxed}
                        onClick={() => handleSeatClick(seat)}
                        onKeyDown={(e) => handleKeyDown(e, seat)}
                        aria-label={`Seat ${seat.id}, ${isReserved ? "reserved" : isSelected ? "selected" : "available"}, ${formatPrice(seat.price)}`}
                        aria-pressed={isSelected}
                        className={cn(
                          "seat-select-anim relative flex size-6 items-center justify-center rounded-t-md rounded-b-sm border text-[9px] font-medium transition-all sm:size-7 sm:text-[10px]",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                          status === SEAT_STATUSES.available &&
                            "border-muted-foreground/30 bg-muted-foreground/10 text-muted-foreground hover:border-cinema-gold/50 hover:bg-cinema-gold/10 hover:text-cinema-gold",
                          status === SEAT_STATUSES.selected &&
                            "border-cinema-gold bg-cinema-gold text-cinema-gold-foreground shadow-md shadow-cinema-gold/30",
                          status === SEAT_STATUSES.reserved &&
                            "cursor-not-allowed border-red-500/50 bg-red-500/20 text-red-400/60 opacity-70",
                          isMaxed && "cursor-not-allowed opacity-30"
                        )}
                      >
                        {seat.number}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Row label right */}
              <span className="w-5 text-center text-[10px] font-medium text-muted-foreground sm:text-xs">
                {row.row}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
        {legendItems.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div className={cn("size-4 rounded-t-md rounded-b-sm border", item.className)} />
            <span className="text-xs text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
