"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { useRouter } from "next/navigation";
import {
  NGN_CONTEXT,
  formatFromNGN,
  formatMoney,
  fromNGN,
  type CurrencyCode,
  type CurrencyContext,
  type RoundingMode,
} from "@/lib/currency";

export type CurrencyOptions = {
  active: CurrencyCode;
  usdAvailable: boolean;
  usdRate: number | null;
  usdRounding: RoundingMode;
};

const COOKIE = "shoptees-currency";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

type Value = {
  ctx: CurrencyContext;
  options: CurrencyOptions;
  setCurrency: (code: CurrencyCode) => void;
};

const Ctx = createContext<Value>({
  ctx: NGN_CONTEXT,
  options: { active: "NGN", usdAvailable: false, usdRate: null, usdRounding: "charm" },
  setCurrency: () => {},
});

function contextFor(code: CurrencyCode, options: CurrencyOptions): CurrencyContext {
  return code === "USD" && options.usdRate
    ? { code: "USD", rate: options.usdRate, rounding: options.usdRounding }
    : NGN_CONTEXT;
}

/**
 * Seeded from the server (see getCurrencyOptions) so client components render
 * the same prices the server sent — no post-hydration currency flip.
 *
 * Switching writes the cookie and refreshes so server-rendered prices follow,
 * but it also flips local state immediately: waiting on the round trip makes
 * the toggle feel broken.
 */
export function CurrencyProvider({
  options,
  children,
}: {
  options: CurrencyOptions;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [active, setActive] = useState<CurrencyCode>(options.active);
  const [lastFromServer, setLastFromServer] = useState<CurrencyCode>(options.active);

  // Re-sync when the server sends a new value (after a refresh, or navigation
  // to a page rendered under a different cookie). Adjusting during render
  // rather than in an effect — React re-runs this component before touching
  // the DOM, so children never paint the stale currency.
  if (options.active !== lastFromServer) {
    setLastFromServer(options.active);
    setActive(options.active);
  }

  const setCurrency = useCallback(
    (code: CurrencyCode) => {
      setActive(code);
      document.cookie = `${COOKIE}=${code}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
      router.refresh();
    },
    [router],
  );

  return (
    <Ctx.Provider value={{ ctx: contextFor(active, options), options, setCurrency }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCurrency(): Value {
  return useContext(Ctx);
}

/**
 * Format naira amounts in the active currency.
 *
 * Use `formatLine` for anything quantity-based: the unit price is converted
 * and rounded first, then multiplied, so a line reads as unit × qty and the
 * subtotal equals the sum of the lines above it.
 */
export function useMoney() {
  const { ctx } = useContext(Ctx);
  const convert = (amountNGN: number) => fromNGN(amountNGN, ctx);
  const line = (unitNGN: number, quantity: number) => convert(unitNGN) * quantity;
  return {
    ...ctx,
    convert,
    line,
    format: (amountNGN: number) => formatFromNGN(amountNGN, ctx),
    formatMajor: (amountMajor: number) => formatMoney(amountMajor, ctx.code),
    formatLine: (unitNGN: number, quantity: number) =>
      formatMoney(line(unitNGN, quantity), ctx.code),
  };
}
