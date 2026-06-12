import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { prisma } from "@/lib/db";
import { CarouselRail } from "@/components/marketing/CarouselRail";

// Editorial "Shop by category" block for the homepage. One tile per category
// on a horizontal carousel, each anchored on the first active product's image.
//
// Categories with zero active products still render — clicking through leads
// to the "Nothing in <category> right now" empty state. We surface the count
// so the customer knows what to expect.
export async function CategoriesGrid() {
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
    <section className="mx-auto max-w-[1400px] px-5 md:px-10 pb-16">
      <div className="flex items-end justify-between mb-10 border-b-[3px] border-ink pb-4">
        <div>
          <span className="stamp text-vermillion">Manifest · 02</span>
          <h2 className="font-display text-5xl md:text-6xl mt-2">
            Shop by <span className="text-vermillion">category</span>
          </h2>
        </div>
        <Link
          href="/shop"
          className="hidden md:inline font-condensed text-[0.78rem] underline-offset-4 hover:underline hover:text-vermillion"
        >
          See all →
        </Link>
      </div>

      <CarouselRail ariaLabel="Shop by category" className="-mx-5 px-5 md:mx-0 md:px-0">
        {rows.map((cat) => {
          const cover = cat.products[0]?.images[0];
          const count = cat._count.products;
          return (
            <div
              key={cat.id}
              className="min-w-[60vw] sm:min-w-[40vw] md:min-w-[280px] lg:min-w-[310px] snap-start"
            >
              <Link
                href={`/shop?c=${cat.slug}`}
                className="group relative block aspect-[3/4] bg-ink overflow-hidden"
              >
                {cover ? (
                  <Image
                    src={cover.url}
                    alt={cover.alt || cat.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover opacity-90 transition-all duration-[900ms] ease-out group-hover:scale-[1.05] group-hover:opacity-100"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="stamp text-paper/40">coming soon</span>
                  </div>
                )}

                {/* Bottom scrim for the overlaid name */}
                <span className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-ink/85 via-ink/30 to-transparent z-10" />

                {/* Crate corner brackets */}
                <span className="absolute top-0 left-0 w-7 h-[3px] bg-vermillion z-10" />
                <span className="absolute top-0 left-0 w-[3px] h-7 bg-vermillion z-10" />

                {/* Stock count stamped top-right like a crate label */}
                <span className="stamp absolute top-3 right-3 z-20 text-paper/90 bg-ink/40 backdrop-blur-[2px]">
                  QTY {String(count).padStart(2, "0")}
                </span>

                {/* Name burned straight into the image */}
                <div className="absolute left-4 right-4 bottom-4 md:left-5 md:bottom-5 z-20">
                  <p className="font-display text-3xl md:text-4xl leading-none text-paper">
                    {cat.name}
                  </p>
                  <p className="mt-2 flex items-center gap-2 font-mono-tight text-paper/70">
                    Open crate
                    <ArrowUpRight
                      size={13}
                      className="text-vermillion transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </p>
                </div>
              </Link>
            </div>
          );
        })}
      </CarouselRail>

      <div className="md:hidden mt-8 text-center">
        <Link href="/shop" className="font-condensed text-[0.78rem] underline underline-offset-4">
          See all →
        </Link>
      </div>
    </section>
  );
}
