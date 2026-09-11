import { PageHeaderSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function AboutLoading() {
  return (
    <main className="mx-auto max-w-[1400px] px-5 md:px-10 pt-12 pb-24">
      <PageHeaderSkeleton />
      <div className="grid grid-cols-12 gap-6 lg:gap-12">
        <div className="col-span-12 lg:col-span-6 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className={i % 3 === 2 ? "h-4 w-2/3" : "h-4 w-full"} />
          ))}
        </div>
        <Skeleton className="col-span-12 lg:col-span-6 w-full aspect-[4/3]" />
      </div>
    </main>
  );
}
