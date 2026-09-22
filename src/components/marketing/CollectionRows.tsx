import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { COLLECTION_CROP } from "@/lib/images";
import { COLLECTIONS } from "@/lib/taxonomy";

/**
 * The collections, as ruled rows rather than another carousel.
 *
 * Each row leads with a crop of the collection's defining chest graphic —
 * which is what a collection actually IS in this brand's filing system:
 * "a collection is defined by the graphic on the chest, not by the garment
 * or the colourway". Showing a hoodie to represent Trap House would say
 * nothing; showing the flaming dice says everything.
 *
 * The defining-graphic line comes from the archive transcription, so the row
 * carries a real description of the rule rather than marketing filler.
 */
const DEFINING = new Map(COLLECTIONS.map((c) => [c.slug, c.definingGraphic]));

export function CollectionRows({
  collections,
}: {
  collections: {
    id: string;
    slug: string;
    name: string;
    imageUrl: string | null;
    count: number;
  }[];
}) {
  if (collections.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1400px] px-5 md:px-10 py-16 md:py-24">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-ink pb-3 mb-2">
        <div>
          <p className="font-mono-tight text-muted">Filed by chest graphic, not by garment</p>
          <h2 className="font-display text-[clamp(2rem,6vw,3.6rem)] mt-2">The collections</h2>
        </div>
        <Link href="/collections" className="btn btn-ghost press">
          All collections
          <ArrowUpRight size={14} />
        </Link>
      </div>

      <ul>
        {collections.map((c, i) => (
          <li key={c.id}>
            <Link
              href={`/collections/${c.slug}`}
              className="group grid grid-cols-[4.5rem_1fr] md:grid-cols-[7rem_15rem_1fr_auto] items-center gap-x-5 gap-y-2 py-5 border-b border-line"
            >
              <div className="shot aspect-square row-span-2 md:row-span-1">
                <Image
                  src={c.imageUrl || COLLECTION_CROP[c.slug] || "/archive-crop/th-dice.webp"}
                  alt=""
                  fill
                  sizes="112px"
                  className="object-cover transition-transform duration-[700ms] ease-out group-hover:scale-[1.07]"
                />
              </div>

              <div>
                <p className="font-mono-tight text-muted tnum">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="font-sub text-lg md:text-xl mt-1 group-hover:text-vermillion transition-colors">
                  {c.name}
                </h3>
              </div>

              <p className="col-span-2 md:col-span-1 text-ink-soft text-[0.92rem] leading-snug">
                {DEFINING.get(c.slug) ?? ""}
              </p>

              <p className="col-span-2 md:col-span-1 font-mono-tight text-muted tnum md:text-right whitespace-nowrap">
                {String(c.count).padStart(2, "0")}{" "}
                {c.count === 1 ? "piece" : "pieces"} →
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
