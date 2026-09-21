import { cn } from "@/lib/utils";

// Shape-matched loading placeholders.
//
// These exist for the route transition more than for the loading state. A
// server-rendered dynamic route can't commit until its data comes back, so a
// navigation used to hold the OLD page frozen on screen under the view
// transition's snapshot while the database was queried — click, dead pause,
// jump. A `loading.tsx` built from these lets the router commit instantly:
// the transition plays immediately into a page that already has its final
// shape, and the content fills in underneath.
//
// Square corners on purpose — this brand has no radius anywhere, so a
// rounded skeleton would read as a different site for the half-second it is
// on screen. The fill is a tint of ink rather than a surface colour: the
// product ground is now the same white as the page, so a skeleton painted
// in it would be invisible.

export function Skeleton({
  className,
  style,
  morphTarget,
}: {
  className?: string;
  style?: React.CSSProperties;
  /** Marks this box as where a card→detail image morph should land. */
  morphTarget?: boolean;
}) {
  return (
    <div
      aria-hidden
      style={style}
      {...(morphTarget ? { "data-morph-target": "" } : {})}
      className={cn("relative overflow-hidden bg-ink/[0.07]", className)}
    >
      {/* Sheen sweep, starting off-frame to the left. */}
      <span className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-paper/80 to-transparent" />
    </div>
  );
}

/** Matches ProductCard: square tile, then the ruled title/price row. */
export function ProductCardSkeleton() {
  return (
    <div className="block">
      <Skeleton className="w-full aspect-square" />
      <div className="mt-3 border-t-2 border-ink/15 pt-2 grid gap-1.5 sm:flex sm:items-start sm:justify-between sm:gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/3" />
        </div>
        <Skeleton className="h-4 w-16 shrink-0" />
      </div>
    </div>
  );
}

/** Matches the /shop and collection grids. */
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-label="Loading products"
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-12 md:gap-x-7 md:gap-y-14"
    >
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Matches the stamp + display headline + description block. */
export function PageHeaderSkeleton() {
  return (
    <header className="grid grid-cols-12 gap-6 mb-12 border-b-[3px] border-ink pb-8">
      <div className="col-span-12 md:col-span-7 space-y-4">
        <Skeleton className="h-5 w-44" />
        <Skeleton className="h-16 md:h-24 w-4/5" />
      </div>
      <div className="col-span-12 md:col-span-5 md:self-end space-y-2">
        <Skeleton className="h-4 w-full max-w-md" />
        <Skeleton className="h-4 w-2/3 max-w-md" />
      </div>
    </header>
  );
}

/**
 * Matches ProductDetail's gallery/aside split.
 *
 * The gallery box carries `data-morph-target`, which is the whole point: a
 * product image clicked on the grid morphs into THIS box while the product is
 * still being fetched, instead of the morph having nowhere to land and the
 * transition falling back to a plain cross-fade.
 */
export function ProductDetailSkeleton() {
  return (
    <main className="mx-auto max-w-[1400px] px-5 md:px-10 pt-6 pb-24">
      <Skeleton className="h-4 w-56 mb-8" />
      <div className="grid grid-cols-12 gap-6 lg:gap-12">
        <div className="col-span-12 lg:col-span-6 xl:col-span-7">
          <div className="max-w-[560px] mx-auto lg:mx-0">
            <Skeleton morphTarget className="w-full aspect-square" />
            <div className="mt-3 flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="w-16 h-16" />
              ))}
            </div>
          </div>
        </div>

        <aside className="col-span-12 lg:col-span-6 xl:col-span-5 space-y-5">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-14 md:h-20 w-4/5" />
          <Skeleton className="h-8 w-36" />
          <div className="space-y-2 pt-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="flex gap-2 pt-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-16" />
            ))}
          </div>
          <Skeleton className="h-14 w-full mt-4" />
        </aside>
      </div>
    </main>
  );
}
