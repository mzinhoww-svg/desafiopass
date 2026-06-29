import { SkeletonHeader, Skeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <>
      <SkeletonHeader />
      <main className="flex-1 px-5 py-6">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <div className="mt-4 flex gap-2">
          <Skeleton className="h-9 flex-1 rounded-xl" />
          <Skeleton className="h-9 flex-1 rounded-xl" />
        </div>
        <Skeleton className="mt-4 h-56 w-full rounded-2xl" />
      </main>
    </>
  );
}
