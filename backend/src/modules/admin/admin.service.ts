import mongoose from "mongoose";
import { Movie } from "@/modules/movies/movie.model";
import { User } from "@/modules/users/user.model";
import { AppError } from "@/common/errors/AppError";
import type { BookingFilter, DashboardStats, PaginatedResponse } from "@/common/types";
import { startOfDayInTz } from "@/common/utils/timezone";

type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

const VALID_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["cancelled", "completed"],
  cancelled: [],
  completed: [],
};

function getBookingModel() {
  return mongoose.model("Booking");
}

function getShowtimeModel() {
  return mongoose.model("Showtime");
}

export class AdminService {
  async getDashboardStats(): Promise<DashboardStats> {
    const Booking = getBookingModel();
    const Showtime = getShowtimeModel();

    const today = startOfDayInTz(new Date());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalMovies,
      activeShowtimes,
      todaysBookings,
      revenueResult,
      showtimeCapacity,
    ] = await Promise.all([
      Movie.findWithDeleted().countDocuments(),
      Showtime.countDocuments({ date: { $gte: today } }),
      Booking.countDocuments({
        createdAt: { $gte: today, $lt: tomorrow },
        status: { $ne: "cancelled" },
      }),
      Booking.aggregate([
        { $match: { status: { $ne: "cancelled" } } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]),
      Showtime.aggregate([
        { $match: { date: { $gte: today } } },
        {
          $group: {
            _id: null,
            totalCapacity: { $sum: "$totalCapacity" },
            totalBooked: { $sum: "$bookedSeats" },
          },
        },
      ]),
    ]);

    const totalRevenue = revenueResult[0]?.total ?? 0;
    const capacity = showtimeCapacity[0];
    const occupancyRate =
      capacity && capacity.totalCapacity > 0
        ? Math.round((capacity.totalBooked / capacity.totalCapacity) * 100)
        : 0;

    return {
      totalMovies,
      activeShowtimes,
      todaysBookings,
      totalRevenue,
      occupancyRate,
    };
  }

  async getBookings(filter: BookingFilter): Promise<PaginatedResponse<any>> {
    const Booking = getBookingModel();

    const page = Math.max(filter.page ?? 1, 1);
    const limit = Math.min(Math.max(filter.limit ?? 20, 1), 100);
    const skip = (page - 1) * limit;

    const query: Record<string, any> = {};

    if (filter.status) {
      query.status = filter.status;
    }

    if (filter.search) {
      const userDocs = await User.find({
        $or: [
          { fullName: { $regex: filter.search, $options: "i" } },
          { email: { $regex: filter.search, $options: "i" } },
        ],
      }).select("_id");
      query.customer = { $in: userDocs.map((u) => u._id) };
    }

    const [data, total] = await Promise.all([
      Booking.find(query)
        .populate("customer", "fullName email")
        .populate(
          "showtime",
          "hallName date startTime endTime ticketPrice movieTitle moviePosterUrl movie"
        )
        .sort("-createdAt")
        .skip(skip)
        .limit(limit),
      Booking.countDocuments(query),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateBookingStatus(
    bookingId: string,
    status: BookingStatus
  ): Promise<any> {
    const Booking = getBookingModel();

    if (!(status in VALID_TRANSITIONS)) {
      throw new AppError("Invalid status value", 400, "INVALID_STATUS");
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new AppError("Booking not found", 404, "BOOKING_NOT_FOUND");
    }

    const currentStatus = booking.status as BookingStatus;
    const allowed = VALID_TRANSITIONS[currentStatus];

    if (!allowed.includes(status)) {
      throw new AppError(
        `Cannot transition from "${currentStatus}" to "${status}"`,
        400,
        "INVALID_STATUS_CHANGE"
      );
    }

    booking.status = status;
    await booking.save();

    return booking.populate([
      { path: "movie", select: "title posterUrl duration" },
      { path: "showtime" },
    ]);
  }
}

export const adminService = new AdminService();
