// src/context/favoritesProvider.tsx
//
// Favorites used to live in a plain hook (useFavorites), which meant
// every component that called the hook got its OWN independent copy of
// the favorites list. RepoCard, the Favorites page, and AuthProvider
// each had their own state, so adding/removing a favorite in one place
// silently didn't show up anywhere else without a full page reload.
// This provider makes favorites shared, app-wide state instead —
// exactly like AuthProvider does for the logged-in user.
import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import client from "../api/client";
import { useAuth } from "../hooks/useAuth";
import type { Favorite } from "../types";
import {
  FavoritesContext,
  type FavoritesContextValue,
} from "./FavoritesContext";

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFavorites = useCallback(async () => {
    if (!localStorage.getItem("token")) {
      setFavorites([]);
      return;
    }
    try {
      setLoading(true);
      const res = await client.get("/repo/favorites");
      setFavorites(res.data || []);
    } catch (err) {
      console.error("fetchFavorites error:", err);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refetch whenever the logged-in user changes (login/logout).
  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      setFavorites([]);
    }
  }, [user, fetchFavorites]);

  const addFavorite: FavoritesContextValue["addFavorite"] = useCallback(
    async (payload) => {
      const res = await client.post("/repo/favorites", payload);
      const created = res.data;
      setFavorites((prev) => [...prev, created]);
      return created;
    },
    []
  );

  const deleteFavorite: FavoritesContextValue["deleteFavorite"] = useCallback(
    async (idOrRepoId, isRepoId = false) => {
      if (isRepoId) {
        await client.delete("/repo/favorites", {
          params: { repo_id: idOrRepoId },
        });
        setFavorites((prev) =>
          prev.filter((f) => String(f.repo_id) !== String(idOrRepoId))
        );
        return;
      }

      await client.delete(`/repo/favorites/${idOrRepoId}`);
      setFavorites((prev) =>
        prev.filter((f) => String(f.id) !== String(idOrRepoId))
      );
    },
    []
  );

  return (
    <FavoritesContext.Provider
      value={{ favorites, loading, addFavorite, deleteFavorite, fetchFavorites }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}
