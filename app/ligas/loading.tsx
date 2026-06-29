import { SkeletonHeader, Skeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <>
      <SkeletonHeader />
      <main className="flex flex-1 flex-col gap-4 px-5 py-4">
        <Skeleton className="h-11 w-full rounded-xl" />
        <Skeleton className="h-4 w-28" />
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-28 w-full rounded-2xl" />
      </main>
    </>
  );
}
