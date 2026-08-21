import { Request, Response, NextFunction, RequestHandler } from "express";

export const authorize = (...roles: string[]): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Access denied. Authentication required.",
        code: "NOT_AUTHENTICATED",
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: "Access denied. Insufficient permissions.",
        code: "FORBIDDEN",
      });
      return;
    }

    next();
  };
};
