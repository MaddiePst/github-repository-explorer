import { useState } from "react";
import type { AxiosError } from "axios";
import client from "../api/client";
import SearchForm from "../components/SearchForm";
import RepoList from "../components/RepoList";
import RepoCardSkeleton from "../components/RepoCardSkeleton";
import EmptyState from "../components/EmptyState";
import type { GithubRepo, SearchMode } from "../types";

type Status = "idle" | "loading" | "success" | "error";

export default function Home() {
  const [mode, setMode] = useState<SearchMode>("user");
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState<string | null>(null);

  async function handleSearch(query: string) {
    setStatus("loading");
    setError(null);
    setLastQuery(query);

    try {
      const res =
        mode === "user"
          ? await client.get("/repo/active", { params: { username: query } })
          : await client.get("/repo/search", { params: { query } });

      setRepos(res.data.repos || []);
      setStatus("success");
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      const fallback =
        mode === "user"
          ? axiosErr.response?.status === 404
            ? `No GitHub user found for "${query}"`
            : "Something went wrong while fetching repositories. Please try again."
          : "Something went wrong while searching repositories. Please try again.";
      setError(axiosErr.response?.data?.message || fallback);
      setRepos([]);
      setStatus("error");
    }
  }

  function handleModeChange(next: SearchMode) {
    setMode(next);
    setStatus("idle");
    setError(null);
    setRepos([]);
    setLastQuery(null);
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900">
          Explore GitHub repositories
        </h1>
        <p className="mt-2.5 text-slate-500 max-w-xl mx-auto">
          Search by GitHub username to browse someone's repos, or search
          repositories directly by name or topic — then save the ones you
          like to your favorites.
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <SearchForm
          mode={mode}
          onModeChange={handleModeChange}
          onSearch={handleSearch}
          loading={status === "loading"}
        />
      </div>

      <div className="mt-10">
        {status === "idle" && (
          <EmptyState
            icon="🔍"
            title="Search to get started"
            description={
              mode === "user"
                ? 'Try a username like "octocat" or your own GitHub handle.'
                : 'Try a repository search like "react state management".'
            }
          />
        )}

        {status === "loading" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <RepoCardSkeleton key={i} />
            ))}
          </div>
        )}

        {status === "error" && (
          <EmptyState
            icon="⚠️"
            title="Couldn't load repositories"
            description={error ?? undefined}
          />
        )}

        {status === "success" && repos.length === 0 && (
          <EmptyState
            icon="📭"
            title="No repositories found"
            description={
              mode === "user"
                ? `${lastQuery} doesn't have any public repositories yet.`
                : `No repositories matched "${lastQuery}".`
            }
          />
        )}

        {status === "success" && repos.length > 0 && (
          <>
            <p className="mb-4 text-sm font-medium text-slate-500">
              {repos.length} {repos.length === 1 ? "repository" : "repositories"} found
              {mode === "user" ? (
                <>
                  {" "}for <span className="text-slate-700">{lastQuery}</span>
                </>
              ) : (
                <>
                  {" "}for "<span className="text-slate-700">{lastQuery}</span>"
                </>
              )}
            </p>
            <RepoList repos={repos} />
          </>
        )}
      </div>
    </div>
  );
}
