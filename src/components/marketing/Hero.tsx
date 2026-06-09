"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ArrowDown } from "lucide-react";
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

// Full-bleed campaign hero. The admin-managed hero image fills the viewport
// with the headline, copy and CTA overlaid on a scrim — image-led rather than
// typography-led. All content comes from the hero.* settings.
export function Hero({ content }: { content: HeroContent }) {
  const cyclingNouns = content.cycleWords;
  const longest =
    cyclingNouns.reduce((a, b) => (b.length > a.length ? b : a), "") || "long haul.";

  // ── Cycling italic noun in the headline ──────────────────────────────
  const [wordIdx, setWordIdx] = useState(0);
  useEffect(() => {
    if (cyclingNouns.length < 2) return;
    const id = setInterval(
      () => setWordIdx((i) => (i + 1) % cyclingNouns.length),
      2600
    );
    return () => clearInterval(id);
  }, [cyclingNouns.length]);

  // ── Live Lagos time ──────────────────────────────────────────────────
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => {
    const fmt = () =>
      new Intl.DateTimeFormat("en-NG", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: "Africa/Lagos",
      }).format(new Date());
    const id = setInterval(() => setNow(fmt()), 1000);
    return () => clearInterval(id);
  }, []);

  const headlineLines = content.headline.split("\n");

  return (
    <section className="relative w-full min-h-[88svh] flex flex-col bg-ink text-paper overflow-hidden">
      {/* Campaign image */}
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

      {/* Legibility scrims — heavier at the bottom where the copy sits */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/25 to-ink/30" />

      {/* Vermillion corner ticks */}
      <span className="absolute top-0 left-0 w-8 h-px bg-vermillion z-10" />
      <span className="absolute top-0 left-0 w-px h-8 bg-vermillion z-10" />
      <span className="absolute bottom-0 right-0 w-8 h-px bg-vermillion z-10" />
      <span className="absolute bottom-0 right-0 w-px h-8 bg-vermillion z-10" />

      {/* Top strip: eyebrow + live Lagos ticker */}
      <div className="relative z-10 mx-auto w-full max-w-[1400px] px-5 md:px-10 pt-6">
        <div
          className="flex items-center justify-between gap-4 rise"
          style={{ animationDelay: "0ms" }}
        >
          <p className="font-mono-tight text-paper/80">{content.eyebrow}</p>
          <p className="hidden sm:flex items-center font-mono-tight text-paper/80 gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-vermillion animate-breathe" />
            Lagos · {now ?? "—:—:—"} WAT
            <span className="inline-block w-[1px] h-3 bg-paper animate-blink ml-0.5" />
          </p>
        </div>
      </div>

      {/* Bottom block: headline, copy, CTAs */}
      <div className="relative z-10 mt-auto mx-auto w-full max-w-[1400px] px-5 md:px-10 pb-10 md:pb-16">
        <h1
          className="font-display text-[13vw] md:text-[7.5rem] xl:text-[8.5rem] leading-[0.88] tracking-[-0.04em] rise"
          style={{ animationDelay: "120ms" }}
        >
          {headlineLines.map((line, i) => (
            <span key={i}>
              {line}
              {i < headlineLines.length - 1 && <br />}
            </span>
          ))}

          {cyclingNouns.length > 0 && (
            <>
              <br />
              <span
                aria-live="polite"
                className="relative inline-block align-baseline"
                style={{ minWidth: "6ch", perspective: "600px" }}
              >
                {cyclingNouns.map((w, i) => (
                  <span
                    key={w + i}
                    aria-hidden={i !== wordIdx}
                    className="font-italic-accent text-vermillion absolute left-0 top-0 whitespace-nowrap"
                    style={{
                      animation: i === wordIdx ? "word-rise 2.6s ease both" : "none",
                      opacity: i === wordIdx ? undefined : 0,
                    }}
                  >
                    {w}
                  </span>
                ))}
                {/* Reserve baseline space using the longest candidate */}
                <span aria-hidden className="font-italic-accent invisible">
                  {longest}
                </span>
              </span>
            </>
          )}
        </h1>

        <div
          className="mt-7 md:mt-9 flex flex-col md:flex-row md:items-end md:justify-between gap-6 rise"
          style={{ animationDelay: "260ms" }}
        >
          <p className="font-italic-accent text-lg md:text-xl leading-snug text-paper/85 max-w-md">
            {content.body}
          </p>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href={content.ctaHref || "/shop"}
              className="inline-flex items-center gap-2 group bg-paper text-ink px-6 py-3.5 md:px-7 md:py-4 font-mono-tight hover:bg-vermillion hover:text-paper transition-colors"
            >
              {content.ctaLabel || "Shop now"}
              <ArrowUpRight
                size={15}
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
            <a
              href="#new-in"
              className="hidden md:inline-flex items-center gap-2 group border border-paper/60 text-paper px-6 py-4 font-mono-tight hover:border-paper hover:bg-paper/10 transition-colors"
            >
              New in
              <ArrowDown
                size={15}
                className="transition-transform group-hover:translate-y-0.5"
              />
            </a>
          </div>
        </div>

        {content.caption && (
          <p className="mt-6 rise" style={{ animationDelay: "380ms" }}>
            <span className="inline-block font-mono-tight bg-paper/90 backdrop-blur-sm text-ink px-2.5 py-1">
              {content.caption}
            </span>
          </p>
        )}
      </div>
    </section>
  );
}
