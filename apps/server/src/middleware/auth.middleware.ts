import { Request, Response, NextFunction } from "express";
// import { User } from '@prisma/client';

interface User {
    id: number; // Assuming `id` is a string, change to `number` if needed
  }
  
  interface AuthenticatedRequest extends Request {
    user?: User; // Make `user` optional
  }
export const isAuthenticated = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({responseCode: 0, message: "Unauthorized" });
};