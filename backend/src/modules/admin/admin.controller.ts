import { Request, Response } from "express";
import { Booking } from "@/modules/bookings/booking.model";
import { User } from "@/modules/users/user.model";
import { adminService } from "./admin.service";
import { searchLogs } from "@/common/logging/logger";
import {
  adminListReviews,
  adminDeleteReview,
} from "@/modules/reviews/review.service";

export const getDashboardStats = async (_req: Request, res: Response) => {
  const data = await adminService.getDashboardStats();
  res.json({ success: true, data });
};

export const getBookings = async (req: Request, res: Response) => {
  const { status, search, page, limit } = req.query;

  const result = await adminService.getBookings({
    status: status as string,
    search: search as string,
    page: page ? parseInt(page as string, 10) : 1,
    limit: limit ? parseInt(limit as string, 10) : 20,
  });

  res.json({ success: true, ...result });
};

export const updateBookingStatus = async (req: Request, res: Response) => {
  const { status } = req.body;
  const booking = await adminService.updateBookingStatus(
    String(req.params.id),
    status
  );
  res.json({ data: booking });
};

export const getUsers = async (req: Request, res: Response) => {
  const { search, role, page, limit } = req.query;

  const pageNum = Math.max(parseInt(page as string, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit as string, 10) || 20, 1), 100);
  const skip = (pageNum - 1) * limitNum;

  const query: Record<string, any> = {};
  if (role) query.role = role;
  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(query)
      .sort("-createdAt")
      .skip(skip)
      .limit(limitNum)
      .lean(),
    User.countDocuments(query),
  ]);

  const ids = users.map((u) => u._id);
  const bookingAgg = await Booking.aggregate([
    { $match: { customer: { $in: ids } } },
    {
      $group: {
        _id: "$customer",
        bookings: { $sum: 1 },
        spent: { $sum: "$totalPrice" },
      },
    },
  ]);
  const statsMap = new Map(
    bookingAgg.map((b) => [String(b._id), b])
  );

  const data = users.map((u) => ({
    id: String(u._id),
    fullName: u.fullName,
    email: u.email,
    role: u.role,
    notifyNewMovies: u.notifyNewMovies,
    deletedAt: u.deletedAt,
    createdAt: u.createdAt,
    bookingCount: statsMap.get(String(u._id))?.bookings ?? 0,
    totalSpent: statsMap.get(String(u._id))?.spent ?? 0,
  }));

  res.json({
    success: true,
    data,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
  });
};

export const getLogs = async (req: Request, res: Response) => {
  const { level, search, page, limit } = req.query;

  const result = await searchLogs({
    page: parseInt(page as string, 10) || 1,
    limit: parseInt(limit as string, 10) || 20,
    level: level as string | undefined,
    search: search as string | undefined,
  });

  res.json({ success: true, ...result });
};

export const updateUserRole = async (req: Request, res: Response) => {
  const { role } = req.body;
  if (role !== "customer" && role !== "admin") {
    return res.status(400).json({ message: "Invalid role" });
  }

  const userId = String(req.params.id);
  if (req.user?.sub === userId) {
    return res.status(400).json({ message: "You cannot change your own role" });
  }

  const user = await User.findByIdAndUpdate(userId, { role }, { new: true }).lean();
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({ success: true, data: { id: String(user._id), role: user.role } });
};

export const getReviews = async (req: Request, res: Response) => {
  const { search, rating, page, limit } = req.query;

  const result = await adminListReviews({
    page: parseInt(page as string, 10) || 1,
    limit: parseInt(limit as string, 10) || 10,
    search: search as string | undefined,
    rating: rating as string | undefined,
  });

  res.json({ success: true, ...result });
};

export const deleteReview = async (req: Request, res: Response) => {
  await adminDeleteReview(String(req.params.id));
  res.status(204).send();
};
