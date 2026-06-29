import { SkeletonHeader, SkeletonMatchCard, Skeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <>
      <SkeletonHeader />
      <main className="flex-1 px-5 py-4">
        <div className="mb-4 flex gap-2">
          <Skeleton className="h-9 flex-1 rounded-xl" />
          <Skeleton className="h-9 flex-1 rounded-xl" />
        </div>
        <Skeleton className="mb-3 h-4 w-40" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonMatchCard key={i} />
          ))}
        </div>
      </main>
    </>
  );
}
