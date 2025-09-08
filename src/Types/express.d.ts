// src/types/express.d.ts
import { IUser } from "../interfaces/user.interface";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        name: string;
        email: string;
        role: string;
      };
    }
  }
}
