import { useState } from "react";
import { toast } from "react-hot-toast";
import { useFavorites } from "../hooks/useFavorites";
import { useAuth } from "../hooks/useAuth";
import { formatCount } from "../lib/format";
import EmptyState from "../components/EmptyState";
import Spinner from "../components/Spinner";
import type { Favorite } from "../types";
import { Link } from "react-router-dom";

export default function Favorites() {
  const { user } = useAuth();
  const { favorites, loading, deleteFavorite } = useFavorites();
  const [removingId, setRemovingId] = useState<string | null>(null);

  async function handleDelete(f: Favorite) {
    setRemovingId(String(f.id));
    try {
      await deleteFavorite(String(f.id));
      toast.success("Removed from favorites");
    } catch {
      toast.error("Failed removing favorite");
    } finally {
      setRemovingId(null);
    }
  }

  if (!user) {
    return (
      <EmptyState
        icon="🔒"
        title="Log in to see your favorites"
        description="Your favorite repositories are saved to your account."
        action={
          <Link
            to="/login"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Log in
          </Link>
        }
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-500">
        <Spinner label="Loading favorites…" />
      </div>
    );
  }

  if (!favorites || favorites.length === 0) {
    return (
      <EmptyState
        icon="⭐"
        title="No favorites yet"
        description="Search for a GitHub user and tap the heart icon to save repos here."
        action={
          <Link
            to="/"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Browse repositories
          </Link>
        }
      />
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-display font-bold text-slate-900 mb-6">
        ⭐ Your favorites{" "}
        <span className="text-base font-medium text-slate-400">
          ({favorites.length})
        </span>
      </h2>

      <div className="space-y-3">
        {favorites.map((f) => (
          <div
            key={f.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
          >
            <div className="flex-1 min-w-0">
              <a
                href={f.repo_html_url ?? undefined}
                target="_blank"
                rel="noreferrer noopener"
                className="font-semibold text-slate-900 hover:text-brand-600 break-words"
              >
                {f.repo_full_name}
              </a>
              <p className="mt-1 text-sm text-slate-500 line-clamp-2">
                {f.repo_description ?? "No description"}
              </p>
              <div className="mt-1.5 flex items-center gap-3 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1">
                  ⭐ {formatCount(f.repo_stars)}
                </span>
                {f.repo_language && <span>{f.repo_language}</span>}
              </div>
            </div>

            <button
              onClick={() => handleDelete(f)}
              disabled={removingId === String(f.id)}
              className="shrink-0 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {removingId === String(f.id) ? "Removing…" : "Remove"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
