"use client";

import { CURRENCY_CODES, CURRENCY_META, type CurrencyCode } from "@/lib/currency";
import { useCurrency } from "@/components/currency/CurrencyProvider";

/**
 * Segmented ₦ NGN / $ USD control. Currency codes rather than flags — a flag
 * names a country, not a currency, and gets ambiguous the moment someone
 * browses from a third country.
 */
export function CurrencySwitcher({ className = "" }: { className?: string }) {
  const { ctx, options, setCurrency } = useCurrency();
  if (!options.usdAvailable) return null;

  return (
    <div
      role="group"
      aria-label="Currency"
      className={`inline-flex border-2 border-ink ${className}`}
    >
      {CURRENCY_CODES.map((code: CurrencyCode) => {
        const on = ctx.code === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setCurrency(code)}
            aria-pressed={on}
            title={`Show prices in ${CURRENCY_META[code].label}`}
            className={[
              "font-mono-tight px-2 py-1 leading-none transition-colors",
              on ? "bg-ink text-paper" : "text-ink/55 hover:text-vermillion",
            ].join(" ")}
          >
            {CURRENCY_META[code].symbol} {CURRENCY_META[code].label}
          </button>
        );
      })}
    </div>
  );
}
