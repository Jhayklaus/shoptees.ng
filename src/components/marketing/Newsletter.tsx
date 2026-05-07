"use client";

import { useState } from "react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="bg-paper-deep py-24">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10 grid grid-cols-12 gap-6 items-end">
        <div className="col-span-12 md:col-span-7">
          <p className="font-mono-tight text-ink/55 mb-3">Letters · 03</p>
          <h2 className="font-display text-5xl md:text-7xl tracking-tight leading-[0.95]">
            One short note
            <br />
            <span className="font-italic-accent text-vermillion">a season.</span>
          </h2>
          <p className="mt-5 font-italic-accent text-xl text-ink/70 max-w-md">
            Drops, restocks, a few photographs. Never more than four times a year.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            // TODO: wire to mailing list provider once user picks one (ConvertKit / Beehiiv / Resend).
            setSubmitted(true);
          }}
          className="col-span-12 md:col-span-5"
        >
          {submitted ? (
            <p className="font-display text-2xl">
              Thank you — saved.{" "}
              <span className="font-italic-accent text-vermillion">
                The next letter goes out at the next drop.
              </span>{" "}
              <span className="font-mono-tight text-ink/55">
                [PLACEHOLDER: not yet wired to a mailing-list provider]
              </span>
            </p>
          ) : (
            <div className="flex border-b-2 border-ink">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 bg-transparent py-3 outline-none placeholder:text-ink/40 font-display text-xl"
              />
              <button
                type="submit"
                className="font-mono-tight px-4 py-3 hover:text-vermillion transition-colors"
              >
                Subscribe →
              </button>
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
