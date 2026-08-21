import { NextFunction, Request, Response } from "express";
import { randomUUID } from "crypto";
import { log } from "@/common/logging/logger";

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const startedAt = performance.now();
  const requestId = req.header("x-request-id") ?? randomUUID();
  res.setHeader("x-request-id", requestId);

  res.on("finish", () => {
    log(res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info", "http_request", {
      requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs: Math.round(performance.now() - startedAt),
      ip: req.ip,
      userId: (req.user as { sub?: string } | undefined)?.sub,
    });
  });

  next();
}
