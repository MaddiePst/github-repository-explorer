import { useState } from "react";
import type { FormEvent } from "react";
import Spinner from "./Spinner";
import type { SearchMode } from "../types";

interface Props {
  mode: SearchMode;
  onModeChange: (mode: SearchMode) => void;
  onSearch: (query: string) => void;
  loading?: boolean;
}

const MODES: { value: SearchMode; label: string }[] = [
  { value: "user", label: "By username" },
  { value: "repo", label: "By repository" },
];

export default function SearchForm({
  mode,
  onModeChange,
  onSearch,
  loading = false,
}: Props) {
  const [q, setQ] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    const trimmed = q.trim();
    if (!trimmed) return;
    onSearch(trimmed);
  }

  function handleModeChange(next: SearchMode) {
    if (next === mode) return;
    setQ("");
    onModeChange(next);
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div
        role="tablist"
        aria-label="Search mode"
        className="inline-flex rounded-xl bg-slate-100 p-1 text-sm font-medium"
      >
        {MODES.map((m) => (
          <button
            key={m.value}
            type="button"
            role="tab"
            aria-selected={mode === m.value}
            onClick={() => handleModeChange(m.value)}
            className={`rounded-lg px-3.5 py-1.5 transition ${
              mode === m.value
                ? "bg-white text-brand-700 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M17 10.5A6.5 6.5 0 114 10.5a6.5 6.5 0 0113 0z"
              />
            </svg>
          </span>
          <input
            className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-11 pr-4 text-base text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            placeholder={
              mode === "user"
                ? "Enter a GitHub username (e.g. octocat)"
                : "Search repositories (e.g. react state management)"
            }
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label={mode === "user" ? "GitHub username" : "Repository search query"}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !q.trim()}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3.5 text-base font-semibold text-white shadow-sm shadow-brand-600/30 transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? <Spinner className="h-5 w-5" /> : "Search"}
        </button>
      </div>
    </form>
  );
}
