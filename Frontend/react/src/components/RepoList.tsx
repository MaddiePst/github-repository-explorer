import RepoCard from "./RepoCard";
import type { GithubRepo } from "../types";

interface RepoListProps {
  repos: GithubRepo[];
}

export default function RepoList({ repos }: RepoListProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
      {repos.map((r) => (
        <RepoCard key={r.id} repo={r} />
      ))}
    </div>
  );
}
