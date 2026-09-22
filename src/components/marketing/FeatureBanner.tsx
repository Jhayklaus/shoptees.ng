import Image from "next/image";
import Link from "next/link";

/**
 * Wide editorial banner: one image, a serif headline over it, a text link.
 *
 * This is one of only two places the serif display voice appears on a page —
 * the hero being the other. Both sit on a photograph, which is what earns
 * the size. Section headers elsewhere stay small sans, and that contrast is
 * what gives the page a hierarchy instead of a uniform shout.
 */
export function FeatureBanner({
  image,
  imageAlt,
  eyebrow,
  headline,
  body,
  ctaLabel,
  ctaHref,
  tone = "dark",
  height = "md",
}: {
  image: string;
  imageAlt: string;
  eyebrow?: string;
  headline: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
  /** `dark` scrims the image and sets light type; `light` inverts it. */
  tone?: "dark" | "light";
  height?: "md" | "lg";
}) {
  const light = tone === "light";

  return (
    <section
      className={`relative overflow-hidden ${light ? "bg-shot" : "bg-ink"} ${
        height === "lg" ? "h-[26rem] md:h-[32rem]" : "h-[19rem] md:h-[24rem]"
      }`}
    >
      <Image src={image} alt={imageAlt} fill sizes="100vw" className="object-cover" />

      <div
        className={
          light
            ? "absolute inset-0 bg-gradient-to-r from-paper/90 via-paper/55 to-transparent"
            : "absolute inset-0 bg-gradient-to-r from-ink/88 via-ink/50 to-transparent"
        }
      />

      <div className="absolute inset-0 flex items-center">
        <div className="mx-auto w-full max-w-[1400px] px-5 md:px-10">
          <div className="max-w-[34ch]">
            {eyebrow && (
              <p className={`font-label mb-3 ${light ? "text-muted" : "text-paper/70"}`}>
                {eyebrow}
              </p>
            )}
            <h2
              className={`font-display text-[clamp(1.9rem,5vw,3.4rem)] ${
                light ? "text-ink" : "text-paper"
              }`}
            >
              {headline}
            </h2>
            {body && (
              <p
                className={`mt-4 leading-snug text-[0.95rem] max-w-[38ch] ${
                  light ? "text-ink-soft" : "text-paper/80"
                }`}
              >
                {body}
              </p>
            )}
            {ctaLabel && (
              <Link
                href={ctaHref || "/shop"}
                className={`font-label mt-6 inline-block border-b pb-1 transition-colors ${
                  light
                    ? "text-ink border-ink hover:text-vermillion hover:border-vermillion"
                    : "text-paper border-paper/60 hover:border-paper"
                }`}
              >
                {ctaLabel} →
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
