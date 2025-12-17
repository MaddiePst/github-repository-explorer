import { useFavorites } from "../hooks/useFavorites";
import type { Favorite } from "../types";

export default function Favorites() {
  const { favorites, isLoading, deleteFavorite } = useFavorites();

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading favorites...
      </div>
    );
  if (!favorites || favorites.length === 0)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        No favorites yet
      </div>
    );

  return (
    <div className="min-h-screen py-10 px-4 bg-gray-50">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl p-6 shadow">
        <h2 className="text-2xl font-bold mb-6 text-center">
          ⭐ Your Favorites
        </h2>

        <div className="space-y-4">
          {favorites.map((f: Favorite) => (
            <div
              key={f.id}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center border border-gray-200 rounded-xl p-4 hover:shadow-md transition"
            >
              <div className="flex-1">
                <a
                  href={f.repo_html_url ?? undefined}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 font-semibold hover:underline break-words"
                >
                  {f.repo_full_name}
                </a>
                <p className="text-gray-600 mt-1 text-sm">
                  {f.repo_description ?? "No description"}
                </p>
                <div className="text-yellow-500 mt-1 text-sm">
                  ⭐ {f.repo_stars}
                </div>
              </div>

              <button
                onClick={() => deleteFavorite(String(f.id))}
                className="mt-3 sm:mt-0 sm:ml-4 bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
