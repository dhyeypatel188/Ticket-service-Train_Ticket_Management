import { Request, Response, NextFunction } from "express";
import { CustomException } from "../exception/custom.exception";
import { UserRole } from "../Interface/user.interface";

export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== UserRole.ADMIN) {
    throw new CustomException(403, "Admin access required");
  }
  next();
};
