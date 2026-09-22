import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { listCollectionsWithProducts } from "@/lib/server/collections";
import { COLLECTION_CROP } from "@/lib/images";
import { COLLECTIONS } from "@/lib/taxonomy";

export const metadata: Metadata = buildMetadata({
  title: "Collections",
  description:
    "Every Shoptees collection — curated lines of streetwear and football apparel for men and women.",
  path: "/collections",
});

export const dynamic = "force-dynamic";

/** The archive's own definition of what puts a garment in each line. */
const DEFINING = new Map(COLLECTIONS.map((c) => [c.slug, c.definingGraphic]));

export default async function CollectionsPage() {
  // `take: 1` — the tiles show a graphic, not a product rail, so only the
  // counts are needed. Reusing the existing query keeps this page out of
  // the data layer.
  const collections = await listCollectionsWithProducts(1);

  return (
    <main className="mx-auto max-w-[1400px] px-5 md:px-10 pt-8 pb-24">
      <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3 border-b border-line pb-5 mb-8">
        <div>
          <p className="font-label text-muted mb-2">
            {String(collections.length).padStart(2, "0")}{" "}
            {collections.length === 1 ? "line" : "lines"}
          </p>
          <h1 className="font-display text-[clamp(1.9rem,5vw,3rem)]">Collections</h1>
        </div>
        <p className="text-ink-soft text-[0.92rem] leading-snug max-w-[44ch]">
          A collection is defined by the graphic on the chest, not by the garment or
          the colourway.
        </p>
      </header>

      {collections.length === 0 ? (
        <div className="border border-dashed border-line-2 p-16 text-center">
          <p className="font-label text-muted">The studio is curating — check back soon</p>
          <p className="mt-5">
            <Link href="/shop" className="font-label underline underline-offset-4">
              Browse everything →
            </Link>
          </p>
        </div>
      ) : (
        /* A grid of tiles, not a stack of full-width banners each with its
           own carousel underneath. Six lines on one screen is a contents
           page; six banners is six pages of scrolling. */
        <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-10 lg:gap-x-8 lg:gap-y-12">
          {collections.map((col) => (
            <li key={col.id}>
              <Link href={`/collections/${col.slug}`} className="group block">
                <div className="shot aspect-[4/3] sm:aspect-[16/10]">
                  <Image
                    src={col.imageUrl || COLLECTION_CROP[col.slug] || "/archive-crop/th-dice.webp"}
                    alt={col.imageUrl ? col.imageAlt || col.name : `${col.name} — defining graphic`}
                    fill
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="object-cover transition-transform duration-[700ms] ease-out group-hover:scale-[1.04]"
                  />
                </div>

                <div className="mt-4 flex items-baseline justify-between gap-4">
                  <h2 className="font-display text-[clamp(1.4rem,3vw,2rem)] group-hover:text-vermillion transition-colors">
                    {col.name}
                  </h2>
                  <p className="font-label text-muted tnum whitespace-nowrap">
                    {String(col._count.products).padStart(2, "0")}{" "}
                    {col._count.products === 1 ? "piece" : "pieces"}
                  </p>
                </div>

                <p className="mt-2 text-ink-soft text-[0.9rem] leading-snug max-w-[46ch]">
                  {DEFINING.get(col.slug) ?? col.description}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
