"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFavorites = getFavorites;
exports.addFavorite = addFavorite;
exports.deleteFavorite = deleteFavorite;
exports.getReposAndFav = getReposAndFav;
const supabaseClient_1 = require("../Connections/supabaseClient");
const axios_1 = __importDefault(require("axios"));
// GET /repo/favorites
async function getFavorites(req, res) {
    try {
        //if authMiddleware didn’t populate req.user
        if (!req.user)
            return res.status(401).json({ message: "Unauthorized" });
        // Extract the authenticated user's ID from DB.
        const userId = req.user.id;
        // Calls Supabase to fetch rows from the favorites table
        const { data, error } = await supabaseClient_1.supabase
            .from("favorites")
            .select("*")
            .eq("user_id", userId);
        // If Supabase returned an error
        if (error) {
            console.error(error);
            return res.status(500).json({ message: "DB error" });
        }
        return res.json(data);
    }
    catch (err) {
        console.error("getFavorites error:", err);
        return res.status(500).json({ message: "Server error" });
    }
}
// POST /repo/favorites
async function addFavorite(req, res) {
    try {
        if (!req.user)
            return res.status(401).json({ message: "Unauthorized" });
        const userId = req.user.id;
        const payload = req.body || {};
        const repo_id = payload.repo_id;
        if (!repo_id)
            return res.status(400).json({ message: "repo_id is required" });
        // normalize / cast types
        const repoIdNum = typeof repo_id === "string" && /^\d+$/.test(repo_id)
            ? Number(repo_id)
            : repo_id;
        // Builds an insertRow object to insert into the DB
        const insertRow = {
            user_id: userId,
            repo_id: repoIdNum,
            repo_name: payload.repo_name ?? null,
            repo_full_name: payload.repo_full_name ?? null,
            repo_html_url: payload.repo_html_url ?? null,
            repo_description: payload.repo_description ?? null,
            repo_stars: payload.repo_stars != null ? Number(payload.repo_stars) : null,
            repo_language: payload.repo_language ?? null,
        };
        // check if already saved (use maybeSingle so we don't throw if no rows)
        const { data: existing, error: existErr } = await supabaseClient_1.supabase
            .from("favorites")
            .select("*")
            .eq("user_id", userId)
            .eq("repo_id", repoIdNum)
            // Uses maybeSingle() (Supabase helper) which returns null when no row found instead of throwing
            .maybeSingle();
        if (existErr) {
            console.error("Error checking existing favorite:", existErr);
            // don't reveal DB internals to client
            return res.status(500).json({ message: "Database error" });
        }
        if (existing) {
            // already saved -> return existing row (200 OK)
            return res.status(200).json(existing);
        }
        // otherwise insert and return created
        const { data: created, error: insertErr } = await supabaseClient_1.supabase
            .from("favorites")
            .insert([insertRow])
            .select()
            .single();
        if (insertErr) {
            console.error("favorites insert error:", insertErr);
            return res.status(500).json({ message: "Insert failed" });
        }
        // return inserted row
        return res.status(201).json(created);
    }
    catch (err) {
        console.error("addFavorite error:", err);
        return res
            .status(500)
            .json({ message: "Server error", details: String(err) });
    }
}
// DELETE /repo/favorites?repo_id=xxxx   OR   /repo/favorites/:id
async function deleteFavorite(req, res) {
    try {
        if (!req.user)
            return res.status(401).json({ message: "Unauthorized" });
        // 1️. If repo_id exists in the query: delete by repo_id
        if (req.query.repo_id) {
            const repoId = String(req.query.repo_id);
            const { error } = await supabaseClient_1.supabase
                .from("favorites")
                .delete()
                .eq("repo_id", repoId)
                .eq("user_id", req.user.id);
            if (error) {
                console.error(error);
                return res.status(500).json({ message: "Delete failed" });
            }
            return res.json({ message: "Deleted by repo_id" });
        }
        // 2️. Otherwise, fallback to deleting by actual row id
        const id = req.params.id;
        if (!id)
            return res.status(400).json({ message: "Missing id" });
        const { data: existing, error: selErr } = await supabaseClient_1.supabase
            .from("favorites")
            .select("id, user_id")
            .eq("id", id)
            .limit(1)
            .single();
        if (selErr || !existing)
            return res.status(404).json({ message: "Not found" });
        if (existing.user_id !== req.user.id)
            return res.status(403).json({ message: "Forbidden" });
        const { error } = await supabaseClient_1.supabase.from("favorites").delete().eq("id", id);
        if (error)
            return res.status(500).json({ message: "Delete failed" });
        return res.json({ message: "Deleted by id" });
    }
    catch (err) {
        console.error("deleteFavorite error:", err);
        return res.status(500).json({ message: "Server error" });
    }
}
// GET /repo/active?username=USERNAME
async function getReposAndFav(req, res) {
    try {
        const username = req.query.username;
        if (!username) {
            return res.status(400).json({ message: "Missing username" });
        }
        // 1. GitHub repos
        const ghRes = await axios_1.default.get(`https://api.github.com/users/${username}/repos`);
        const repos = ghRes.data;
        // If not logged in → return GH repos only
        if (!req.user) {
            return res.json({ repos });
        }
        // 2. Get user's favorites
        const { data: favs, error } = await supabaseClient_1.supabase
            .from("favorites")
            .select("*")
            .eq("user_id", req.user.id);
        if (error) {
            console.error(error);
            return res.status(500).json({ message: "DB error" });
        }
        // 3. Merge GitHub repos with favorites
        const favoriteRepoIds = new Set(favs.map((f) => String(f.repo_id).trim()));
        const merged = repos.map((repo) => ({
            ...repo,
            favorited: favoriteRepoIds.has(String(repo.id)),
        }));
        return res.json({ repos: merged });
    }
    catch (err) {
        console.error("getReposAndFav error:", err);
        return res.status(500).json({ message: "Server error" });
    }
}
//# sourceMappingURL=repoController.js.map