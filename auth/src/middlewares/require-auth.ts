import { Request, Response, NextFunction } from "express";
import { NotAuthorizedError } from "../errors/not-authorized-error";

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // We assume that the middleware currentUser is run before this middleware
  if (!req.currentUser) {
    throw new NotAuthorizedError();
  }

  // Assure that if there is a currentUser (user signedin), call the next middleware
  next();
};
