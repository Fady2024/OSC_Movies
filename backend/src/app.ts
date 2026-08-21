import express from "express";
import { Router } from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import { env } from "@/config/env";
import { setupSwagger } from "@/config/swagger";
import { errorHandler } from "@/common/middleware/error.middleware";
import authRoutes from "@/modules/auth/auth.routes";
import movieRoutes from "@/modules/movies/movie.routes";
import showtimeRoutes from "@/modules/showtimes/showtime.routes";
import bookingRoutes from "@/modules/bookings/booking.routes";
import adminRoutes from "@/modules/admin/admin.routes";
import paymentRoutes from "@/modules/payments/payment.routes";
import emailRoutes from "@/modules/emails/email.routes";
import favoriteRoutes from "@/modules/favorites/favorite.routes";
import notificationRoutes from "@/modules/notifications/notification.routes";
import reviewRoutes from "@/modules/reviews/review.routes";
import { asyncHandler } from "@/common/middleware/asyncHandler";
import * as paymentController from "@/modules/payments/payment.controller";
import { requestLogger } from "@/common/middleware/request-logger.middleware";
import { deprecatedApi } from "@/common/middleware/deprecated.middleware";
import { auditContext } from "@/common/middleware/audit-context.middleware";
import healthRoutes from "@/modules/health/health.routes";

const app = express();

app.use(helmet());
app.use(cors());
app.use(requestLogger);
app.use(auditContext);

// Health 
app.use("/health", healthRoutes);
app.use("/api/health", healthRoutes);

// Stripe webhook 
const rawWebhook = express.raw({ type: "application/json" });
app.post(
  "/api/payments/webhook",
  rawWebhook,
  asyncHandler(paymentController.webhook)
);
app.post(
  "/api/v1/payments/webhook",
  rawWebhook,
  asyncHandler(paymentController.webhook)
);

app.use(express.json({ limit: "10mb" }));

app.use(
  morgan(env.NODE_ENV === "production" ? "combined" : "dev")
);

// Versioned API (v1)
const v1Api = Router();
v1Api.use("/auth", authRoutes);
v1Api.use("/movies", movieRoutes);
v1Api.use("/showtimes", showtimeRoutes);
v1Api.use("/bookings", bookingRoutes);
v1Api.use("/payments", paymentRoutes);
v1Api.use("/emails", emailRoutes);
v1Api.use("/admin", adminRoutes);
v1Api.use("/favorites", favoriteRoutes);
v1Api.use("/notifications", notificationRoutes);
v1Api.use("/", reviewRoutes);
v1Api.use("/health", healthRoutes);

app.use("/api/v1", v1Api);

// deprecated
const legacyApi = Router();
legacyApi.use(deprecatedApi);
legacyApi.use(v1Api);
app.use("/api", legacyApi);

setupSwagger(app);

app.use(errorHandler);

export default app;