import { NextFunction, Request, Response } from "express";

const API_SUNSET_DATE = "Tue, 01 Aug 2027 00:00:00 GMT";

export function deprecatedApi(req: Request, res: Response, next: NextFunction): void {
  res.set("Deprecation", "true");
  res.set("Sunset", API_SUNSET_DATE);
  next();
}