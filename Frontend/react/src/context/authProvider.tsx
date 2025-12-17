// src/context/authProvider.tsx
import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import client from "../api/client";
import { useFavorites } from "../hooks/useFavorites";
import {
  AuthContext,
  type AuthContextValue,
  type User,
  // type RegisterPayload,
} from "./AuthContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });

  // const { user } = useAuth(); // your auth hook/context
  const { fetchFavorites } = useFavorites();

  useEffect(() => {
    if (user) fetchFavorites();
  }, [user, fetchFavorites]);

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
