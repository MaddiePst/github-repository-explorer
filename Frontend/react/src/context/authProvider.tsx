// src/context/authProvider.tsx
//
// Note: this used to also kick off fetchFavorites() here. That logic
// now lives in FavoritesProvider itself (it watches useAuth().user), so
// auth and favorites stay decoupled — this provider only knows about
// the logged-in user.
import { useState } from "react";
import type { ReactNode } from "react";
import client from "../api/client";
import {
  AuthContext,
  type AuthContextValue,
  type User,
} from "./AuthContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });

  const login: AuthContextValue["login"] = async (email, password) => {
    const res = await client.post("/auth/login", { email, password });
    const { token, user: u } = res.data;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(u));
    setUser(u);
  };

  const register: AuthContextValue["register"] = async (payload) => {
    const res = await client.post("/auth/register", payload);
    const { token, user: u } = res.data;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(u));
    setUser(u);
  };

  const logout: AuthContextValue["logout"] = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
