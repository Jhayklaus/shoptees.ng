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
    <section className="relative pt-10 md:pt-16 pb-12 md:pb-16 overflow-hidden">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        {/* Eyebrow with live ticker */}
        <div
          className="flex items-center justify-between gap-4 rise"
          style={{ animationDelay: "0ms" }}
        >
          <p className="font-mono-tight text-ink/60">{content.eyebrow}</p>
          <p className="hidden sm:flex items-center font-mono-tight text-ink/60 gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-vermillion animate-breathe" />
            Lagos · {now ?? "—:—:—"} WAT
            <span className="inline-block w-[1px] h-3 bg-ink animate-blink ml-0.5" />
          </p>
        </div>

        <div className="mt-10 md:mt-16 grid grid-cols-12 gap-x-6 gap-y-8 items-end">
          {/* Display headline with cycling italic word */}
          <h1
            className="col-span-12 md:col-span-9 font-display text-[14vw] md:text-[10.5rem] leading-[0.86] tracking-[-0.04em] rise"
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

          {/* Right column: paragraph + CTA */}
          <div
            className="col-span-12 md:col-span-3 md:pb-3 rise"
            style={{ animationDelay: "240ms" }}
          >
            <p className="font-italic-accent text-xl md:text-[1.35rem] leading-snug text-ink-soft max-w-sm md:max-w-none">
              {content.body}
            </p>
            <Link
              href={content.ctaHref || "/shop"}
              className="mt-6 inline-flex items-center gap-2 group"
            >
              <span className="relative font-mono-tight text-ink before:absolute before:left-0 before:right-0 before:bottom-[-3px] before:h-px before:bg-ink before:transition-transform before:origin-left group-hover:before:scale-x-0">
                {content.ctaLabel}
              </span>
              <ArrowUpRight
                size={16}
                className="text-vermillion transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
          </div>
        </div>
      </div>

      {/* Banner — full-bleed editorial banner image */}
      {content.imageUrl && (
        <div
          className="mt-14 md:mt-20 mx-auto max-w-[1400px] px-5 md:px-10 rise"
          style={{ animationDelay: "480ms" }}
        >
          <figure className="relative group overflow-hidden bg-paper-deep aspect-[3/1]">
            {/* Vermillion frame accents — corner ticks */}
            <span className="absolute top-0 left-0 w-6 h-px bg-vermillion z-10" />
            <span className="absolute top-0 left-0 w-px h-6 bg-vermillion z-10" />
            <span className="absolute top-0 right-0 w-6 h-px bg-vermillion z-10" />
            <span className="absolute top-0 right-0 w-px h-6 bg-vermillion z-10" />
            <span className="absolute bottom-0 left-0 w-6 h-px bg-vermillion z-10" />
            <span className="absolute bottom-0 left-0 w-px h-6 bg-vermillion z-10" />
            <span className="absolute bottom-0 right-0 w-6 h-px bg-vermillion z-10" />
            <span className="absolute bottom-0 right-0 w-px h-6 bg-vermillion z-10" />

            <Image
              src={content.imageUrl}
              alt={content.imageAlt}
              fill
              sizes="(max-width: 1400px) 100vw, 1400px"
              priority
              className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.02]"
            />

            {content.caption && (
              <figcaption className="absolute bottom-3 left-3 md:bottom-5 md:left-5 z-10">
                <span className="inline-block font-mono-tight bg-paper/90 backdrop-blur-sm text-ink px-2.5 py-1">
                  {content.caption}
                </span>
              </figcaption>
            )}
          </figure>
        </div>
      )}
    </section>
  );
}
