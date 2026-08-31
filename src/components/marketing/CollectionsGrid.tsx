import Image from "next/image";
import { TransitionLink as Link } from "@/components/motion/TransitionLink";
import { ArrowUpRight } from "lucide-react";
import { prisma } from "@/lib/db";

// Editorial "Shop by collection" block for the homepage. One tile per curated
// line ("Urban Retro"), anchored on the newest active product's image, with
// the count of active pieces. Hidden entirely until the first collection is
// created in the admin — the CategoriesGrid below carries the homepage until
// then.
export async function CollectionsGrid() {
  const rows = await prisma.collection.findMany({
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
    <section className="reveal mx-auto max-w-[1400px] px-5 md:px-10 pb-16">
      <div className="flex items-end justify-between mb-10 border-b border-line pb-4">
        <div>
          <p className="font-mono-tight text-ink/55">Index · 02</p>
          <h2 className="font-display text-5xl md:text-6xl tracking-tight mt-1">
            Shop by <span className="font-italic-accent text-vermillion">collection</span>
          </h2>
        </div>
        <Link
          href="/collections"
          className="hidden md:inline font-mono-tight underline-offset-4 hover:underline"
        >
          See all →
        </Link>
      </div>

      <ul className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {rows.map((col) => {
          const cover = col.products[0]?.images[0];
          const count = col._count.products;
          return (
            <li key={col.id}>
              <Link
                href={`/collections/${col.slug}`}
                className="group relative block aspect-[3/4] bg-ink overflow-hidden"
              >
                {cover ? (
                  <Image
                    src={cover.url}
                    alt={cover.alt || col.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover opacity-90 transition-all duration-[900ms] ease-out group-hover:scale-[1.05] group-hover:opacity-100"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center font-italic-accent text-paper/30">
                    coming soon
                  </div>
                )}

                {/* Bottom scrim for the overlaid name */}
                <span className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-ink/85 via-ink/30 to-transparent z-10" />

                {/* Vermillion corner ticks */}
                <span className="absolute top-0 left-0 w-5 h-px bg-tan z-10" />
                <span className="absolute top-0 left-0 w-px h-5 bg-tan z-10" />

                {/* Name burned straight into the image */}
                <div className="absolute left-4 right-4 bottom-4 md:left-5 md:bottom-5 z-20">
                  <p className="font-display text-3xl md:text-4xl leading-none tracking-tight text-paper">
                    {col.name}
                  </p>
                  <p className="mt-1.5 flex items-center gap-2 font-mono-tight text-paper/70 text-[0.68rem]">
                    {count} {count === 1 ? "piece" : "pieces"}
                    <ArrowUpRight
                      size={13}
                      className="text-tan transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="md:hidden mt-8 text-center">
        <Link href="/collections" className="font-mono-tight underline">
          See all →
        </Link>
      </div>
    </section>
  );
}
