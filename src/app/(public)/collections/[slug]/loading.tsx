import { ProductGridSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function CollectionLoading() {
  return (
    <main className="mx-auto max-w-[1400px] px-5 md:px-10 pt-6 pb-24">
      <Skeleton className="h-4 w-52 mb-6" />
      <Skeleton className="w-full aspect-[16/6] mb-12" />
      <ProductGridSkeleton />
    </main>
  );
}
