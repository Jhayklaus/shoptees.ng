import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { prisma } from "@/lib/db";

// Editorial "Shop by collection" block for the homepage. Renders one tile per
// category, each anchored on the first active product's image so the grid
// fills naturally as the catalogue grows.
//
// Categories with zero active products still render — clicking through leads
// to the "Nothing in <collection> right now" empty state. We surface the count
// so the customer knows what to expect.
export async function CollectionsGrid() {
  const rows = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      products: {
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true, alt: true } },
        },
      },
      _count: { select: { products: { where: { status: "ACTIVE" } } } },
    },
  });

  if (rows.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1400px] px-5 md:px-10 pt-24 md:pt-32 pb-12">
      <div className="flex items-end justify-between mb-10 border-b border-line pb-4">
        <div>
          <p className="font-mono-tight text-ink/55">Index · 02</p>
          <h2 className="font-display text-5xl md:text-6xl tracking-tight mt-1">
            Shop by <span className="font-italic-accent text-vermillion">collection</span>
          </h2>
        </div>
        <Link
          href="/shop"
          className="hidden md:inline font-mono-tight underline-offset-4 hover:underline"
        >
          See all →
        </Link>
      </div>

      <ul className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
        {rows.map((cat) => {
          const cover = cat.products[0]?.images[0];
          const count = cat._count.products;
          return (
            <li key={cat.id}>
              <Link
                href={`/shop?c=${cat.slug}`}
                className="group relative block aspect-[4/5] bg-paper-deep overflow-hidden"
              >
                {cover ? (
                  <Image
                    src={cover.url}
                    alt={cover.alt || cat.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center font-italic-accent text-ink/30">
                    no images yet
                  </div>
                )}

                {/* Vermillion corner ticks — match Hero figure */}
                <span className="absolute top-0 left-0 w-5 h-px bg-vermillion z-10" />
                <span className="absolute top-0 left-0 w-px h-5 bg-vermillion z-10" />
                <span className="absolute bottom-0 right-0 w-5 h-px bg-vermillion z-10" />
                <span className="absolute bottom-0 right-0 w-px h-5 bg-vermillion z-10" />

                {/* Hover veil */}
                <span className="absolute inset-0 bg-ink/0 group-hover:bg-ink/10 transition-colors z-10" />

                {/* Caption strip */}
                <div className="absolute left-3 right-3 bottom-3 md:left-4 md:right-4 md:bottom-4 z-20 flex items-end justify-between gap-3">
                  <div className="bg-paper/90 backdrop-blur-sm px-3 py-2">
                    <p className="font-display text-2xl md:text-3xl leading-none tracking-tight">
                      {cat.name}
                    </p>
                    <p className="font-mono-tight text-ink/55 mt-1 text-[0.68rem]">
                      {count} {count === 1 ? "piece" : "pieces"}
                    </p>
                  </div>
                  <span
                    aria-hidden
                    className="bg-paper/90 backdrop-blur-sm w-9 h-9 flex items-center justify-center transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  >
                    <ArrowUpRight size={16} className="text-vermillion" />
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="md:hidden mt-8 text-center">
        <Link href="/shop" className="font-mono-tight underline">
          See all →
        </Link>
      </div>
    </section>
  );
}
