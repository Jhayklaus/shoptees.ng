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
  align = "left",
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
  /**
   * Which side the copy sits on. The scrim follows it, so the exposed half
   * of the photograph is always the half opposite the text — which is what
   * lets a stack of these alternate without any of them hiding its subject.
   */
  align?: "left" | "right";
}) {
  const light = tone === "light";
  const right = align === "right";

  return (
    <section
      className={`relative overflow-hidden ${light ? "bg-shot" : "bg-ink"} ${
        height === "lg" ? "h-[26rem] md:h-[32rem]" : "h-[19rem] md:h-[24rem]"
      }`}
    >
      <Image
        src={image}
        alt={imageAlt}
        fill
        sizes="100vw"
        className="object-cover"
      />

      {/* Two scrims in one, switched at md.
          Below md the copy box is wider than the viewport, so it spans the
          full frame and there is no side for the scrim to favour — a
          directional one leaves half the text on its transparent end, over
          whatever the photograph happens to be doing there. So narrow gets a
          near-flat wash, and the art-directed asymmetry starts at md, which
          is the first width where the copy actually occupies one half. */}
      <div
        className={[
          "absolute inset-0 bg-gradient-to-r",
          right ? "md:bg-gradient-to-l" : "",
          light
            ? "from-paper/92 via-paper/84 to-paper/68 md:via-paper/55 md:to-transparent"
            : "from-ink/88 via-ink/78 to-ink/62 md:via-ink/50 md:to-transparent",
        ].join(" ")}
      />

      <div className="absolute inset-0 flex items-center">
        <div className="mx-auto w-full max-w-[1400px] px-5 md:px-10">
          <div className={`max-w-[34ch] ${right ? "ml-auto" : ""}`}>
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
