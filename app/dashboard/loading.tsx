import { Skeleton } from "../ui";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6" aria-busy="true" aria-label="Loading your dashboard">
      <Skeleton className="h-56 rounded-3xl" />
      <div className="my-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-32" />)}
      </div>
      <div className="space-y-8">
        <Skeleton className="h-72" />
        <Skeleton className="h-40" />
      </div>
    </div>
  );
}
