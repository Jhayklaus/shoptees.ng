import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { productImageUrl } from "@/lib/images";
import { SectionHead } from "@/components/marketing/SectionHead";

/**
 * Shop by category — a static row of small tiles.
 *
 * Back after being cut with the third carousel. Cutting it was the wrong
 * call: a storefront needs a visible way into garment types from the
 * homepage, and the problem was never that the section existed, it was that
 * it was a swipe lane with a display headline over it.
 *
 * Each tile is anchored on the newest active product in that category, so
 * the row shows what can actually be bought. Categories with nothing in
 * them are left out entirely rather than shown as empty crates.
 */
export async function CategoryTiles() {
  const rows = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      products: {
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true } } },
      },
      _count: { select: { products: { where: { status: "ACTIVE" } } } },
    },
  });

  const stocked = rows.filter((r) => r._count.products > 0).slice(0, 6);
  if (stocked.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1400px] px-5 md:px-10 pt-12 md:pt-16">
      <SectionHead title="Shop by category" href="/shop" />

      <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-5">
        {stocked.map((cat) => {
          const cover = cat.products[0]?.images[0];
          return (
            <li key={cat.id}>
              <Link href={`/shop?c=${cat.slug}`} className="group block">
                <div className="shot aspect-square">
                  {cover && (
                    <Image
                      src={productImageUrl(cover.url)}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 50vw, 16vw"
                      className="object-contain p-4 transition-transform duration-[650ms] ease-out group-hover:scale-[1.06]"
                    />
                  )}
                </div>
                <p className="font-sub text-[0.88rem] mt-2.5">{cat.name}</p>
                <p className="font-label text-muted mt-1 text-[0.66rem] group-hover:text-ink transition-colors">
                  Shop now →
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
