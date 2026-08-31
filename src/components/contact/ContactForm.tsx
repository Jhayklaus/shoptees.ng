"use client";

import { useState, useTransition } from "react";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("c-name") ?? ""),
      email: String(fd.get("c-email") ?? ""),
      message: String(fd.get("c-msg") ?? ""),
      website: String(fd.get("c-website") ?? ""),
    };

    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.error ?? "Could not send your message. Please try again.");
        return;
      }
      setSubmitted(true);
    });
  };

  return (
    <form
      onSubmit={onSubmit}
      className="col-span-12 md:col-span-6 md:col-start-7 relative border-2 border-ink p-6 md:p-10 shadow-[6px_6px_0_0_var(--ink)]"
    >
      <span className="absolute top-0 right-0 w-8 h-[3px] bg-vermillion" />
      <span className="absolute top-0 right-0 w-[3px] h-8 bg-vermillion" />

      <span className="stamp text-ink/60">A note</span>
      <h2 className="font-display text-4xl mt-2">
        Or leave a message <span className="text-vermillion">here.</span>
      </h2>

      {submitted ? (
        <p className="mt-8 font-display text-2xl">
          Thank you —{" "}
          <span className="text-vermillion">we&apos;ll write back within a day.</span>
        </p>
      ) : (
        <>
          <div className="mt-8 space-y-5">
            <Field id="c-name" label="Name" required />
            <Field id="c-email" label="Email" type="email" required />
            <div className="border-b-2 border-line py-2 focus-within:border-vermillion transition-colors">
              <label htmlFor="c-msg" className="font-mono-tight text-ink/55">
                Message
              </label>
              <textarea
                id="c-msg"
                name="c-msg"
                rows={4}
                required
                className="w-full bg-transparent py-1 outline-none font-display text-lg resize-none"
              />
            </div>
          </div>

          {/* Honeypot — visually hidden, real users won't fill it. */}
          <div aria-hidden className="absolute -left-[9999px] w-px h-px overflow-hidden">
            <label htmlFor="c-website">Website</label>
            <input id="c-website" name="c-website" tabIndex={-1} autoComplete="off" />
          </div>

          {error && (
            <p className="mt-4 bg-vermillion/10 border-l-[3px] border-vermillion px-3 py-2 font-mono-tight text-ink-soft">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="btn-wipe btn-wipe-hazard press mt-8 w-full bg-ink text-paper py-4 font-condensed text-[0.82rem] transition-colors duration-200 disabled:opacity-50"
          >
            {pending ? "Sending…" : "Send →"}
          </button>
        </>
      )}
    </form>
  );
}

function Field({
  id,
  label,
  type = "text",
  required,
}: {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="border-b-2 border-line py-2 focus-within:border-vermillion transition-colors">
      <label htmlFor={id} className="font-mono-tight text-ink/55">
        {label}
        {required && <span className="text-vermillion"> *</span>}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        required={required}
        className="w-full bg-transparent py-1 outline-none font-display text-lg"
      />
    </div>
  );
}
