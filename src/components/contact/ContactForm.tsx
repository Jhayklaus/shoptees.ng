"use client";

import { useState } from "react";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        // TODO: wire to a transactional email provider once user picks one (Resend / Postmark).
        setSubmitted(true);
      }}
      className="col-span-12 md:col-span-6 md:col-start-7 bg-paper-deep p-6 md:p-10"
    >
      <p className="font-mono-tight text-ink/55 mb-3">A note</p>
      <h2 className="font-display text-4xl tracking-tight">
        Or leave a message <span className="font-italic-accent text-vermillion">here.</span>
      </h2>

      {submitted ? (
        <p className="mt-8 font-italic-accent text-2xl">
          Thank you — we&apos;ll write back within a day.
        </p>
      ) : (
        <>
          <div className="mt-8 space-y-5">
            <Field id="c-name" label="Name" />
            <Field id="c-email" label="Email" type="email" />
            <div className="border-b border-ink/15 py-2">
              <label htmlFor="c-msg" className="font-mono-tight text-ink/55">
                Message
              </label>
              <textarea
                id="c-msg"
                rows={4}
                className="w-full bg-transparent py-1 outline-none font-display text-lg resize-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-8 w-full bg-ink text-paper py-4 font-mono-tight hover:bg-vermillion transition-colors"
          >
            Send →
          </button>
          <p className="mt-3 font-mono-tight text-ink/55 text-center">
            [PLACEHOLDER: form not yet wired to a provider]
          </p>
        </>
      )}
    </form>
  );
}

function Field({ id, label, type = "text" }: { id: string; label: string; type?: string }) {
  return (
    <div className="border-b border-ink/15 py-2">
      <label htmlFor={id} className="font-mono-tight text-ink/55">
        {label}
      </label>
      <input
        id={id}
        type={type}
        className="w-full bg-transparent py-1 outline-none font-display text-lg"
      />
    </div>
  );
}
