import { useEffect, useMemo, useState } from "react";
import { HiOutlineHeart, HiHeart } from "react-icons/hi";
import { toast } from "react-hot-toast";
import type { GithubRepo, Favorite } from "../types";
import { useFavorites } from "../hooks/useFavorites";
import { useAuth } from "../hooks/useAuth";
import { formatCount } from "../lib/format";
import Login from "../pages/Login";

interface Props {
  repo: GithubRepo;
}

// A small, stable set of colors so the same language always gets the
// same dot color across cards (purely cosmetic, mirrors GitHub's own
// language legend without needing the full palette).
const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Java: "#b07219",
  "C#": "#178600",
  "C++": "#f34b7d",
  C: "#555555",
  Go: "#00ADD8",
  Rust: "#dea584",
  Ruby: "#701516",
  PHP: "#4F5D95",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Shell: "#89e051",
};

function languageColor(lang?: string | null) {
  if (!lang) return "#94a3b8";
  return LANGUAGE_COLORS[lang] ?? "#6366f1";
}

export default function RepoCard({ repo }: Props) {
  const { favorites, addFavorite, deleteFavorite } = useFavorites();
  const { user } = useAuth();

  const [busy, setBusy] = useState(false);
  const [optimistic, setOptimistic] = useState<boolean | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Find the favorite row if it exists
  const favRow = useMemo<Favorite | undefined>(
    () => favorites?.find((f) => String(f.repo_id) === String(repo.id)),
    [favorites, repo.id]
  );

  // Final computed favorited state
  const favorited =
    optimistic ??
    repo.favorited ?? // merged from backend
    Boolean(favRow); // fallback from local favorites

  // Close the login modal automatically once the user is actually
  // logged in. Favorites refresh on their own via FavoritesProvider,
  // which reacts to the same auth state — no polling needed.
  useEffect(() => {
    if (user && showLoginModal) {
      setShowLoginModal(false);
      toast.success("Logged in");
    }
  }, [user, showLoginModal]);

  const handleFavorite = async () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    // -------- REMOVE FAVORITE --------
    if (favorited) {
      setBusy(true);
      setOptimistic(false);

      try {
        if (favRow?.id) {
          await deleteFavorite(String(favRow.id), false);
        } else {
          await deleteFavorite(String(repo.id), true);
        }
        toast.success("Removed from favorites");
      } catch {
        setOptimistic(true); // rollback UI
        toast.error("Failed removing favorite");
      } finally {
        setBusy(false);
      }
      return;
    }

    // -------- ADD FAVORITE --------
    const payload = {
      repo_id: repo.id,
      repo_name: repo.name,
      repo_full_name: repo.full_name,
      repo_html_url: repo.html_url,
      repo_description: repo.description ?? null,
      repo_stars: repo.stargazers_count ?? 0,
      repo_language: repo.language ?? null,
    };

    setBusy(true);
    setOptimistic(true);

    try {
      await addFavorite(payload);
      toast.success("Added to favorites");
    } catch {
      setOptimistic(false);
      toast.error("Failed adding favorite");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-900/5 hover:border-brand-200">
        <div className="flex items-start justify-between gap-3">
          <a
            href={repo.html_url}
            target="_blank"
            rel="noreferrer noopener"
            className="font-semibold text-slate-900 hover:text-brand-600 break-words leading-snug"
          >
            {repo.full_name}
          </a>
          <button
            onClick={handleFavorite}
            className="shrink-0 rounded-full p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500 disabled:opacity-50"
            aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
            disabled={busy}
          >
            {favorited ? (
              <HiHeart className="h-6 w-6 text-rose-500" />
            ) : (
              <HiOutlineHeart className="h-6 w-6" />
            )}
          </button>
        </div>

        <p className="mt-2 line-clamp-2 text-sm text-slate-500 flex-1">
          {repo.description ?? "No description provided."}
        </p>

        <div className="mt-4 flex items-center gap-4 text-xs font-medium text-slate-500">
          <span className="inline-flex items-center gap-1">
            <svg className="h-3.5 w-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.956a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.447a1 1 0 00-.363 1.118l1.287 3.955c.3.922-.755 1.688-1.538 1.118l-3.367-2.446a1 1 0 00-1.176 0l-3.367 2.446c-.783.57-1.838-.196-1.538-1.118l1.287-3.955a1 1 0 00-.363-1.118L2.063 9.383c-.783-.57-.38-1.81.588-1.81h4.163a1 1 0 00.95-.69l1.285-3.956z" />
            </svg>
            {formatCount(repo.stargazers_count)}
          </span>
          {repo.language && (
            <span className="inline-flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: languageColor(repo.language) }}
              />
              {repo.language}
            </span>
          )}
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          {/* backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setShowLoginModal(false)}
          />

          {/* modal card */}
          <div
            className="relative z-10 w-full max-w-md overflow-y-auto rounded-2xl bg-white shadow-2xl"
            style={{ maxHeight: "90vh" }}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <p className="text-sm font-medium text-slate-500">
                Log in to save favorites
              </p>
              <button
                aria-label="Close login"
                className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                onClick={() => setShowLoginModal(false)}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-8">
              <Login />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
