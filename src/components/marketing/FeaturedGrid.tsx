import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { listActiveProducts, toDisplayProduct } from "@/lib/server/products";
import { ProductCard } from "@/components/product/ProductCard";

/**
 * "New in" — a grid, not a rail.
 *
 * This used to be one of three horizontal carousels stacked down the
 * homepage, which on a phone meant three swipe lanes in a row and on desktop
 * hid most of the catalogue behind a gesture. A grid shows the work.
 *
 * The first tile runs double width. That is a density rule with a reason
 * behind it rather than decoration: the newest piece is the one the page is
 * there to sell, and giving it a wider frame breaks the uniform 4-up rhythm
 * that made the old grid read as a template.
 */
export async function FeaturedGrid() {
  const rows = await listActiveProducts();
  const featured = rows.slice(0, 7).map(toDisplayProduct);

  if (featured.length === 0) {
    return (
      <section id="new-in" className="mx-auto max-w-[1400px] px-5 md:px-10 py-20">
        <div className="border-2 border-dashed border-line-2 p-16 text-center">
          <p className="font-mono-tight text-muted">Between drops — check back soon</p>
        </div>
      </section>
    );
  }

  return (
    <section
      id="new-in"
      className="mx-auto max-w-[1400px] px-5 md:px-10 pt-14 md:pt-20 pb-14 md:pb-20 scroll-mt-24"
    >
      <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-ink pb-3 mb-8 md:mb-10">
        <div>
          <p className="font-mono-tight text-muted">In the shop now</p>
          <h2 className="font-display text-[clamp(2rem,6vw,3.6rem)] mt-2">New in</h2>
        </div>
        <Link href="/shop" className="btn btn-ghost press">
          All {rows.length} pieces
          <ArrowUpRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-12 md:gap-x-7 md:gap-y-14">
        {featured.map((p, i) => (
          <ProductCard key={p.id} product={p} lead={i === 0} />
        ))}
      </div>
    </section>
  );
}
