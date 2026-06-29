import { SkeletonHeader, SkeletonRow, Skeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <>
      <SkeletonHeader />
      <main className="flex-1 px-5 py-4">
        <div className="mb-4 flex gap-2">
          <Skeleton className="h-9 flex-1 rounded-xl" />
          <Skeleton className="h-9 flex-1 rounded-xl" />
        </div>
        <Skeleton className="mb-4 h-20 w-full rounded-2xl" />
        <div className="rounded-2xl border border-black/10 bg-paper p-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      </main>
    </>
  );
}
