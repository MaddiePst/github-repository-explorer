import { useState } from "react";
import SearchForm from "../components/SearchForm";
import RepoList from "../components/RepoList";

export default function Home() {
  const [repos, setRepos] = useState([]);

  const token = localStorage.getItem("token");

  async function getMergedRepos(username: string) {
    try {
      const res = await fetch(
        `http://localhost:8000/repo/active?username=${username}`,
        {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      const data = await res.json();
      setRepos(data.repos || []);
    } catch (err) {
      console.error("getMergedRepos ERROR:", err);
      setRepos([]);
    }
  }

  return (
    <div className="min-h-screen">
      <div className="flex flex-col items-center py-8">
        <div className="max-w-3xl w-full">
          <h1 className="text-3xl font-bold text-center mb-8">
            🔍 GitHub Repo Explorer
          </h1>

          <SearchForm onSearch={getMergedRepos} />

          <div className="mt-10">
            <RepoList repos={repos} />
          </div>
        </div>
      </div>
    </div>
  );
}
