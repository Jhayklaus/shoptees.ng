import Image from "next/image";
import { COLLECTION_CROP } from "@/lib/images";

/**
 * Masthead for a single collection page.
 *
 * With no banner set in admin it falls back to a detail crop of the
 * collection's defining chest graphic — which is what a collection IS in
 * this brand's filing system, so the fallback says something true rather
 * than rendering an empty ink block.
 *
 * The index no longer uses this: collections there are a grid of tiles, not
 * a stack of full-width banners each with its own carousel under it.
 */
export function CollectionBanner({
  name,
  slug,
  description,
  imageUrl,
  imageAlt,
  count,
}: {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  imageAlt?: string;
  count: number;
}) {
  const art = imageUrl || COLLECTION_CROP[slug] || null;

  return (
    <div className="relative overflow-hidden bg-ink aspect-[16/9] sm:aspect-[21/8] lg:aspect-[3/1]">
      {art && (
        <Image
          src={art}
          alt={imageUrl ? imageAlt || name : `${name} — defining graphic`}
          fill
          sizes="100vw"
          priority
          className="object-cover"
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/35 to-ink/5" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/70 via-transparent to-transparent" />

      <div className="absolute inset-0 flex items-end">
        <div className="w-full px-5 md:px-8 pb-6 md:pb-8">
          <p className="font-label text-paper/75">
            Collection
            <span aria-hidden className="mx-2 text-paper/40">
              ·
            </span>
            <span className="tnum">
              {String(count).padStart(2, "0")} {count === 1 ? "piece" : "pieces"}
            </span>
          </p>
          <h1 className="font-display text-paper text-[clamp(2rem,6vw,4rem)] mt-2.5">
            {name}
          </h1>
          {description && (
            <p className="mt-3 text-paper/80 text-[0.94rem] leading-snug max-w-[52ch]">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
