"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const cyclingNouns = ["ideas.", "hands.", "runs.", "drops.", "stains.", "marks."];

export function Hero() {
  // ── Cycling italic noun in the headline ──────────────────────────────
  const [wordIdx, setWordIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(
      () => setWordIdx((i) => (i + 1) % cyclingNouns.length),
      2600
    );
    return () => clearInterval(id);
  }, []);

  // ── Live Lagos time (driven by an interval; no synchronous setState in effect) ─
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

  // ── Mouse parallax on decorative ring cluster ────────────────────────
  // const ringWrap = useRef<HTMLDivElement>(null);
  // useEffect(() => {
  //   const el = ringWrap.current;
  //   if (!el) return;
  //   const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  //   if (reduce) return;
  //   const onMove = (e: PointerEvent) => {
  //     const w = window.innerWidth;
  //     const h = window.innerHeight;
  //     const dx = (e.clientX / w - 0.5) * 28;
  //     const dy = (e.clientY / h - 0.5) * 28;
  //     el.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
  //   };
  //   window.addEventListener("pointermove", onMove, { passive: true });
  //   return () => window.removeEventListener("pointermove", onMove);
  // }, []);

  return (
    <section className="relative pt-10 md:pt-16 pb-12 md:pb-16 overflow-hidden">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        {/* Eyebrow with live ticker */}
        <div
          className="flex items-center justify-between gap-4 rise"
          style={{ animationDelay: "0ms" }}
        >
          <p className="font-mono-tight text-ink/60">
            Issue 01 · Spring/Summer · Lagos
          </p>
          <p className="hidden sm:flex items-center font-mono-tight text-ink/60 gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-vermillion animate-breathe" />
            Lagos · {now ?? "—:—:—"} WAT
            <span className="inline-block w-[1px] h-3 bg-ink animate-blink ml-0.5" />
          </p>
        </div>

        <div className="mt-10 md:mt-16 grid grid-cols-12 gap-x-6 gap-y-8 items-end">
          {/* Display headline with cycling italic word */}
          <h1
            className="col-span-12 md:col-span-9 font-display text-[18vw] md:text-[10.5rem] leading-[0.86] tracking-[-0.04em] rise"
            style={{ animationDelay: "120ms" }}
          >
            Plain
            <span className="font-italic-accent text-vermillion"> cloth,</span>
            <br />
            stubborn
            <br />
            <span
              aria-live="polite"
              className="relative inline-block align-baseline"
              style={{ minWidth: "6ch", perspective: "600px" }}
            >
              {cyclingNouns.map((w, i) => (
                <span
                  key={w}
                  aria-hidden={i !== wordIdx}
                  className="font-italic-accent absolute left-0 top-0 whitespace-nowrap"
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
                stains.
              </span>
            </span>
          </h1>

          {/* Right column: paragraph + CTA */}
          <div
            className="col-span-12 md:col-span-3 md:pb-3 rise"
            style={{ animationDelay: "240ms" }}
          >
            <p className="font-italic-accent text-xl md:text-[1.35rem] leading-snug text-ink-soft max-w-sm md:max-w-none">
              Shoptees is a small Nigerian wardrobe studio.{" "}
              <span className="text-ink/55">
                [PLACEHOLDER: replace with verbatim brand statement.]
              </span>
            </p>
            <Link
              href="/shop"
              className="mt-6 inline-flex items-center gap-2 group"
            >
              <span className="relative font-mono-tight text-ink before:absolute before:left-0 before:right-0 before:bottom-[-3px] before:h-px before:bg-ink before:transition-transform before:origin-left group-hover:before:scale-x-0">
                Shop the collection
              </span>
              <ArrowUpRight
                size={16}
                className="text-vermillion transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
          </div>
        </div>

        {/* Hero footer band */}
        {/* <div
          className="mt-14 md:mt-16 grid grid-cols-12 gap-6 border-t border-line pt-5 rise"
          style={{ animationDelay: "360ms" }}
        >
          <div className="col-span-6 md:col-span-3">
            <p className="font-mono-tight text-ink/55">Made</p>
            <p className="font-display text-xl">in Lagos, Nigeria</p>
          </div>
          <div className="col-span-6 md:col-span-3">
            <p className="font-mono-tight text-ink/55">Cotton</p>
            <p className="font-display text-xl">220–260 gsm</p>
          </div>
          <div className="col-span-6 md:col-span-3">
            <p className="font-mono-tight text-ink/55">Pieces</p>
            <p className="font-display text-xl">[PLACEHOLDER]</p>
          </div>
          <div className="col-span-6 md:col-span-3">
            <p className="font-mono-tight text-ink/55">Ships</p>
            <p className="font-display text-xl">Worldwide</p>
          </div>
        </div> */}
      </div>

      {/* Banner — full-bleed editorial banner image */}
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
            src="/hero2.webp"
            alt="Shoptees — current collection banner"
            fill
            sizes="(max-width: 1400px) 100vw, 1400px"
            priority
            className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.02]"
          />

          {/* Caption strip overlaid on the bottom-left */}
          <figcaption className="absolute bottom-3 left-3 md:bottom-5 md:left-5 z-10">
            <span className="inline-block font-mono-tight bg-paper/90 backdrop-blur-sm text-ink px-2.5 py-1">
            · THE CLASSIC collection ·
            </span>
          </figcaption>
        </figure>
      </div>

      {/* Decorative concentric rings — breathe + counter-rotate + mouse parallax */}
      {/* <div
        ref={ringWrap}
        className="pointer-events-none absolute -right-24 top-20 w-[460px] hidden md:block transition-transform duration-700 ease-out"
        aria-hidden
      >
        <svg viewBox="0 0 400 400" className="w-full">
          <g className="animate-spin-slow" style={{ transformOrigin: "200px 200px" }}>
            <circle cx="200" cy="200" r="180" fill="none" stroke="#d4441e" strokeWidth="1.2" strokeDasharray="3 7" />
          </g>
          <g className="animate-spin-reverse" style={{ transformOrigin: "200px 200px" }}>
            <circle cx="200" cy="200" r="140" fill="none" stroke="#d4441e" strokeWidth="1.2" />
            <circle cx="200" cy="200" r="100" fill="none" stroke="#d4441e" strokeWidth="1" strokeDasharray="1 4" />
          </g>
          <g className="animate-breathe" style={{ transformOrigin: "200px 200px" }}>
            <circle cx="200" cy="200" r="60" fill="#d4441e" />
            <text
              x="200"
              y="206"
              textAnchor="middle"
              fontFamily="JetBrains Mono, monospace"
              fontSize="14"
              letterSpacing="3"
              fill="#f4efe6"
            >
              SS · 26
            </text>
          </g>
        </svg>
      </div> */}
    </section>
  );
}
