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
    <section className="bg-ink text-paper py-20 md:py-24 mt-24 grain">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10 grid grid-cols-12 gap-8 items-end">
        <div className="col-span-12 md:col-span-7">
          <span className="stamp text-vermillion">Dispatch list</span>
          <h2 className="font-display text-5xl md:text-7xl leading-[0.95] mt-3">
            First to know
            <br />
            <span className="text-vermillion">when it drops.</span>
          </h2>
          <p className="mt-5 text-base md:text-lg text-paper/70 max-w-md">
            Drops, restocks, nothing else. No spam — we&apos;re busy packing boxes.
          </p>
        </div>

        <form onSubmit={onSubmit} className="col-span-12 md:col-span-5">
          {submitted ? (
            <p className="font-display text-2xl">
              {alreadySubscribed ? (
                <>
                  Already on the list.{" "}
                  <span className="text-vermillion">See you at the next drop.</span>
                </>
              ) : (
                <>
                  <span className="stamp stamp-in text-vermillion mr-2">Logged</span>
                  You&apos;re on the list.
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
                  className="flex-1 min-w-0 bg-transparent px-4 py-3.5 outline-none placeholder:text-paper/35 font-mono-tight text-sm"
                />
                <button
                  type="submit"
                  disabled={pending}
                  className="font-condensed text-[0.78rem] px-5 py-3.5 bg-paper text-ink hover:bg-vermillion hover:text-paper transition-colors duration-200 disabled:opacity-50 shrink-0"
                >
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
                <p className="mt-3 font-mono-tight text-paper/85 bg-vermillion/20 border-l-[3px] border-vermillion px-3 py-2">
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
