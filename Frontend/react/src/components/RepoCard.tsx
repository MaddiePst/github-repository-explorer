import { useEffect, useMemo, useRef, useState } from "react";
import { HiOutlineHeart, HiHeart } from "react-icons/hi";
import { toast } from "react-hot-toast";
import type { GithubRepo, Favorite } from "../types";
import { useFavorites } from "../hooks/useFavorites";
import Login from "../pages/Login";

interface Props {
  repo: GithubRepo;
}

export default function RepoCard({ repo }: Props) {
  const { favorites, addFavorite, deleteFavorite, fetchFavorites } =
    useFavorites();

  const [busy, setBusy] = useState(false);
  const [optimistic, setOptimistic] = useState<boolean | null>(null);

  const [showLoginModal, setShowLoginModal] = useState(false);
  const modalContentRef = useRef<HTMLDivElement | null>(null);

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

  /** -------------------------------
   *  Handle modal auto-close on login
   * -------------------------------- */
  const handleLoginSuccess = async () => {
    setShowLoginModal(false);
    await fetchFavorites();
    toast.success("Logged in");
  };

  useEffect(() => {
    if (!showLoginModal) return;

    let active = true;

    const interval = setInterval(() => {
      const token = localStorage.getItem("token");
      if (active && token) handleLoginSuccess();
    }, 300);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [showLoginModal]);

  /** -------------------------------
   *  Favorite / Unfavorite
   * -------------------------------- */
  const handleFavorite = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
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
      } catch (err) {
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
    } catch (err: any) {
      setOptimistic(false);
      toast.error("Failed adding favorite");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="relative flex flex-col border rounded-xl p-5 shadow-lg hover:shadow-xl shadow-blue-800 transition-transform duration-300 ease-in-out hover:scale-105 hover:-translate-y-1 bg-gray-100">
        <div className="flex-1">
          <a
            href={repo.html_url}
            target="_blank"
            rel="noreferrer noopener"
            className="text-blue-800 font-semibold hover:underline text-lg break-words"
          >
            {repo.full_name}
          </a>
          <p className="text-sm text-gray-600 mt-2">
            {repo.description ?? "No description"}
          </p>
        </div>

        <div className="mt-3 flex items-center justify-between text-sm text-gray-800">
          <div>⭐ {repo.stargazers_count}</div>
          <div>{repo.language ?? "—"}</div>
        </div>

        <button
          onClick={handleFavorite}
          className="flex bottom-3 left-3 text-3xl text-gray-700 p-1 rounded"
          aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
          disabled={busy}
        >
          {favorited ? (
            <HiHeart className="text-red-500" />
          ) : (
            <HiOutlineHeart />
          )}
        </button>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div
          className="fixed inset-0 z-5 flex items-center justify-center px-auto"
          role="dialog"
          aria-modal="true"
        >
          {/* backdrop */}
          <div
            className="fixed inset-0 bg-black/60"
            onClick={() => setShowLoginModal(false)}
          />

          {/* modal card */}
          <div
            ref={modalContentRef}
            className="flex z-3 w-full max-w-lg bg-white rounded-lg shadow-2xl "
            style={{ maxHeight: "70vh", maxWidth: "60vh" }}
          >
            <div className="flex items-start px-3 py-3">
              <button
                aria-label="Close login"
                className="text-xl font-bold rounded-md hover:bg-gray-100"
                onClick={() => setShowLoginModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="px-15 -mt-40 items-start">
              <Login />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
