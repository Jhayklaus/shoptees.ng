"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

export type HeroContent = {
  eyebrow: string;
  headline: string; // newline-separated lines, rendered above the cycling word
  cycleWords: string[];
  body: string;
  ctaLabel: string;
  ctaHref: string;
  imageUrl: string;
  imageAlt: string;
  caption: string;
};

/**
 * Full-bleed campaign hero: one image, copy anchored bottom-left.
 *
 * Bottom-left rather than centred. A centred headline with a paragraph and a
 * pair of buttons under it is the single most generic opening a storefront
 * can have, and it also put the copy in the middle of the picture where the
 * subject usually is. Anchoring it to a corner leaves the photograph intact
 * and gives the block a direction to read in.
 *
 * All of it is admin-managed — hero banner first, hero.* settings as fallback.
 */
export function Hero({ content }: { content: HeroContent }) {
  const headlineLines = content.headline.split("\n").filter(Boolean);

  return (
    <section className="relative bg-ink">
      <div className="relative h-[78svh] min-h-[28rem] max-h-[46rem] w-full overflow-hidden">
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
            {content.eyebrow && (
              <p className="font-label text-paper/80 mb-4">{content.eyebrow}</p>
            )}

            <h1 className="font-display text-paper text-[clamp(2.6rem,8vw,5.4rem)] max-w-[15ch]">
              {headlineLines.map((line, i) => (
                <span key={i} className="block">
                  {line}
                </span>
              ))}
              <CyclingWord words={content.cycleWords} />
            </h1>

            {content.body && (
              <p className="mt-5 text-paper/80 max-w-[42ch] leading-snug text-[0.95rem]">
                {content.body}
              </p>
            )}

            <div className="mt-7 flex flex-wrap items-center gap-5">
              <Link href={content.ctaHref || "/shop"} className="btn btn-light press">
                {content.ctaLabel || "Shop new arrivals"}
              </Link>
              {content.caption && (
                <span className="font-label text-paper/70">{content.caption}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * The rotating last line of the headline, admin-managed via `cycleWords`.
 *
 * A word is ALWAYS on screen. The previous version animated each word out to
 * opacity 0 at the end of its own cycle, which left a beat with nothing in
 * the slot — on mobile the headline regularly read "built for the" followed
 * by a gap. Only the entrance is animated now; the word holds until replaced.
 */
function CyclingWord({ words }: { words: string[] }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (words.length < 2) return;
    const id = setInterval(() => setI((n) => (n + 1) % words.length), 3200);
    return () => clearInterval(id);
  }, [words.length]);

  if (words.length === 0) return null;
  const word = words[i % words.length];

  return (
    <span className="block" aria-live="polite">
      <span key={word + i} className="inline-block word-in">
        {word}
      </span>
    </span>
  );
}
