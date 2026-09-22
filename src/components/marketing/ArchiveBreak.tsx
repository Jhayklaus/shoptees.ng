import Image from "next/image";

/**
 * The one full-bleed moment on a page.
 *
 * A detail crop of a chest or back graphic, run edge to edge with a line
 * from the Collection Archive over it. This is the editorial imagery the
 * brand has: there is no lookbook photography in this catalogue, only 56
 * garment flats — but the flats are vector-clean, so a crop of the artwork
 * holds at full width where a photo would be missing entirely.
 *
 * Exactly one per page, deliberately. It only reads as a break because
 * everything around it stays inside the container.
 */
export function ArchiveBreak({
  image,
  alt,
  eyebrow,
  quote,
  attribution,
}: {
  image: string;
  alt: string;
  eyebrow: string;
  quote: string;
  attribution?: string;
}) {
  return (
    <section className="relative grid bg-ink text-paper overflow-hidden">
      <div className="col-start-1 row-start-1 relative h-[22rem] sm:h-[26rem] lg:h-[34rem]">
        <Image
          src={image}
          alt={alt}
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>

      {/* Scrim only under the copy, so the artwork stays legible everywhere
          else rather than being dimmed across its whole width. */}
      <div className="col-start-1 row-start-1 self-end relative z-10 w-full bg-gradient-to-t from-ink via-ink/80 to-transparent">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10 py-7 md:py-11">
          <p className="font-label text-tan">{eyebrow}</p>
          <p className="font-sub text-xl sm:text-2xl lg:text-[2rem] leading-[1.14] mt-3 max-w-[44ch] normal-case tracking-normal">
            {quote}
          </p>
          {attribution && (
            <p className="font-label text-paper/60 mt-4">{attribution}</p>
          )}
        </div>
      </div>
    </section>
  );
}
