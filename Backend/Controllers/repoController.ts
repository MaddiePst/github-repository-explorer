// Controllers/userController.ts
import { Response } from "express";
import { supabase } from "../Connections/supabaseClient";
import { AuthRequest } from "../Middleware/authMiddleware";
import axios from "axios";

// Shared headers for every GitHub REST call.
// Optional: set GITHUB_TOKEN in .env to raise GitHub's unauthenticated
// rate limit (60/hr for normal endpoints, 10/min for search) up to
// 5,000/hr and 30/min respectively.
function githubHeaders() {
  return {
    Accept: "application/vnd.github+json",
    ...(process.env.GITHUB_TOKEN
      ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
      : {}),
  };
}

// Translates a GitHub API error into the right HTTP response. Returns
// true if it handled (and responded to) the error, false otherwise.
function respondToGithubError(
  res: Response,
  err: any,
  notFoundMessage: string
): boolean {
  const status = err?.response?.status;
  if (status === 404) {
    res.status(404).json({ message: notFoundMessage });
    return true;
  }
  if (status === 422) {
    res.status(400).json({ message: "Invalid search query" });
    return true;
  }
  if (
    status === 403 &&
    err?.response?.headers?.["x-ratelimit-remaining"] === "0"
  ) {
    res.status(429).json({
      message: "GitHub API rate limit exceeded. Please try again later.",
    });
    return true;
  }
  console.error("GitHub API error:", err?.response?.data || err);
  res.status(502).json({ message: "GitHub API error" });
  return true;
}

// Merges a list of GitHub repo objects with the logged-in user's saved
// favorites, tagging each repo with `favorited: boolean`. Shared by
// both the per-user repo listing and the repository search endpoint.
async function mergeWithFavorites(repos: any[], userId: string) {
  const { data: favs, error } = await supabase
    .from("favorites")
    .select("*")
    .eq("user_id", userId);

  if (error) throw error;

  const favoriteRepoIds = new Set(
    (favs || []).map((f: any) => String(f.repo_id).trim())
  );

  return repos.map((repo: any) => ({
    ...repo,
    favorited: favoriteRepoIds.has(String(repo.id)),
  }));
}

// GET /repo/favorites
export async function getFavorites(req: AuthRequest, res: Response) {
  try {
    //if authMiddleware didn’t populate req.user
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    // Extract the authenticated user's ID from DB.
    const userId = req.user.id;

    // Calls Supabase to fetch rows from the favorites table
    const { data, error } = await supabase
      .from("favorites")
      .select("*")
      .eq("user_id", userId);

    // If Supabase returned an error
    if (error) {
      console.error(error);
      return res.status(500).json({ message: "DB error" });
    }
    return res.json(data);
  } catch (err) {
    console.error("getFavorites error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// POST /repo/favorites
export async function addFavorite(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const userId = req.user.id;
    const payload = req.body || {};

    const repo_id = payload.repo_id;
    if (!repo_id)
      return res.status(400).json({ message: "repo_id is required" });

    // normalize / cast types
    const repoIdNum =
      typeof repo_id === "string" && /^\d+$/.test(repo_id)
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
      repo_stars:
        payload.repo_stars != null ? Number(payload.repo_stars) : null,
      repo_language: payload.repo_language ?? null,
    };

    // check if already saved (use maybeSingle so we don't throw if no rows)
    const { data: existing, error: existErr } = await supabase
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
    const { data: created, error: insertErr } = await supabase
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
  } catch (err) {
    console.error("addFavorite error:", err);
    return res
      .status(500)
      .json({ message: "Server error", details: String(err) });
  }
}

// DELETE /repo/favorites?repo_id=xxxx   OR   /repo/favorites/:id
export async function deleteFavorite(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    // 1️. If repo_id exists in the query: delete by repo_id
    if (req.query.repo_id) {
      const repoId = String(req.query.repo_id);

      const { error } = await supabase
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
    if (!id) return res.status(400).json({ message: "Missing id" });

    const { data: existing, error: selErr } = await supabase
      .from("favorites")
      .select("id, user_id")
      .eq("id", id)
      .limit(1)
      .single();

    if (selErr || !existing)
      return res.status(404).json({ message: "Not found" });

    if (existing.user_id !== req.user.id)
      return res.status(403).json({ message: "Forbidden" });

    const { error } = await supabase.from("favorites").delete().eq("id", id);

    if (error) return res.status(500).json({ message: "Delete failed" });

    return res.json({ message: "Deleted by id" });
  } catch (err) {
    console.error("deleteFavorite error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// GET /repo/active?username=USERNAME
// Lists a specific GitHub user's public repositories.
export async function getReposAndFav(req: AuthRequest, res: Response) {
  try {
    const username = req.query.username as string;

    if (!username || !username.trim()) {
      return res.status(400).json({ message: "Missing username" });
    }

    let repos;
    try {
      const ghRes = await axios.get(
        `https://api.github.com/users/${encodeURIComponent(
          username.trim()
        )}/repos`,
        {
          params: { per_page: 100, sort: "updated" },
          headers: githubHeaders(),
        }
      );
      repos = ghRes.data;
    } catch (ghErr: any) {
      respondToGithubError(res, ghErr, "GitHub user not found");
      return;
    }

    // If not logged in → return GH repos only
    if (!req.user) {
      return res.json({ repos });
    }

    try {
      const merged = await mergeWithFavorites(repos, req.user.id);
      return res.json({ repos: merged });
    } catch (dbErr) {
      console.error(dbErr);
      return res.status(500).json({ message: "DB error" });
    }
  } catch (err) {
    console.error("getReposAndFav error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// GET /repo/search?query=KEYWORDS
// Full-text search across all of GitHub's public repositories (by
// name/description/topics), as opposed to getReposAndFav which only
// lists one specific user's repos.
export async function searchRepos(req: AuthRequest, res: Response) {
  try {
    const query = (req.query.query as string) || "";
    if (!query.trim()) {
      return res.status(400).json({ message: "Missing search query" });
    }

    let repos;
    try {
      const ghRes = await axios.get(
        "https://api.github.com/search/repositories",
        {
          params: { q: query.trim(), per_page: 30, sort: "stars", order: "desc" },
          headers: githubHeaders(),
        }
      );
      repos = ghRes.data.items || [];
    } catch (ghErr: any) {
      respondToGithubError(res, ghErr, "No repositories found");
      return;
    }

    if (!req.user) {
      return res.json({ repos });
    }

    try {
      const merged = await mergeWithFavorites(repos, req.user.id);
      return res.json({ repos: merged });
    } catch (dbErr) {
      console.error(dbErr);
      return res.status(500).json({ message: "DB error" });
    }
  } catch (err) {
    console.error("searchRepos error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
