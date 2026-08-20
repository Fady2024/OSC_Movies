import { Movie, IMovie } from "@/modules/movies/movie.model";
import { Showtime, IShowtime } from "./showtime.model";
import { SeatReservation } from "@/modules/bookings/seat-reservation.model";
import { AppError } from "@/common/errors/AppError";
import {
  dateInTz,
  screeningDateTime,
  hasScreeningStarted,
  toLocalDateString,
} from "@/common/utils/timezone";

type ShowtimeStatus = "all" | "upcoming" | "past";
type ShowtimeSort = "date-asc" | "date-desc" | "seats-asc" | "seats-desc";

export const getShowtimes = async (filter: {
  movie?: string;
  date?: string;
  hallName?: string;
  search?: string;
  status?: ShowtimeStatus;
  sort?: ShowtimeSort;
  page?: number;
  limit?: number;
}) => {
  const {
    movie,
    date,
    hallName,
    search,
    status = "all",
    sort = "date-asc",
    page = 1,
    limit = 50,
  } = filter;

  const query: Record<string, any> = {};

  if (movie) {
    query.movie = movie;
  }
  if (date) {
    const [year, month, day] = date.split("-").map(Number);
    query.date = {
      $gte: dateInTz(year, month, day, 0, 0, 0),
      $lte: dateInTz(year, month, day, 23, 59, 59, 999),
    };
  }
  if (hallName) {
    query.hallName = { $regex: hallName, $options: "i" };
  }
  if (search) {
    const movieIds = await Movie.find({
      title: { $regex: search, $options: "i" },
    })
      .select("_id")
      .lean();
    query.$or = [
      { hallName: { $regex: search, $options: "i" } },
      { movie: { $in: movieIds.map((m) => m._id) } },
    ];
  }

  const [filters, total] = await Promise.all([
    (async () => {
      const [dates, halls] = await Promise.all([
        Showtime.distinct("date"),
        Showtime.distinct("hallName"),
      ]);
      return {
        dates: dates.map((d) => toLocalDateString(d)).sort(),
        halls: halls.filter(Boolean).sort(),
      };
    })(),
    Showtime.countDocuments(query),
  ]);

  const skip = (page - 1) * limit;

  if (status === "all") {
    const mongoSort =
      sort === "date-asc"
        ? "date"
        : sort === "date-desc"
          ? "-date"
          : sort === "seats-asc"
            ? "availableSeats"
            : "-availableSeats";
    const data = await Showtime.find(query)
      .populate("movie", "title posterUrl")
      .sort(mongoSort)
      .skip(skip)
      .limit(limit);
    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      filters,
    };
  }

  const lean = await Showtime.find(query)
    .select("date startTime availableSeats")
    .lean();

  const now = new Date();
  let rows = lean.filter((s) =>
    status === "upcoming"
      ? !hasScreeningStarted(s.date, s.startTime, now)
      : hasScreeningStarted(s.date, s.startTime, now)
  );

  rows.sort((a, b) => {
    const ta = screeningDateTime(a.date, a.startTime).getTime();
    const tb = screeningDateTime(b.date, b.startTime).getTime();
    if (sort === "date-desc") return tb - ta;
    if (sort === "seats-asc") return a.availableSeats - b.availableSeats;
    if (sort === "seats-desc") return b.availableSeats - a.availableSeats;
    return ta - tb;
  });

  const pageRows = rows.slice(skip, skip + limit);
  const ids = pageRows.map((r) => r._id);
  const docs = ids.length
    ? await Showtime.find({ _id: { $in: ids } }).populate("movie", "title posterUrl")
    : [];
  const byId = new Map(docs.map((d) => [String(d._id), d]));

  return {
    data: ids.map((id) => byId.get(String(id))).filter(Boolean),
    total: rows.length,
    page,
    limit,
    totalPages: Math.ceil(rows.length / limit),
    filters,
  };
};

export const getShowtimeById = async (id: string): Promise<IShowtime> => {
  const showtime = await Showtime.findById(id).populate("movie", "title posterUrl");
  if (!showtime) {
    throw new AppError("Showtime not found", 404, "SHOWTIME_NOT_FOUND");
  }
  return showtime;
};

export const createShowtime = async (data: Partial<IShowtime>): Promise<IShowtime> => {
  const movie = await Movie.findById(data.movie);
  if (!movie) {
    throw new AppError("Movie not found", 404, "MOVIE_NOT_FOUND");
  }

  const showtime = await Showtime.create({
    ...data,
    movieTitle: movie.title,
    moviePosterUrl: movie.posterUrl,
  });

  return showtime;
};

export const updateShowtime = async (id: string, data: Partial<IShowtime>): Promise<IShowtime> => {
  const showtime = await Showtime.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!showtime) {
    throw new AppError("Showtime not found", 404, "SHOWTIME_NOT_FOUND");
  }
  return showtime;
};

export const deleteShowtime = async (id: string): Promise<void> => {
  const showtime = await Showtime.findById(id);
  if (!showtime) {
    throw new AppError("Showtime not found", 404, "SHOWTIME_NOT_FOUND");
  }

  const hasBookings = await SeatReservation.countDocuments({ showtime: id });
  if (hasBookings > 0) {
    throw new AppError(
      "Cannot delete a showtime that has confirmed bookings",
      409,
      "SHOWTIME_HAS_BOOKINGS"
    );
  }

  await Showtime.findByIdAndDelete(id);
};

export const getAvailableSeats = async (showtimeId: string) => {
  const showtime = await Showtime.findById(showtimeId);
  if (!showtime) {
    throw new AppError("Showtime not found", 404, "SHOWTIME_NOT_FOUND");
  }

  const reservations = await SeatReservation.find({ showtime: showtimeId }).select("seatNumber");
  const reservedSeats = new Set(reservations.map((r) => r.seatNumber));

  const rows: { row: string; seats: { number: number; status: string }[] }[] = [];
  const seatsPerRow = 10;
  const totalRows = Math.ceil(showtime.totalCapacity / seatsPerRow);

  for (let r = 0; r < totalRows; r++) {
    const rowLetter = String.fromCharCode(65 + r);
    const seatsInRow = Math.min(
      seatsPerRow,
      showtime.totalCapacity - r * seatsPerRow
    );
    const seats = [];
    for (let c = 1; c <= seatsInRow; c++) {
      seats.push({
        number: c,
        status: reservedSeats.has(r * seatsPerRow + c) ? "reserved" : "available",
      });
    }
    rows.push({ row: rowLetter, seats });
  }

  return {
    showtimeId,
    totalCapacity: showtime.totalCapacity,
    bookedSeats: showtime.bookedSeats,
    availableSeats: showtime.availableSeats,
    rows,
  };
};
