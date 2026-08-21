import cron from "node-cron";
import { Booking } from "@/modules/bookings/booking.model";
import { SeatReservation } from "@/modules/bookings/seat-reservation.model";
import { Showtime } from "@/modules/showtimes/showtime.model";
import { notifyReviewRequests } from "@/modules/notifications/notification.service";

export const startCleanupJobs = () => {
  cron.schedule("*/5 * * * *", async () => {
    try {
      const expiredReservations = await SeatReservation.find({
        expiresAt: { $lt: new Date() },
        booking: null,
      });

      if (expiredReservations.length > 0) {
        await SeatReservation.deleteMany({
          _id: { $in: expiredReservations.map((r) => r._id) },
        });
        console.log(`Cleaned up ${expiredReservations.length} expired seat reservations`);
      }

      const staleBookings = await Booking.find({
        status: "pending",
        createdAt: { $lt: new Date(Date.now() - 15 * 60 * 1000) },
      });

      for (const booking of staleBookings) {
        booking.status = "cancelled";
        await booking.save();

        await SeatReservation.deleteMany({ booking: booking._id });

        const showtime = await Showtime.findById(booking.showtime);
        if (showtime) {
          showtime.bookedSeats -= booking.selectedSeats.length;
          showtime.availableSeats = showtime.totalCapacity - showtime.bookedSeats;
          await showtime.save();
        }
      }

      if (staleBookings.length > 0) {
        console.log(`Auto-cancelled ${staleBookings.length} stale pending bookings`);
      }

      const reviewPrompts = await notifyReviewRequests();
      if (reviewPrompts > 0) {
        console.log(`Sent ${reviewPrompts} review request notifications`);
      }
    } catch (error) {
      console.error("Cleanup job error:", error);
    }
  });

  console.log("Cleanup jobs started");
};
