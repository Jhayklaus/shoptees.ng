import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { listPublishedCollections } from "@/lib/server/collections";
import { collectionCard } from "@/lib/images";
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
  // Tiles show a graphic and a count, never a product rail, so the rows
  // and their tallies are all this page needs. Lines with something live
  // in them come first; a line whose pieces are all still coming is
  // labelled rather than counted.
  const collections = await listPublishedCollections();

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
          {collections.map((col) => {
            const art = collectionCard(col);
            return (
            <li key={col.id}>
              <Link href={`/collections/${col.slug}`} className="group block">
                <div className="shot aspect-[4/3] sm:aspect-[16/10]">
                  {art && (
                    <Image
                      src={art.url}
                      alt={art.alt}
                      fill
                      sizes="(max-width: 640px) 100vw, 50vw"
                      className={[
                        "object-cover transition-transform duration-[700ms] ease-out",
                        // Blurring a cover image softens its edges inside
                        // the frame, which leaves a pale rim of the tile
                        // ground showing all the way round. Scaling it up
                        // a touch pushes that soft edge out of shot.
                        col.comingSoon
                          ? "blur-[3px] scale-[1.06] group-hover:scale-[1.1]"
                          : "group-hover:scale-[1.04]",
                      ].join(" ")}
                    />
                  )}
                  {col.comingSoon && (
                    <span className="absolute top-3 left-3 z-10 bg-paper/95 text-ink border border-ink font-label px-2 py-1 text-[0.64rem]">
                      Coming soon
                    </span>
                  )}
                </div>

                <div className="mt-4 flex items-baseline justify-between gap-4">
                  <h2 className="font-display text-[clamp(1.4rem,3vw,2rem)] group-hover:text-vermillion transition-colors">
                    {col.name}
                  </h2>
                  {/* Nothing live in the line, so there is no piece count
                      worth printing — "00 pieces" is a bug report, not a
                      label. The tile still opens: inside are the blurred
                      tiles of what is coming. */}
                  <p className="font-label text-muted tnum whitespace-nowrap">
                    {col.comingSoon ? (
                      "Coming soon"
                    ) : (
                      <>
                        {String(col.pieces).padStart(2, "0")}{" "}
                        {col.pieces === 1 ? "piece" : "pieces"}
                      </>
                    )}
                  </p>
                </div>

                <p className="mt-2 text-ink-soft text-[0.9rem] leading-snug max-w-[46ch]">
                  {DEFINING.get(col.slug) ?? col.description}
                </p>
              </Link>
            </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
