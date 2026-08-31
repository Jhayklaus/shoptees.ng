import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { listActiveProducts, toDisplayProduct } from "@/lib/server/products";
import { ProductCard } from "@/components/product/ProductCard";
import { CarouselRail } from "@/components/marketing/CarouselRail";

// "New in" rail — the latest active products on a horizontal carousel:
// snap-scroll everywhere, arrow controls on desktop.
export async function FeaturedGrid() {
  const rows = await listActiveProducts();
  const featured = rows.slice(0, 8).map(toDisplayProduct);

  if (featured.length === 0) {
    return (
      <section id="new-in" className="mx-auto max-w-[1400px] px-5 md:px-10 py-24">
        <div className="border-2 border-dashed border-ink/30 p-16 text-center">
          <span className="stamp text-ink/50 text-sm">Between drops — check back soon</span>
        </div>
      </section>
    );
  }

  return (
    <section id="new-in" className="reveal mx-auto max-w-[1400px] px-5 md:px-10 pt-20 md:pt-28 pb-16 md:pb-24 scroll-mt-20">
      <div className="flex items-end justify-between mb-10 md:mb-12 border-b-[3px] border-ink pb-4">
        <div>
          <span className="stamp text-vermillion">New arrivals · 01</span>
          <h2 className="font-display text-5xl md:text-7xl mt-2">
            New <span className="text-vermillion">in</span>
          </h2>
        </div>
        <Link
          href="/shop"
          className="btn-wipe hidden md:inline-flex items-center gap-2 group border-2 border-ink px-5 py-2.5 font-condensed text-[0.78rem] hover:text-paper transition-colors duration-200"
        >
          Shop all
          <ArrowUpRight
            size={14}
            className="text-vermillion transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </Link>
      </div>

      <CarouselRail ariaLabel="New in" className="-mx-5 px-5 md:mx-0 md:px-0 md:gap-5">
        {featured.map((p, i) => (
          <div
            key={p.id}
            className="min-w-[72vw] sm:min-w-[44vw] md:min-w-[300px] lg:min-w-[320px] snap-start"
          >
            <ProductCard product={p} index={i} />
          </div>
        ))}
      </CarouselRail>

      <div className="md:hidden mt-8 text-center">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 border-2 border-ink px-6 py-3 font-condensed text-[0.78rem] hover:bg-ink hover:text-paper transition-colors"
        >
          Shop all <ArrowUpRight size={14} className="text-vermillion" />
        </Link>
      </div>
    </section>
  );
}
