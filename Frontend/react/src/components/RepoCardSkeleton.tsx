export default function RepoCardSkeleton() {
  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
      <div className="mt-3 h-3 w-full animate-pulse rounded bg-slate-100" />
      <div className="mt-2 h-3 w-5/6 animate-pulse rounded bg-slate-100" />
      <div className="mt-5 flex items-center justify-between">
        <div className="h-3 w-12 animate-pulse rounded bg-slate-100" />
        <div className="h-3 w-16 animate-pulse rounded bg-slate-100" />
      </div>
    </div>
  );
}
