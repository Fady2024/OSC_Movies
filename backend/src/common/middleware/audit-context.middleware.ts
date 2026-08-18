import { Request, Response, NextFunction } from "express";
import { runWithContext, RequestContext } from "@/common/mongoose";

/**
 * Opens the request-scoped context for every request so the audit plugin can
 * resolve the acting user (set later by `authMiddleware`) without threading it
 * through controllers and services.
 */
export const auditContext = (
  _req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const context: RequestContext = {};
  runWithContext(context, next);
};