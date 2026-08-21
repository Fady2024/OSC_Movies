import { Server as HttpServer } from "http";
import { Server as SocketServer, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "@/config/env";
import { log } from "@/common/logging/logger";

let io: SocketServer | null = null;

interface SocketData {
  userId: string;
  role?: string;
}

export const ADMIN_ROOM = "admins";
const showtimeRoom = (id: string) => `showtime:${id}`;

function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return true;
  if (origin === env.CLIENT_URL) return true;
  return /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
}

export function initSocket(httpServer: HttpServer): SocketServer {
  io = new SocketServer(httpServer, {
    cors: {
      origin: (origin: string | undefined, callback: (err: Error | null, allow: boolean) => void) => {
        callback(null, isAllowedOrigin(origin));
      },
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) {
      return next(new Error("Unauthorized"));
    }
    try {
      const payload = jwt.verify(token, env.JWT_SECRET) as { sub: string; role?: string };
      socket.data.userId = payload.sub;
      socket.data.role = payload.role;
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const userId = socket.data.userId as string;
    const role = socket.data.role;
    socket.join(`user:${userId}`);
    if (role === "admin") {
      socket.join(ADMIN_ROOM);
    }
    log("info", "socket_connected", { userId, role });

    socket.on("showtime:join", (showtimeId: string) => {
      if (typeof showtimeId === "string" && showtimeId) {
        socket.join(showtimeRoom(showtimeId));
      }
    });

    socket.on("showtime:leave", (showtimeId: string) => {
      if (typeof showtimeId === "string" && showtimeId) {
        socket.leave(showtimeRoom(showtimeId));
      }
    });

    socket.on("disconnect", () => {
      log("info", "socket_disconnected", { userId });
    });
  });

  return io;
}

export function getIO(): SocketServer | null {
  return io;
}

export function emitToUser(userId: string, event: string, payload: unknown): void {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, payload);
}

export function emitToShowtime(showtimeId: string, event: string, payload: unknown): void {
  if (!io) return;
  io.to(showtimeRoom(showtimeId)).emit(event, payload);
}

export function emitToAdmins(event: string, payload: unknown): void {
  if (!io) return;
  io.to(ADMIN_ROOM).emit(event, payload);
}