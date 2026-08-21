import { resend } from "@/config/resend";
import { env } from "@/config/env";
import { AppError } from "@/common/errors/AppError";
import { Booking } from "@/modules/bookings/booking.model";
import { User } from "@/modules/users/user.model";
import { Showtime } from "@/modules/showtimes/showtime.model";
import {
  bookingConfirmationTemplate,
  passwordResetTemplate,
  showtimeReminderTemplate,
} from "./email.templates";

const FROM_EMAIL = "OSC_Movies <onboarding@resend.dev>";

export const emailService = {
  async sendBookingConfirmation(to: string, data: {
    customerName: string;
    movieTitle: string;
    moviePoster: string;
    showtimeDate: string;
    showtimeTime: string;
    hall: string;
    seats: string[];
    totalAmount: number;
    bookingId: string;
  }) {
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to,
        subject: `Booking Confirmed - ${data.movieTitle}`,
        html: bookingConfirmationTemplate(data),
      });
      return true;
    } catch (error) {
      console.error("Failed to send booking confirmation email:", error);
      return false;
    }
  },

  async sendPasswordReset(to: string, data: {
    customerName: string;
    resetToken: string;
  }) {
    try {
      const resetUrl = `${env.CLIENT_URL}/reset-password?token=${data.resetToken}`;
      await resend.emails.send({
        from: FROM_EMAIL,
        to,
        subject: "Reset Your Password - OSC_Movies",
        html: passwordResetTemplate({
          customerName: data.customerName,
          resetUrl,
        }),
      });
      return true;
    } catch (error) {
      console.error("Failed to send password reset email:", error);
      return false;
    }
  },

  async sendShowtimeReminder(to: string, data: {
    customerName: string;
    movieTitle: string;
    showtimeDate: string;
    showtimeTime: string;
    hall: string;
  }) {
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to,
        subject: `Reminder: ${data.movieTitle} today at ${data.showtimeTime}`,
        html: showtimeReminderTemplate(data),
      });
      return true;
    } catch (error) {
      console.error("Failed to send showtime reminder email:", error);
      return false;
    }
  },

  async sendBookingConfirmationEmail(
    bookingId: string,
    userId: string
  ): Promise<string> {
    const booking = await Booking.findById(bookingId)
      .populate("showtime")
      .populate("movie");

    if (!booking) {
      throw new AppError("Booking not found", 404, "BOOKING_NOT_FOUND");
    }

    if (booking.customer.toString() !== userId) {
      throw new AppError("Not authorized", 403, "FORBIDDEN");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    const showtime = await Showtime.findById(booking.showtime);
    const movieTitle = showtime?.movieTitle ?? "Unknown Movie";
    const moviePoster = showtime?.moviePosterUrl ?? "";

    const success = await this.sendBookingConfirmation(user.email, {
      customerName: user.fullName,
      movieTitle,
      moviePoster,
      showtimeDate: showtime
        ? new Date(showtime.date).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "N/A",
      showtimeTime: showtime?.startTime ?? "N/A",
      hall: showtime?.hallName ?? "N/A",
      seats: booking.selectedSeats.map((s: number) => `Seat ${s}`),
      totalAmount: booking.totalPrice,
      bookingId: (booking._id as any).toString(),
    });

    if (!success) {
      throw new AppError("Failed to send email", 500, "EMAIL_SEND_FAILED");
    }

    return "Booking confirmation email sent";
  },

  async sendShowtimeReminderEmail(showtimeId: string): Promise<string> {
    const showtime = await Showtime.findById(showtimeId);
    if (!showtime) {
      throw new AppError("Showtime not found", 404, "SHOWTIME_NOT_FOUND");
    }

    const bookings = await Booking.find({ showtime: showtimeId, status: "confirmed" });

    let sentCount = 0;
    for (const booking of bookings) {
      const user = await User.findById(booking.customer);
      if (!user) continue;

      const success = await this.sendShowtimeReminder(user.email, {
        customerName: user.fullName,
        movieTitle: showtime.movieTitle ?? "Unknown Movie",
        showtimeDate: new Date(showtime.date).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        showtimeTime: showtime.startTime,
        hall: showtime.hallName,
      });

      if (success) sentCount++;
    }

    return `Sent ${sentCount} reminder emails`;
  },
};
