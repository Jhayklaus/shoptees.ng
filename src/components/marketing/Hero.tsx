import Link from "next/link";
import Image from "next/image";

export type HeroContent = {
  /** Collection the hero is advertising. */
  slug: string;
  name: string;
  /** Small label above the headline. */
  eyebrow: string;
  /** Usually the collection name; overridable from admin. */
  headline: string;
  body: string;
  ctaLabel: string;
  imageUrl: string;
  imageAlt: string;
  caption: string;
  pieces: number;
};

/**
 * Homepage hero — a banner for the featured collection, not a brand statement.
 *
 * It used to open on the label's tagline, which told a returning customer
 * nothing they did not already know and gave them nothing to click. A
 * storefront's most valuable surface should point at something buyable, so
 * the hero now leads on one collection: its name, its own description, how
 * many pieces are in it, and a route straight into it.
 *
 * Which collection is admin-set (`hero.collection`); the copy keys are
 * overrides that default to the collection's own fields, so editing a
 * collection updates the homepage without a second edit.
 *
 * No longer a client component — with the cycling headline gone there is no
 * state here, so this renders on the server.
 */
export function Hero({ content }: { content: HeroContent }) {
  const headlineLines = content.headline.split("\n").filter(Boolean);

  return (
    <section className="relative bg-ink">
      <div className="relative h-[76svh] min-h-[27rem] max-h-[44rem] w-full overflow-hidden">
        {content.imageUrl && (
          <Image
            src={content.imageUrl}
            alt={content.imageAlt}
            fill
            sizes="100vw"
            priority
            className="object-cover"
          />
        )}

        {/* Scrim weighted to the bottom-left, where the copy sits, so the
            rest of the frame is left alone rather than dimmed flat. */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/35 to-ink/5" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/70 via-transparent to-transparent" />

        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="mx-auto w-full max-w-[1400px] px-5 md:px-10 pb-8 md:pb-12">
            <p className="font-label text-paper/75 mb-4">
              {content.eyebrow}
              <span aria-hidden className="mx-2 text-paper/40">·</span>
              <span className="tnum">
                {String(content.pieces).padStart(2, "0")}{" "}
                {content.pieces === 1 ? "piece" : "pieces"}
              </span>
            </p>

            <h1 className="font-display text-paper text-[clamp(2.6rem,8vw,5.4rem)] max-w-[14ch]">
              {headlineLines.map((line, i) => (
                <span key={i} className="block">
                  {line}
                </span>
              ))}
            </h1>

            {content.body && (
              <p className="mt-5 text-paper/80 max-w-[46ch] leading-snug text-[0.95rem]">
                {content.body}
              </p>
            )}

            <div className="mt-7 flex flex-wrap items-center gap-5">
              <Link href={`/collections/${content.slug}`} className="btn btn-light press">
                {content.ctaLabel || `Shop ${content.name}`}
              </Link>
              <Link
                href="/collections"
                className="font-label text-paper/75 border-b border-paper/40 pb-1 hover:text-paper hover:border-paper transition-colors"
              >
                All collections
              </Link>
            </div>

            {content.caption && (
              <p className="font-label text-paper/60 mt-6">{content.caption}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
