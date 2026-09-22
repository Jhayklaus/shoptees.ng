import { listActiveProducts, toDisplayProduct } from "@/lib/server/products";
import { ProductCard } from "@/components/product/ProductCard";
import { SectionHead } from "@/components/marketing/SectionHead";

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
  const featured = rows.slice(0, 8).map(toDisplayProduct);

  if (featured.length === 0) {
    return (
      <section id="new-in" className="mx-auto max-w-[1400px] px-5 md:px-10 py-20">
        <div className="border-2 border-dashed border-line-2 p-16 text-center">
          <p className="font-label text-muted">Between drops — check back soon</p>
        </div>
      </section>
    );
  }

  return (
    <section
      id="new-in"
      className="mx-auto max-w-[1400px] px-5 md:px-10 pt-12 md:pt-16 pb-12 md:pb-16 scroll-mt-24"
    >
      <SectionHead title="New in" href="/shop" count={rows.length} />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-12 md:gap-x-7 md:gap-y-14">
        {featured.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
