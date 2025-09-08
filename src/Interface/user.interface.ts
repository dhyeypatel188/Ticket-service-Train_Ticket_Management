export enum UserRole {
  USER = "user",
  ADMIN = "admin",
}

export interface IUser {
  id?: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  created_at?: Date;
  updated_at?: Date;
}
