"use client";

import { useState, useTransition } from "react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [alreadySubscribed, setAlreadySubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, website }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.error ?? "Could not subscribe. Please try again.");
        return;
      }
      setAlreadySubscribed(Boolean(body.alreadySubscribed));
      setSubmitted(true);
    });
  };

  return (
    <section className="bg-paper-deep py-24 my-24">
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

        <form onSubmit={onSubmit} className="col-span-12 md:col-span-5">
          {submitted ? (
            <p className="font-display text-2xl">
              {alreadySubscribed ? (
                <>
                  You&apos;re already on the list.{" "}
                  <span className="font-italic-accent text-vermillion">
                    See you at the next drop.
                  </span>
                </>
              ) : (
                <>
                  Thank you — saved.{" "}
                  <span className="font-italic-accent text-vermillion">
                    The next letter goes out at the next drop.
                  </span>
                </>
              )}
            </p>
          ) : (
            <>
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
                  disabled={pending}
                  className="font-mono-tight px-4 py-3 hover:text-vermillion transition-colors disabled:opacity-50"
                >
                  {pending ? "…" : "Subscribe →"}
                </button>
              </div>
              {/* Honeypot. */}
              <div aria-hidden className="absolute -left-[9999px] w-px h-px overflow-hidden">
                <label htmlFor="newsletter-website">Website</label>
                <input
                  id="newsletter-website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>
              {error && (
                <p className="mt-3 font-mono-tight text-ink-soft bg-vermillion/10 border-l-2 border-vermillion px-3 py-2">
                  {error}
                </p>
              )}
            </>
          )}
        </form>
      </div>
    </section>
  );
}
