import { useCallback, useEffect, useState } from "react";
import client from "../api/client";
import type { Favorite, CreateFavoritePayload } from "../types";

export function useFavorites() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(false);

  /** -------------------------
   *  Fetch favorites
   -------------------------- */

  const fetchFavorites = useCallback(async () => {
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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) fetchFavorites();
  }, [fetchFavorites]);

  /** -------------------------
   *  Add favorite
   -------------------------- */
  const addFavorite = useCallback(async (payload: CreateFavoritePayload) => {
    const res = await client.post("/repo/favorites", payload);
    const created = res.data;
    setFavorites((prev) => [...prev, created]);
    return created;
  }, []);

  /** -------------------------
   *  Delete favorite
   -------------------------- */
  const deleteFavorite = useCallback(
    async (idOrRepoId: string, isRepoId = false) => {
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

  return {
    favorites,
    loading,
    addFavorite,
    deleteFavorite,
    fetchFavorites,
  };
}
