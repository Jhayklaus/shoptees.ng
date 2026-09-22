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
      className="col-span-12 md:col-span-6 md:col-start-7 border border-line bg-shot p-6 md:p-9"
    >

      <p className="font-label text-muted">A note</p>
      <h2 className="font-display text-[clamp(1.5rem,3.5vw,2.2rem)] mt-2">
        Or leave a message here
      </h2>

      {submitted ? (
        <p className="mt-8 font-sub text-lg leading-snug">
          Thank you —{" "}
          we&apos;ll write back within a day.
        </p>
      ) : (
        <>
          <div className="mt-8 space-y-5">
            <Field id="c-name" label="Name" required />
            <Field id="c-email" label="Email" type="email" required />
            <div className="border-b-2 border-line py-2 focus-within:border-vermillion transition-colors">
              <label htmlFor="c-msg" className="font-label text-muted">
                Message
              </label>
              <textarea
                id="c-msg"
                name="c-msg"
                rows={4}
                required
                className="w-full bg-transparent py-1 outline-none font-sub text-[0.98rem] resize-none"
              />
            </div>
          </div>

          {/* Honeypot — visually hidden, real users won't fill it. */}
          <div aria-hidden className="absolute -left-[9999px] w-px h-px overflow-hidden">
            <label htmlFor="c-website">Website</label>
            <input id="c-website" name="c-website" tabIndex={-1} autoComplete="off" />
          </div>

          {error && (
            <p className="mt-4 bg-vermillion/10 border-l-[3px] border-vermillion px-3 py-2 font-label text-ink-soft">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="btn press mt-8 w-full py-4"
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
      <label htmlFor={id} className="font-label text-muted">
        {label}
        {required && <span className="text-vermillion"> *</span>}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        required={required}
        className="w-full bg-transparent py-1 outline-none font-sub text-[0.98rem]"
      />
    </div>
  );
}
