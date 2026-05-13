import Link from "next/link";
import { listActiveProducts, toDisplayProduct } from "@/lib/server/products";
import { ProductCard } from "@/components/product/ProductCard";

export async function FeaturedGrid() {
  const rows = await listActiveProducts();
  const featured = rows.slice(0, 4).map(toDisplayProduct);

  if (featured.length === 0) {
    return (
      <section className="mx-auto max-w-[1400px] px-5 md:px-10 pb-32">
        <div className="border border-dashed border-line p-16 text-center">
          <p className="font-italic-accent text-2xl text-ink/55">
            The studio is between drops.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-[1400px] px-5 md:px-10 pt-32 mb-12">
      <div className="flex items-end justify-between mb-12 border-b border-line pb-4">
        <div>
          <p className="font-mono-tight text-ink/55">Selection · 01</p>
          <h2 className="font-display text-5xl md:text-6xl tracking-tight mt-1">
            On the table <span className="font-italic-accent text-vermillion">this week</span>
          </h2>
        </div>
        <Link href="/shop" className="hidden md:inline font-mono-tight underline-offset-4 hover:underline">
          See all →
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-12 md:gap-y-0">
        {featured.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} offset={i % 2 === 1} />
        ))}
      </div>

      <div className="md:hidden mt-10 text-center">
        <Link href="/shop" className="font-mono-tight underline">
          See all →
        </Link>
      </div>
    </section>
  );
}
