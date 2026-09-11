import { PageHeaderSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function CollectionsLoading() {
  return (
    <main className="mx-auto max-w-[1400px] px-5 md:px-10 pt-12 pb-24">
      <PageHeaderSkeleton />
      <div className="space-y-16">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="w-full aspect-[16/6]" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-14 mt-8">
              {Array.from({ length: 4 }).map((_, j) => (
                <Skeleton key={j} className="w-full aspect-[4/5]" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
