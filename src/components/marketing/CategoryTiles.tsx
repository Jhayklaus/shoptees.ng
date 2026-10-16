import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { productCardUrl } from "@/lib/images";
import { SectionHead } from "@/components/marketing/SectionHead";
import {
  STOREFRONT_PRODUCT_ORDER,
  storefrontProductWhere,
} from "@/lib/server/products";

/**
 * Shop by category — a static row of small tiles.
 *
 * Back after being cut with the third carousel. Cutting it was the wrong
 * call: a storefront needs a visible way into garment types from the
 * homepage, and the problem was never that the section existed, it was that
 * it was a swipe lane with a display headline over it.
 *
 * Each tile is anchored on the newest product in that category that a
 * customer may see — live by preference, coming soon otherwise — so the row
 * shows what can actually be bought first. A category holding nothing but
 * coming-soon pieces still appears, veiled and labelled, and sorts to the
 * end: dropping it would break the way into those pieces while their
 * tiles sit in the grid two sections below. Categories with nothing in them
 * at all are left out entirely rather than shown as empty crates.
 */
export async function CategoryTiles() {
  const rows = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      products: {
        where: storefrontProductWhere(),
        orderBy: STOREFRONT_PRODUCT_ORDER,
        take: 1,
        select: {
          status: true,
          images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true } },
        },
      },
      _count: { select: { products: { where: storefrontProductWhere() } } },
    },
  });

  const stocked = rows
    .filter((r) => r._count.products > 0)
    // The lead product is the newest LIVE one wherever one exists, because
    // STOREFRONT_PRODUCT_ORDER bands ACTIVE ahead of COMING_SOON. So a lead
    // that is itself coming soon is proof the whole category is — no second
    // query needed to find that out.
    .map((r) => ({ ...r, comingSoon: r.products[0]?.status === "COMING_SOON" }))
    .sort((a, b) => Number(a.comingSoon) - Number(b.comingSoon))
    .slice(0, 6);
  if (stocked.length === 0) return null;

  return (
    /* Deliberately tight to the hero and deliberately small: after one
       full-viewport image, a dense strip of six is the contrast. */
    <section className="mx-auto max-w-[1400px] px-5 md:px-10 pt-8 md:pt-10">
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
                      src={productCardUrl(cover.url)}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 50vw, 16vw"
                      className={`object-contain p-4 transition-transform duration-[650ms] ease-out group-hover:scale-[1.06] ${
                        cat.comingSoon ? "blur-[3px]" : ""
                      }`}
                    />
                  )}
                </div>
                <p className="font-sub text-[0.88rem] mt-2.5">{cat.name}</p>
                <p className="font-label text-muted mt-1 text-[0.66rem] group-hover:text-ink transition-colors">
                  {cat.comingSoon ? "Coming soon" : "Shop now →"}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
