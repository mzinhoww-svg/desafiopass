import { SkeletonHeader, Skeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <>
      <SkeletonHeader />
      <main className="flex-1 px-5 py-8">
        <div className="flex gap-3">
          <Skeleton className="h-20 flex-1 rounded-2xl" />
          <Skeleton className="h-20 flex-1 rounded-2xl" />
        </div>
        <Skeleton className="mt-4 h-64 w-full rounded-2xl" />
        <Skeleton className="mt-4 h-11 w-full rounded-xl" />
      </main>
    </>
  );
}
