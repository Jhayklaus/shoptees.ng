import Image from "next/image";
import Link from "next/link";
import { SectionHead } from "@/components/marketing/SectionHead";
import { COLLECTIONS } from "@/lib/taxonomy";

/**
 * The homepage's featured collections — three tiles, not the full index.
 *
 * It used to list every collection as a thin ruled row with a 4.5rem
 * thumbnail, which made the homepage a contents page and gave each line
 * about as much presence as a table entry. Collections now carry their own
 * card image, so the tile can actually show it.
 *
 * The description prefers the archive's own definition of what puts a
 * garment in the line — "a collection is defined by the graphic on the
 * chest" — and falls back to whatever the admin wrote.
 */
const DEFINING = new Map(COLLECTIONS.map((c) => [c.slug, c.definingGraphic]));

export type FeaturedCollection = {
  id: string;
  slug: string;
  name: string;
  description: string;
  imageUrl: string | null;
  imageAlt: string;
  count: number;
};

export function CollectionRows({ collections }: { collections: FeaturedCollection[] }) {
  if (collections.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1400px] px-5 md:px-10 py-12 md:py-16">
      <SectionHead
        title="Featured collections"
        href="/collections"
        count={collections.length}
      />

      <ul className="grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((c) => (
          <li key={c.id}>
            <Link href={`/collections/${c.slug}`} className="group block">
              <div className="shot aspect-[4/5]">
                {c.imageUrl && (
                  <Image
                    src={c.imageUrl}
                    alt={c.imageAlt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-[700ms] ease-out group-hover:scale-[1.04]"
                  />
                )}
              </div>

              <div className="mt-4 flex items-baseline justify-between gap-4">
                <h3 className="font-display text-[clamp(1.3rem,2.4vw,1.75rem)] group-hover:text-vermillion transition-colors">
                  {c.name}
                </h3>
                <p className="font-label text-muted tnum whitespace-nowrap">
                  {String(c.count).padStart(2, "0")}{" "}
                  {c.count === 1 ? "piece" : "pieces"}
                </p>
              </div>

              <p className="mt-2 text-ink-soft text-[0.9rem] leading-snug">
                {DEFINING.get(c.slug) ?? c.description}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
