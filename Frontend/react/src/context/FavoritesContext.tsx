import { createContext } from "react";
import type { Favorite, CreateFavoritePayload } from "../types";

export interface FavoritesContextValue {
  favorites: Favorite[];
  loading: boolean;
  addFavorite: (payload: CreateFavoritePayload) => Promise<Favorite>;
  deleteFavorite: (idOrRepoId: string, isRepoId?: boolean) => Promise<void>;
  fetchFavorites: () => Promise<void>;
}

export const FavoritesContext = createContext<FavoritesContextValue | undefined>(
  undefined
);
