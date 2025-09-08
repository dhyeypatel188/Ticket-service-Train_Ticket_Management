import jwt from "jsonwebtoken";
import { IUser, UserRole } from "../Interface/user.interface";

const ACCESS_TOKEN_SECRET =
  process.env.ACCESS_TOKEN_SECRET === undefined ? "212": process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET === undefined ? "121": process.env.REFRESH_TOKEN_SECRET;
const ACCESS_TOKEN_EXPIRY = "1d";
const REFRESH_TOKEN_EXPIRY = "30d";

interface JwtPayload {
  userId: string; // Matches IUser's id (but required in token)
  name: string; // From IUser
  email: string; // From IUser
  role: UserRole; // Using the enum from IUser
  iat?: number; // Standard JWT issued at
  exp?: number; // Standard JWT expiration
}

export class TokenUtil {
  static generateAccessToken(user: IUser): string {
    return jwt.sign(
      {
        userId: user.id, // Note: user.id is optional in IUser but required here
        name: user.name,
        email: user.email,
        role: user.role,
      },
      ACCESS_TOKEN_SECRET,
      {
        expiresIn: ACCESS_TOKEN_EXPIRY,
      }
    );
  }

  static generateRefreshToken(user: IUser): string {
    return jwt.sign(
      {
        userId: user.id, // Note: user.id is optional in IUser but required here
        name: user.name,
        email: user.email,
        role: user.role,
      },
      REFRESH_TOKEN_SECRET,
      {
        expiresIn: REFRESH_TOKEN_EXPIRY,
      }
    );
  }

  static verifyAccessToken(token: string): any {
    console.log(process.env.ACCESS_TOKEN_SECRET)
    console.log(ACCESS_TOKEN_SECRET)
    return jwt.verify(token, ACCESS_TOKEN_SECRET);
  }

  static verifyRefreshToken(token: string): any {
    return jwt.verify(token, REFRESH_TOKEN_SECRET);
  }
}
