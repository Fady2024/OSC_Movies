import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import mongoose from "mongoose";
import { env } from "@/config/env";
import { AppError } from "@/common/errors/AppError";
import { log } from "@/common/logging/logger";

interface MongooseError extends Error {
  code?: number;
  path?: string;
  value?: any;
  keyPattern?: Record<string, number>;
  keyValue?: Record<string, any>;
}

const handleCastError = (error: MongooseError): AppError => {
  return new AppError(`Invalid ${error.path}: ${error.value}`, 400, "INVALID_ID");
};

const handleDuplicateKeyError = (error: MongooseError): AppError => {
  const field = Object.keys(error.keyValue ?? {})[0];
  const value = error.keyValue?.[field];
  return new AppError(
    `Duplicate value for field '${field}': '${value}'. Please use another value.`,
    409,
    "DUPLICATE_KEY"
  );
};

const handleValidationError = (error: mongoose.Error.ValidationError): AppError => {
  const messages = Object.values(error.errors).map((err) => err.message);
  return new AppError(`Validation failed: ${messages.join(". ")}`, 400, "VALIDATION_ERROR");
};

const formatError = (err: Error, statusCode: number, code: string) => ({
  success: false,
  message: err.message,
  code,
  ...(env.NODE_ENV === "development" && { stack: err.stack }),
});

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  log("error", "unhandled_error", {
    method: _req.method,
    path: _req.path,
    message: err.message,
    stack: err.stack,
  });
  if (err instanceof AppError) {
    res.status(err.statusCode).json(formatError(err, err.statusCode, err.code));
    return;
  }

  if (err instanceof mongoose.Error.CastError) {
    const appError = handleCastError(err as MongooseError);
    res.status(appError.statusCode).json(formatError(appError, appError.statusCode, appError.code));
    return;
  }

  if (
    err instanceof Error &&
    (err as MongooseError).code === 11000
  ) {
    const appError = handleDuplicateKeyError(err as MongooseError);
    res.status(appError.statusCode).json(formatError(appError, appError.statusCode, appError.code));
    return;
  }

  if (err instanceof mongoose.Error.ValidationError) {
    const appError = handleValidationError(err);
    res.status(appError.statusCode).json(formatError(appError, appError.statusCode, appError.code));
    return;
  }

  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    message:
      env.NODE_ENV === "production" ? "Internal server error" : err.message,
    code: "INTERNAL_ERROR",
  });
};
