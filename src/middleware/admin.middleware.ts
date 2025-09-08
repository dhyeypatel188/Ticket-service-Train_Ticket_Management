import { Request, Response, NextFunction } from "express";
import { TokenUtil } from "../utils/token.utils";
import { CustomException } from "../exception/custom.exception";
import { CustomRequest } from "../Interface/custom.request";
import jwt from "jsonwebtoken";

export const adminOnly = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new CustomException(401, "Authorization token is required");
    }

    const token = authHeader.split(" ")[1];

    // Verify token and check role
    let decoded;
    try {
      decoded = TokenUtil.verifyAccessToken(token);
    } catch (error) {
      // Handle JWT verification errors specifically
      console.log(error);
      if (error instanceof jwt.JsonWebTokenError) {
        throw new CustomException(401, "Invalid token", error.message);
      }
      throw error; // Re-throw other errors
    }

    if (decoded.role !== "admin") {
      throw new CustomException(403, "Admin access required");
    }

    // Attach user to request for downstream use
    req.user = {
      id: decoded.userId,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error instanceof CustomException) {
      // Send the formatted response from CustomException
      res
        .status(error.response.responseStatusList.statusList[0].statusCode)
        .json(error.response);
    } else {
      // Convert unexpected errors to CustomException format
      const customError = CustomException.fromError(error as Error);
      res.status(500).json(customError.response);
    }
  }
};
