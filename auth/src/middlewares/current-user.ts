import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface UserPayload {
  id: string;
  email: string;
}

declare global {
  // We tell TS that search in the express module
  namespace Express {
    // That interface Request can have currentUser
    interface Request {
      currentUser?: UserPayload;
    }
  }
}

export const currentUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Equals to: !req.session && !req.session.jwt
  if (!req.session?.jwt) {
    return next();
  }

  try {
    const payload: UserPayload = jwt.verify(
      req.session.jwt,
      process.env.JWT_KEY!
    ) as UserPayload;
    req.currentUser = payload;
  } catch (error) {}

  next();
};
