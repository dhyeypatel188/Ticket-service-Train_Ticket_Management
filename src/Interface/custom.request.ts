// src/interfaces/custom-request.interface.ts
import { Request } from "express";

export interface CustomRequest extends Request {
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}
