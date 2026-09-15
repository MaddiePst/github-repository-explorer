import { Router } from "express";
import {
  getFavorites,
  addFavorite,
  deleteFavorite,
  getReposAndFav,
  searchRepos,
} from "../Controllers/repoController";
import { authMiddleware } from "../Middleware/authMiddleware";

const router = Router();

// Public routes (authMiddleware attaches req.user if a token is
// present, but doesn't require one — logged-out visitors still get
// results, just without favorited status merged in)
router.get("/active", authMiddleware, getReposAndFav);
router.get("/search", authMiddleware, searchRepos);

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
