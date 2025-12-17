// createContext function which is used to create a Context object. Context lets you pass data (like auth state and functions)
import { createContext } from "react";
// import type { ReactNode } from "react";
// import type client from "../api/client";

export type User = { id?: string; email?: string; name?: string } | null;

export interface RegisterPayload {
  name?: string;
  email: string;
  password: string;
}

export interface AuthContextValue {
  user: User;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);
