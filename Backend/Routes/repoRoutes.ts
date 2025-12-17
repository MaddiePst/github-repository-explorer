import { Router } from "express";
import {
  getFavorites,
  addFavorite,
  deleteFavorite,
  getReposAndFav,
} from "../Controllers/repoController";
import { authMiddleware } from "../Middleware/authMiddleware";

const router = Router();

// Public route
router.get("/active", authMiddleware, getReposAndFav);

// Protect routes below
router.use(authMiddleware);

// GET favorites
router.get("/favorites", getFavorites);

// POST favorites
router.post("/favorites", addFavorite);

// DELETE by repo_id (query)
router.delete("/favorites", deleteFavorite); // <-- ADD THIS

// DELETE by favorite row ID
router.delete("/favorites/:id", deleteFavorite);

export default router;
