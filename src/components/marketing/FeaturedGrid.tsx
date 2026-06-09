import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { listActiveProducts, toDisplayProduct } from "@/lib/server/products";
import { ProductCard } from "@/components/product/ProductCard";

// "New in" rail — the latest active products. Horizontal snap-scroll on
// mobile (storefront-app feel), clean 4-up grid on desktop.
export async function FeaturedGrid() {
  const rows = await listActiveProducts();
  const featured = rows.slice(0, 8).map(toDisplayProduct);

  if (featured.length === 0) {
    return (
      <section id="new-in" className="mx-auto max-w-[1400px] px-5 md:px-10 py-24">
        <div className="border border-dashed border-line p-16 text-center">
          <p className="font-italic-accent text-2xl text-ink/55">
            The studio is between drops.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="new-in" className="mx-auto max-w-[1400px] px-5 md:px-10 pt-20 md:pt-28 scroll-mt-20">
      <div className="flex items-end justify-between mb-10 md:mb-12 border-b border-line pb-4">
        <div>
          <p className="font-mono-tight text-ink/55">Latest · 01</p>
          <h2 className="font-display text-5xl md:text-7xl tracking-tight mt-1">
            New <span className="font-italic-accent text-vermillion">in</span>
          </h2>
        </div>
        <Link
          href="/shop"
          className="hidden md:inline-flex items-center gap-2 group border border-ink px-5 py-2.5 font-mono-tight hover:bg-ink hover:text-paper transition-colors"
        >
          Shop all
          <ArrowUpRight
            size={14}
            className="text-vermillion group-hover:text-paper transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </Link>
      </div>

      {/* Mobile: horizontal snap rail. Desktop: 4-up grid. */}
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-5 px-5 snap-x snap-mandatory md:mx-0 md:px-0 md:pb-0 md:grid md:grid-cols-4 md:gap-x-5 md:gap-y-14 md:overflow-visible">
        {featured.map((p, i) => (
          <div
            key={p.id}
            className="min-w-[72vw] sm:min-w-[44vw] snap-start md:min-w-0"
          >
            <ProductCard product={p} index={i} />
          </div>
        ))}
      </div>

      <div className="md:hidden mt-8 text-center">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 border border-ink px-6 py-3 font-mono-tight hover:bg-ink hover:text-paper transition-colors"
        >
          Shop all <ArrowUpRight size={14} className="text-vermillion" />
        </Link>
      </div>
    </section>
  );
}
