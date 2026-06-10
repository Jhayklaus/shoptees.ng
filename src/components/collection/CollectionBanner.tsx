import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

// Wide editorial banner for a collection — used full-size at the top of
// /collections/[slug] and in a shorter variant for each section of the
// /collections index. Falls back to an ink block when no image is set.
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
  const inner = (
    <>
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={imageAlt || name}
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
        <div className="absolute inset-0 flex items-center justify-center font-italic-accent text-paper/20 text-2xl">
          {name}
        </div>
      )}

      {/* Bottom scrim for the overlaid copy */}
      <span className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-ink/85 via-ink/35 to-transparent z-10" />

      {/* Vermillion corner ticks */}
      <span className="absolute top-0 left-0 w-6 h-px bg-vermillion z-10" />
      <span className="absolute top-0 left-0 w-px h-6 bg-vermillion z-10" />

      <div className="absolute left-5 right-5 bottom-5 md:left-8 md:bottom-7 z-20 flex items-end justify-between gap-6">
        <div>
          <p className="font-mono-tight text-paper/70 text-[0.7rem]">
            Collection · {count} {count === 1 ? "piece" : "pieces"}
          </p>
          <p
            className={[
              "font-display tracking-tight leading-none text-paper mt-1",
              isPage ? "text-5xl md:text-7xl" : "text-4xl md:text-6xl",
            ].join(" ")}
          >
            {name}
          </p>
          {description && (
            <p className="font-italic-accent text-paper/75 mt-2 max-w-xl hidden md:block">
              {description}
            </p>
          )}
        </div>
        {!isPage && (
          <span className="hidden md:inline-flex items-center gap-2 font-mono-tight text-paper shrink-0 border border-paper/40 px-4 py-2 group-hover:bg-paper group-hover:text-ink transition-colors">
            View collection
            <ArrowUpRight size={14} className="text-vermillion" />
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
