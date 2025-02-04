import { Request, Response, NextFunction } from "express";
import { User } from "@prisma/client";

declare module "express-serve-static-core" {
  interface Request {
    user?: User;
  }
}

export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.isAuthenticated() && req.user) {
    return next();
  }
  res.status(401).json({responseCode: 0, message: "Unauthorized" });
};