import { SkeletonHeader, Skeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <>
      <SkeletonHeader />
      <main className="flex flex-1 flex-col gap-4 px-5 py-4">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-4 w-48" />
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      </main>
    </>
  );
}
