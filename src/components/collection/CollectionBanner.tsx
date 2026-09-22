import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { COLLECTION_CROP } from "@/lib/images";

// Wide editorial banner for a collection — used full-size at the top of
// /collections/[slug] and in a shorter variant for each section of the
// /collections index.
//
// With no banner set in admin it falls back to a detail crop of the
// collection's defining chest graphic, because that is what the collection
// IS — the archive files by graphic, not by garment. The old fallback was
// the name set in 20%-opacity type over an empty ink block: 1.85:1, and it
// looked like a broken image.
export function CollectionBanner({
  name,
  slug,
  description,
  imageUrl,
  imageAlt,
  count,
  variant = "index",
}: {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  imageAlt?: string;
  count: number;
  variant?: "index" | "page";
}) {
  const isPage = variant === "page";
  const art = imageUrl || COLLECTION_CROP[slug] || null;
  const inner = (
    <>
      {art ? (
        <Image
          src={art}
          alt={imageUrl ? imageAlt || name : `${name} — defining graphic`}
          fill
          sizes="100vw"
          priority={isPage}
          className={[
            "object-cover opacity-90",
            !isPage &&
              "transition-all duration-[900ms] ease-out group-hover:scale-[1.03] group-hover:opacity-100",
          ]
            .filter(Boolean)
            .join(" ")}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center font-label text-paper/60">
          {name}
        </div>
      )}

      {/* Bottom scrim for the overlaid copy */}
      <span className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-ink/85 via-ink/35 to-transparent z-10" />

      {/* Crate corner brackets */}
      <span className="absolute top-0 left-0 w-10 h-[3px] bg-tan z-10" />
      <span className="absolute top-0 left-0 w-[3px] h-10 bg-tan z-10" />

      <div className="absolute left-5 right-5 bottom-5 md:left-8 md:bottom-7 z-20 flex items-end justify-between gap-6">
        <div>
          <span className="stamp text-paper/70">
            Collection · {String(count).padStart(2, "0")} {count === 1 ? "piece" : "pieces"}
          </span>
          <p
            className={[
              "font-display leading-[0.92] text-paper mt-2",
              isPage ? "text-5xl md:text-7xl" : "text-4xl md:text-6xl",
            ].join(" ")}
          >
            {name}
          </p>
          {description && (
            <p className="font-label text-paper/70 mt-3 max-w-xl hidden md:block text-sm">
              {description}
            </p>
          )}
        </div>
        {!isPage && (
          <span className="hidden md:inline-flex items-center gap-2 font-condensed text-[0.78rem] text-paper shrink-0 border-2 border-paper/50 px-4 py-2 group-hover:bg-paper group-hover:text-ink transition-colors duration-200">
            View collection
            <ArrowUpRight size={13} />
          </span>
        )}
      </div>
    </>
  );

  const frameClasses = [
    "relative block overflow-hidden bg-ink",
    isPage ? "aspect-[16/7] md:aspect-[3/1]" : "aspect-[16/8] md:aspect-[21/7]",
  ].join(" ");

  // On the index the whole banner links through to the collection page.
  return isPage ? (
    <div className={frameClasses}>{inner}</div>
  ) : (
    <Link href={`/collections/${slug}`} className={`group ${frameClasses}`}>
      {inner}
    </Link>
  );
}
