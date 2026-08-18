import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "@/config/env";
import { AuthPayload } from "@/common/types";
import { setCurrentUser } from "@/common/mongoose";

export type { AuthPayload };

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const header = req.headers.authorization;
  console.log('Auth middleware - Authorization header:', header ? 'Present' : 'Missing');
  
  if (!header || !header.startsWith("Bearer ")) {
    console.log('Auth middleware - Invalid header format');
    return res.status(401).json({ 
      success: false, 
      message: "Missing or invalid authorization header" 
    });
  }

  const token = header.split(" ")[1];
  console.log('Auth middleware - Token extracted:', token ? 'Present' : 'Missing');

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
    console.log('Auth middleware - Token decoded successfully:', decoded.sub);
    req.user = decoded;
    setCurrentUser(decoded);
    next();
  } catch (error) {
    console.error('Auth middleware - Token verification failed:', error);
    return res.status(401).json({ 
      success: false, 
      message: "Invalid or expired token" 
    });
  }
};

export const authenticate = authMiddleware;
