import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative pt-10 md:pt-16 pb-20 md:pb-32 overflow-hidden">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        {/* Eyebrow */}
        <div className="flex items-center justify-between rise" style={{ animationDelay: "0ms" }}>
          <p className="font-mono-tight text-ink/60">
            Issue 01 · Spring/Summer · Lagos
          </p>
          <p className="hidden md:block font-mono-tight text-ink/60">
            05 · 26 · A studio in cotton &amp; ink
          </p>
        </div>

        <div className="mt-10 md:mt-16 grid grid-cols-12 gap-x-6 gap-y-8 items-end">
          {/* Display headline — asymmetric, item-italic for emphasis */}
          <h1
            className="col-span-12 md:col-span-9 font-display text-[18vw] md:text-[10.5rem] leading-[0.86] tracking-[-0.04em] rise"
            style={{ animationDelay: "120ms" }}
          >
            Plain
            <span className="font-italic-accent text-vermillion"> cloth,</span>
            <br />
            stubborn
            <br />
            <span className="font-italic-accent">ideas.</span>
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
        <div
          className="mt-14 md:mt-20 grid grid-cols-12 gap-6 border-t border-line pt-5 rise"
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
        </div>
      </div>

      {/* Decorative vermillion arc */}
      <svg
        aria-hidden
        className="pointer-events-none absolute -right-20 top-24 w-[420px] hidden md:block opacity-90"
        viewBox="0 0 400 400"
      >
        <circle cx="200" cy="200" r="180" fill="none" stroke="#d4441e" strokeWidth="1.2" />
        <circle cx="200" cy="200" r="140" fill="none" stroke="#d4441e" strokeWidth="1.2" />
        <circle cx="200" cy="200" r="100" fill="none" stroke="#d4441e" strokeWidth="1.2" />
        <circle cx="200" cy="200" r="60" fill="#d4441e" opacity="0.95" />
      </svg>
    </section>
  );
}
