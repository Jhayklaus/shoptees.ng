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
    <section className="bg-ink text-paper py-16 md:py-24 grain grain-dark">
      <div className="relative z-10 mx-auto max-w-[1400px] px-5 md:px-10 grid gap-8 md:grid-cols-[1.1fr_.9fr] md:gap-14 md:items-end">
        <div>
          <p className="font-mono-tight text-tan">Dispatch list</p>
          <h2 className="font-display text-[clamp(2rem,6vw,3.6rem)] mt-3">
            First to know
            <span className="block text-tan">when it drops.</span>
          </h2>
          <p className="mt-5 text-paper/70 max-w-sm leading-snug">
            Drops, restocks, nothing else. No spam — we&apos;re busy packing boxes.
          </p>
        </div>

        <form onSubmit={onSubmit}>
          {submitted ? (
            <p className="font-sub text-xl leading-snug">
              {alreadySubscribed ? (
                <>
                  Already on the list.{" "}
                  <span className="text-tan">See you at the next drop.</span>
                </>
              ) : (
                <>
                  You&apos;re on the list.{" "}
                  <span className="text-tan">Watch your inbox.</span>
                </>
              )}
            </p>
          ) : (
            <>
              <div className="flex border-2 border-paper">
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="YOUR@EMAIL.COM"
                  className="flex-1 min-w-0 bg-transparent px-4 py-3.5 outline-none placeholder:text-paper/55 font-mono-tight text-paper"
                />
                <button type="submit" disabled={pending} className="btn btn-light shrink-0 border-0">
                  {pending ? "…" : "Sign up"}
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
                <p className="mt-3 font-mono-tight text-paper border-l-2 border-tan pl-3 py-2 normal-case">
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
