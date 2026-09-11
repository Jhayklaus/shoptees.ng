import { PageHeaderSkeleton, ProductGridSkeleton } from "@/components/ui/Skeleton";

// Lets the router commit the navigation to /shop immediately, so the view
// transition plays into a page that already has its shape.
export default function ShopLoading() {
  return (
    <main className="mx-auto max-w-[1400px] px-5 md:px-10 pt-12 pb-24">
      <PageHeaderSkeleton />
      <div className="mb-10 flex items-center justify-between gap-4">
        <div className="h-10 w-28 bg-paper-deep" aria-hidden />
      </div>
      <ProductGridSkeleton />
    </main>
  );
}
