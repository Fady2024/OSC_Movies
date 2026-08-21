export type ShowtimeSort = "date-asc" | "date-desc" | "seats-asc" | "seats-desc";

export const SHOWTIME_SORT_OPTIONS: { value: ShowtimeSort; labelKey: string }[] = [
  { value: "date-asc", labelKey: "common.sortDateAsc" },
  { value: "date-desc", labelKey: "common.sortDateDesc" },
  { value: "seats-asc", labelKey: "common.sortSeatsAsc" },
  { value: "seats-desc", labelKey: "common.sortSeatsDesc" },
];

export type ShowtimeStatus = "all" | "upcoming" | "past";

export const SHOWTIME_STATUS_OPTIONS: { value: ShowtimeStatus; labelKey: string }[] = [
  { value: "all", labelKey: "common.all" },
  { value: "upcoming", labelKey: "common.upcoming" },
  { value: "past", labelKey: "common.past" },
];