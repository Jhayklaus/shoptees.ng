"use client";

import { useMoney } from "@/components/currency/CurrencyProvider";

/**
 * Renders a naira amount in the visitor's currency. A client island so that
 * server components (product cards, receipts) can show converted prices
 * without becoming client components themselves.
 */
export function Money({ ngn, fallback = "—" }: { ngn: number; fallback?: string }) {
  const { format } = useMoney();
  if (!(ngn > 0)) return <>{fallback}</>;
  return <>{format(ngn)}</>;
}
