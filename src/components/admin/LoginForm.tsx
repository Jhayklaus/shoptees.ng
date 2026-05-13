"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Sign-in failed");
        return;
      }
      router.push("/admin");
      router.refresh();
    });
  };

  return (
    <form onSubmit={onSubmit} className="mt-10 space-y-5">
      <div className="border-b border-ink/20 py-2">
        <label htmlFor="email" className="font-mono-tight text-ink/55 block">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-transparent py-1 outline-none font-display text-lg"
        />
      </div>
      <div className="border-b border-ink/20 py-2">
        <label htmlFor="password" className="font-mono-tight text-ink/55 block">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-transparent py-1 outline-none font-display text-lg"
        />
      </div>

      {error && (
        <p className="bg-vermillion/10 border-l-2 border-vermillion px-3 py-2 font-mono-tight text-ink-soft">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-ink text-paper py-4 font-mono-tight hover:bg-vermillion transition-colors disabled:opacity-50"
      >
        {isPending ? "Signing in…" : "Sign in →"}
      </button>

      <p className="font-mono-tight text-ink/55 text-center pt-2">
        Forgot your password? Re-seed via the CLI.
      </p>
    </form>
  );
}
