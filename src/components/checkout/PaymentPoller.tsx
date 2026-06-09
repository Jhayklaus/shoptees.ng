"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// Polls /api/paystack/verify until the order flips to PAID, then reloads the
// page so the server component re-renders with the correct status. Used as a
// safety net for when the server-side reconcile on redirect-back fails (e.g.
// transient DB or network error on the serverless function's first invocation).

const MAX_ATTEMPTS = 8;
const BASE_DELAY_MS = 2000;

export function PaymentPoller({ paystackReference }: { paystackReference: string }) {
  const router = useRouter();
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (attempt >= MAX_ATTEMPTS) {
      setFailed(true);
      return;
    }

    const delay = attempt === 0 ? 1000 : BASE_DELAY_MS * Math.pow(1.5, attempt - 1);

    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch("/api/paystack/verify", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ reference: paystackReference }),
        });
        const body = (await res.json().catch(() => ({}))) as { status?: string };
        if (res.ok && body.status === "success") {
          router.refresh();
          return;
        }
      } catch {
        // network error — just retry
      }
      setAttempt((a) => a + 1);
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [attempt, paystackReference, router]);

  if (failed) {
    return (
      <p className="mt-4 font-mono-tight text-vermillion text-sm">
        Payment verification timed out. If you completed payment, your order will be updated shortly — check your email or contact us.
      </p>
    );
  }

  return (
    <p className="mt-4 font-mono-tight text-ink/55 text-sm animate-pulse">
      Verifying your payment…
    </p>
  );
}
