import React from "react";

interface Props {
  onSearch: (username: string) => void;
}
// This ensures type safety when using onSearch.

export default function SearchForm({ onSearch }: Props) {
  //Declares a state variable q (query) to store the input value.
  const [q, setQ] = React.useState("");

  //called when the form is submitted.
  function submit(e: React.FormEvent) {
    e.preventDefault();
    onSearch(q.trim());
  }

  return (
    <form onSubmit={submit} className="flex gap-5 items-center">
      <input
        className="flex-1 border rounded-md px-2 py-3 text-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Enter GitHub username (e.g. octocat)"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <button
        type="submit"
        className="bg-blue-800 text-white text-xl px-4 py-2 rounded-md hover:bg-blue-700 transition"
      >
        Search
      </button>
    </form>
  );
}
