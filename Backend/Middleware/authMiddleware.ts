import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

/** Shape of user info stored in JWT */
interface JwtUser {
  id: string;
  email?: string;
}

/** Extend Express Request */
export interface AuthRequest extends Request {
  user?: JwtUser;
}

const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

export function authMiddleware(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  // No token → allow request but without user
  if (!authHeader) {
    req.user = undefined;
    return next();
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtUser;

    req.user = {
      id: decoded.id,
      email: decoded.email,
    };

    next();
  } catch (err) {
    console.warn("Invalid token:", err);
    req.user = undefined;
    next(); // still allow request
  }
}
