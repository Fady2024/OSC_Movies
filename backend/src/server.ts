import "dotenv/config";
import http from "http";
import app from "./app";
import { connectDB } from "./config/database";
import { env } from "./config/env";
import { startCleanupJobs } from "@/common/jobs/cleanup";
import { closeLogger, initializeLogger, log } from "@/common/logging/logger";
import { initSocket } from "@/socket/io";

const start = async () => {
  try {
    await connectDB();
    await initializeLogger();
    startCleanupJobs();

    const server = http.createServer(app);
    initSocket(server);

    // Prevent crashes from aborted client connections
    server.on("connection", (socket) => {
      socket.on("error", () => {});
    });

    server.listen(env.PORT, () => {
      log("info", "server_started", { port: env.PORT, environment: env.NODE_ENV });
      console.log(`Environment: ${env.NODE_ENV}`);
      console.log(`API docs: http://localhost:${env.PORT}/api/docs`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

process.on("unhandledRejection", (err) => {
  log("error", "unhandled_rejection", { error: String(err) });
  process.exit(1);
});

process.on("SIGTERM", () => {
  void closeLogger().finally(() => process.exit(0));
});

start();
