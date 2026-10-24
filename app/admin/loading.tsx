import { Skeleton } from "../ui";

export default function Loading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading">
      <Skeleton className="h-9 w-56" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-32" />)}
      </div>
      <Skeleton className="h-64" />
      <Skeleton className="h-64" />
    </div>
  );
}
