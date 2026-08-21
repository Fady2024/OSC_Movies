import { Types } from "mongoose";
import { Review, IReview } from "./review.model";
import { Movie } from "@/modules/movies/movie.model";
import { Booking } from "@/modules/bookings/booking.model";
import { Showtime } from "@/modules/showtimes/showtime.model";
import { User } from "@/modules/users/user.model";
import { hasScreeningStarted } from "@/modules/showtimes/showtime.util";
import { AppError } from "@/common/errors/AppError";
import { PaginatedResponse } from "@/common/types";

interface ReviewInput {
  rating: number;
  comment: string;
}

const hasAttendedMovie = async (
  customerId: string,
  movieId: string
): Promise<boolean> => {
  const now = new Date();

  const showtimes = await Showtime.find({ movie: movieId })
    .select("date startTime")
    .lean();

  const pastShowtimeIds = showtimes
    .filter((st) => hasScreeningStarted(st.date, st.startTime, now))
    .map((st) => st._id);

  if (pastShowtimeIds.length === 0) return false;

  const booking = await Booking.findOne({
    customer: customerId,
    status: "confirmed",
    showtime: { $in: pastShowtimeIds },
  });

  return !!booking;
};

export const createReview = async (
  customerId: string,
  movieId: string,
  data: ReviewInput
): Promise<IReview> => {
  const movie = await Movie.findOne({ _id: movieId, deletedAt: null }).select("_id");
  if (!movie) {
    throw new AppError("Movie not found", 404);
  }

  const existing = await Review.findOne({ movie: movieId, customer: customerId });
  if (existing) {
    throw new AppError("You already reviewed this movie", 409, "ALREADY_REVIEWED");
  }

  const attended = await hasAttendedMovie(customerId, movieId);
  if (!attended) {
    throw new AppError(
      "You can only review movies you have attended",
      403,
      "NOT_ATTENDED"
    );
  }

  return Review.create({ movie: movieId, customer: customerId, ...data });
};

export const updateReview = async (
  customerId: string,
  reviewId: string,
  data: ReviewInput
): Promise<IReview> => {
  const review = await Review.findOneAndUpdate(
    { _id: reviewId, customer: customerId },
    data,
    { new: true, runValidators: true }
  );
  if (!review) {
    throw new AppError("Review not found", 404);
  }
  return review;
};

export const deleteReview = async (
  customerId: string,
  reviewId: string
): Promise<void> => {
  const review = await Review.findOneAndDelete({
    _id: reviewId,
    customer: customerId,
  });
  if (!review) {
    throw new AppError("Review not found", 404);
  }
};

export const listReviews = async (
  movieId: string,
  filter: { page?: number; limit?: number }
): Promise<
  PaginatedResponse<Record<string, unknown>> & {
    averageRating: number;
    totalReviews: number;
    distribution: { value: number; count: number }[];
  }
> => {
  const { page = 1, limit = 10 } = filter;

  const movie = await Movie.findOne({ _id: movieId, deletedAt: null }).select("_id");
  if (!movie) {
    throw new AppError("Movie not found", 404);
  }

  const query = { movie: movieId };
  const total = await Review.countDocuments(query);
  const reviews = await Review.find(query)
    .sort("-createdAt")
    .skip((page - 1) * limit)
    .limit(limit)
    .populate("customer", "fullName")
    .lean();

  const distAgg = await Review.aggregate([
    { $match: { movie: new Types.ObjectId(movieId) } },
    { $group: { _id: "$rating", count: { $sum: 1 } } },
  ]);
  const totalReviews = distAgg.reduce((sum, d) => sum + d.count, 0);
  const averageRating = totalReviews
    ? +(
        distAgg.reduce((sum, d) => sum + d._id * d.count, 0) / totalReviews
      ).toFixed(1)
    : 0;
  const distribution = Array.from({ length: 10 }, (_, i) => ({
    value: i + 1,
    count: distAgg.find((d) => d._id === i + 1)?.count ?? 0,
  }));

  const data = reviews.map((r) => ({
    id: String(r._id),
    rating: r.rating,
    comment: r.comment,
    customerName: (r.customer as unknown as { fullName?: string })?.fullName ?? "Anonymous",
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }));

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    averageRating,
    totalReviews,
    distribution,
  };
};

export const getMyReview = async (
  customerId: string,
  movieId: string
): Promise<{
  review: Record<string, unknown> | null;
  canReview: boolean;
  attended: boolean;
}> => {
  const movie = await Movie.findOne({ _id: movieId, deletedAt: null }).select("_id");
  if (!movie) {
    throw new AppError("Movie not found", 404);
  }

  const review = await Review.findOne({ movie: movieId, customer: customerId }).lean();
  const attended = await hasAttendedMovie(customerId, movieId);

  return {
    review: review
      ? {
          id: String(review._id),
          rating: review.rating,
          comment: review.comment,
          createdAt: review.createdAt,
          updatedAt: review.updatedAt,
        }
      : null,
    canReview: attended && !review,
    attended,
  };
};

export const adminListReviews = async (filter: {
  page?: number;
  limit?: number;
  search?: string;
  rating?: string;
}): Promise<PaginatedResponse<Record<string, unknown>>> => {
  const { page = 1, limit = 10, search, rating } = filter;

  const query: Record<string, unknown> = {};
  if (rating) {
    query.rating = parseInt(rating, 10);
  }
  if (search) {
    const userMatch = await User.find({
      $or: [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    }).select("_id");
    query.$or = [
      { comment: { $regex: search, $options: "i" } },
      { customer: { $in: userMatch.map((u) => u._id) } },
    ];
  }

  const total = await Review.countDocuments(query);
  const reviews = await Review.find(query)
    .sort("-createdAt")
    .skip((page - 1) * limit)
    .limit(limit)
    .populate("customer", "fullName email")
    .populate("movie", "title")
    .lean();

  const data = reviews.map((r) => ({
    id: String(r._id),
    rating: r.rating,
    comment: r.comment,
    customerName: (r.customer as unknown as { fullName?: string })?.fullName ?? "—",
    customerEmail: (r.customer as unknown as { email?: string })?.email ?? "—",
    movieTitle: (r.movie as unknown as { title?: string })?.title ?? "—",
    createdAt: r.createdAt,
  }));

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
};

export const adminDeleteReview = async (reviewId: string): Promise<void> => {
  const review = await Review.findByIdAndDelete(reviewId);
  if (!review) {
    throw new AppError("Review not found", 404);
  }
};
