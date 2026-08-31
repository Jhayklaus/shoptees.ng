"use client";

import { TransitionLink as Link } from "@/components/motion/TransitionLink";
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

// Full-bleed campaign hero. Admin-managed image fills the viewport with the
// headline stacked on top like crate-stencil type. Signature moment: the
// rotating rubber-stamp Lagos clock (see StampClock below).
export function Hero({ content }: { content: HeroContent }) {
  const cyclingNouns = content.cycleWords;
  const longest =
    cyclingNouns.reduce((a, b) => (b.length > a.length ? b : a), "") || "long haul.";

  // ── Cycling headline word ────────────────────────────────────────────
  const [wordIdx, setWordIdx] = useState(0);
  useEffect(() => {
    if (cyclingNouns.length < 2) return;
    const id = setInterval(
      () => setWordIdx((i) => (i + 1) % cyclingNouns.length),
      2600
    );
    return () => clearInterval(id);
  }, [cyclingNouns.length]);

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

      {/* Legibility scrim — heavier at the bottom where the copy sits */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-ink/20" />

      {/* Crate corner brackets */}
      <span className="absolute top-0 left-0 w-10 h-[3px] bg-tan z-10" />
      <span className="absolute top-0 left-0 w-[3px] h-10 bg-tan z-10" />
      <span className="absolute bottom-0 right-0 w-10 h-[3px] bg-tan z-10" />
      <span className="absolute bottom-0 right-0 w-[3px] h-10 bg-tan z-10" />

      {/* Top strip: eyebrow stamp + rotating stamp-clock */}
      <div className="relative z-10 mx-auto w-full max-w-[1400px] px-5 md:px-10 pt-6 flex items-start justify-between gap-4">
        <p className="stamp stamp-straight text-paper/90 rise" style={{ animationDelay: "0ms" }}>
          {content.eyebrow}
        </p>
        <StampClock />
      </div>

      {/* Bottom block: headline, copy, CTAs — centered and moderate so the
          campaign image stays the star */}
      <div className="relative z-10 mt-auto mx-auto w-full max-w-2xl px-5 md:px-10 pb-10 md:pb-14 text-center">
        <h1
          className="font-display text-3xl sm:text-4xl md:text-5xl leading-[0.95] rise"
          style={{ animationDelay: "100ms" }}
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
              >
                {cyclingNouns.map((w, i) => (
                  <span
                    key={w + i}
                    aria-hidden={i !== wordIdx}
                    className="text-tan absolute inset-x-0 top-0 whitespace-nowrap"
                    style={{
                      animation: i === wordIdx ? "word-rise 2.6s var(--ease-snap) both" : "none",
                      opacity: i === wordIdx ? undefined : 0,
                    }}
                  >
                    {w}
                  </span>
                ))}
                {/* Reserve baseline space using the longest candidate */}
                <span aria-hidden className="invisible">
                  {longest}
                </span>
              </span>
            </>
          )}
        </h1>

        <div
          className="mt-6 md:mt-8 flex flex-col items-center gap-6 rise"
          style={{ animationDelay: "220ms" }}
        >
          <p className="text-sm md:text-base leading-snug text-paper/85 max-w-sm font-medium">
            {content.body}
          </p>

          <div className="flex items-center justify-center gap-3 shrink-0">
            <Link
              href={content.ctaHref || "/shop"}
              className="btn-wipe btn-wipe-hazard press inline-flex items-center gap-2 group bg-paper text-ink px-6 py-3.5 md:px-7 md:py-4 font-condensed text-[0.8rem] hover:text-paper transition-colors duration-200"
            >
              {content.ctaLabel || "Shop now"}
              <ArrowUpRight
                size={15}
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
            <a
              href="#new-in"
              className="hidden md:inline-flex items-center gap-2 group border-2 border-paper/70 text-paper px-6 py-[0.85rem] font-condensed text-[0.8rem] hover:border-paper hover:bg-paper/10 transition-colors"
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
          <p className="mt-6 rise" style={{ animationDelay: "340ms" }}>
            <span className="stamp bg-paper/90 text-ink backdrop-blur-sm">
              {content.caption}
            </span>
          </p>
        )}
      </div>
    </section>
  );
}

// ── Signature moment: rotating rubber-stamp Lagos clock ───────────────────
// Circular "SHOPTEES · LAGOS · NIGERIA" text spins slowly around a live WAT
// clock. The time chip re-stamps (thunk) whenever the minute ticks over.
function StampClock() {
  const [now, setNow] = useState<{ hm: string; s: string } | null>(null);

  useEffect(() => {
    const fmt = () => {
      const parts = new Intl.DateTimeFormat("en-NG", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: "Africa/Lagos",
      }).formatToParts(new Date());
      const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
      return { hm: `${get("hour")}:${get("minute")}`, s: get("second") };
    };
    setNow(fmt());
    const id = setInterval(() => setNow(fmt()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="relative hidden sm:flex items-center justify-center w-24 h-24 md:w-28 md:h-28 shrink-0 rise"
      aria-hidden
    >
      {/* Rotating circular text */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 animate-spin-slow text-paper/85">
        <defs>
          <path
            id="stamp-circle"
            d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0"
          />
        </defs>
        <circle cx="50" cy="50" r="47" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="29" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.6" />
        <text
          className="fill-current"
          style={{
            fontSize: "9.5px",
            letterSpacing: "0.22em",
            fontFamily: "var(--font-martian), monospace",
            fontWeight: 700,
          }}
        >
          <textPath href="#stamp-circle">SHOPTEES · LAGOS · NIGERIA ·</textPath>
        </text>
      </svg>

      {/* Live WAT time — re-keys each minute so it "thunks" a re-stamp */}
      <span
        key={now?.hm ?? "--"}
        className="stamp-in relative font-mono-tight text-paper text-[0.7rem] font-bold flex flex-col items-center leading-tight"
      >
        {now?.hm ?? "--:--"}
        <span className="text-tan text-[0.55rem]">{now ? `:${now.s} WAT` : "WAT"}</span>
      </span>
    </div>
  );
}
