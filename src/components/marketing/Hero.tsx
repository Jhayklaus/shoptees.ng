"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
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

export type HeroStats = {
  collections: number;
  pieces: number;
};

/**
 * Split hero: a type panel against a full-height image, not a headline
 * floated over the middle of a photograph.
 *
 * The old arrangement was the centred-headline-plus-two-buttons pattern, and
 * it had a concrete problem beyond being a cliché: the copy sat on top of a
 * busy rack shot, so the type fought the picture and neither won. Giving each
 * its own half lets the image be a full-bleed image and the headline be
 * readable, and the asymmetric split (the panel is fractionally wider than
 * the image) keeps it from reading as a tidy 50/50 template.
 *
 * Everything here is still admin-managed via the hero banner / hero.* settings.
 */
export function Hero({ content, stats }: { content: HeroContent; stats: HeroStats }) {
  const headlineLines = content.headline.split("\n").filter(Boolean);

  return (
    <section className="relative grid lg:grid-cols-[1.02fr_.98fr] bg-ink text-paper">
      {/* ── Type panel ─────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col px-5 md:px-10 pt-8 md:pt-11 pb-9 md:pb-12 lg:min-h-[38rem] grain grain-dark">
        <div className="relative z-10 flex items-start justify-between gap-4 mb-auto">
          {content.eyebrow && (
            <p className="font-mono-tight text-tan">{content.eyebrow}</p>
          )}
          <p className="font-mono-tight text-paper/55 tnum">Lagos · NG</p>
        </div>

        <h1 className="relative z-10 font-display text-[clamp(2.7rem,9vw,5.6rem)] mt-10">
          {headlineLines.map((line, i) => (
            <span key={i} className="block">
              {line}
            </span>
          ))}
          <CyclingWord words={content.cycleWords} />
        </h1>

        {/* Counts, as a ruled rail. Real figures from the catalogue — the
            kind of detail a line sheet carries and a template doesn't. */}
        <dl className="relative z-10 flex flex-wrap mt-7 border-t border-line-dark">
          <Stat label="Collections" value={String(stats.collections).padStart(2, "0")} />
          <Stat label="Pieces" value={String(stats.pieces).padStart(2, "0")} />
          <Stat label="Dispatch" value="Nationwide" last />
        </dl>

        {/* One primary action and a text link — not two buttons of equal
            weight, which is the pattern this hero is deliberately avoiding. */}
        <div className="relative z-10 flex flex-wrap items-center gap-x-7 gap-y-4 mt-7">
          <Link href={content.ctaHref || "/shop"} className="btn btn-light press">
            {content.ctaLabel || "Shop the drop"}
            <ArrowUpRight size={15} />
          </Link>
          <a
            href="#new-in"
            className="font-mono-tight text-tan border-b border-current pb-0.5 hover:text-paper transition-colors"
          >
            What&apos;s new
          </a>
        </div>
      </div>

      {/* ── Image panel ────────────────────────────────────────────── */}
      <div className="relative min-h-[19rem] sm:min-h-[24rem] lg:min-h-full overflow-hidden bg-line-dark order-first lg:order-none">
        {content.imageUrl && (
          <Image
            src={content.imageUrl}
            alt={content.imageAlt}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
            className="object-cover"
          />
        )}
        {content.caption && (
          <span className="absolute left-0 bottom-0 z-10 bg-vermillion text-paper font-mono-tight px-3 py-2">
            {content.caption}
          </span>
        )}
      </div>
    </section>
  );
}

function Stat({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={`py-3 pr-5 ${last ? "" : "mr-5 border-r border-line-dark"}`}>
      <dt className="font-mono-tight text-paper/55">{label}</dt>
      <dd className="font-sub text-base mt-1">{value}</dd>
    </div>
  );
}

/**
 * The rotating last line of the headline, admin-managed via `cycleWords`.
 *
 * Rewritten so a word is ALWAYS on screen. The previous version animated each
 * word out to opacity 0 at the end of its own 2.6s cycle, which left a beat
 * with nothing in the slot — on mobile the headline regularly read "built for
 * the" followed by a gap. Now only the entrance is animated and the word
 * holds until the next one replaces it, so the sentence is never unfinished.
 */
function CyclingWord({ words }: { words: string[] }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (words.length < 2) return;
    const id = setInterval(() => setI((n) => (n + 1) % words.length), 3000);
    return () => clearInterval(id);
  }, [words.length]);

  if (words.length === 0) return null;
  const word = words[i % words.length];

  return (
    <span className="block text-tan" aria-live="polite">
      {/* Keyed so the clip-reveal replays on each change; no exit state, so
          the slot is never empty. */}
      <span key={word + i} className="inline-block word-in">
        {word}
      </span>
    </span>
  );
}
