"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function AcceptInviteForm({
  token,
  email,
  defaultName,
}: {
  token: string;
  email: string;
  defaultName: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(defaultName);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    startTransition(async () => {
      const res = await fetch("/api/admin/accept-invite", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, name, password }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.error ?? "Could not accept invitation. Please try again.");
        return;
      }
      // Logged in — go to the admin home.
      router.push("/admin");
      router.refresh();
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <input type="hidden" name="email" value={email} />

      <Field id="ai-name" label="Your name" value={name} onChange={setName} required />
      <Field
        id="ai-pwd"
        label="Password"
        type="password"
        value={password}
        onChange={setPassword}
        required
        hint="At least 8 characters."
      />
      <Field
        id="ai-pwd2"
        label="Confirm password"
        type="password"
        value={confirm}
        onChange={setConfirm}
        required
      />

      {error && (
        <p className="bg-vermillion/10 border-l-2 border-vermillion px-3 py-2 font-mono-tight text-ink-soft">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-ink text-paper py-3.5 font-mono-tight hover:bg-vermillion transition-colors disabled:opacity-50"
      >
        {pending ? "Setting up…" : "Set password & sign in →"}
      </button>
    </form>
  );
}

function Field({
  id,
  label,
  type = "text",
  required,
  value,
  onChange,
  hint,
}: {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="font-mono-tight text-ink/55">
        {label}
        {hint && <span className="text-ink/40 ml-2">{hint}</span>}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full bg-transparent border-b border-line py-2 outline-none focus:border-ink font-display text-lg"
      />
    </div>
  );
}
