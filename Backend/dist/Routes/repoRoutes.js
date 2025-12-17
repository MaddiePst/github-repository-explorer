"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const repoController_1 = require("../Controllers/repoController");
const authMiddleware_1 = require("../Middleware/authMiddleware");
const router = (0, express_1.Router)();
// Public route
router.get("/active", authMiddleware_1.authMiddleware, repoController_1.getReposAndFav);
// Protect routes below
router.use(authMiddleware_1.authMiddleware);
// GET favorites
router.get("/favorites", repoController_1.getFavorites);
// POST favorites
router.post("/favorites", repoController_1.addFavorite);
// DELETE by repo_id (query)
router.delete("/favorites", repoController_1.deleteFavorite); // <-- ADD THIS
// DELETE by favorite row ID
router.delete("/favorites/:id", repoController_1.deleteFavorite);
exports.default = router;
//# sourceMappingURL=repoRoutes.js.map