// Currency presentation layer. Safe to import from both client and server.
//
// Naira is the source of truth: products are priced in NGN, orders are
// recorded in NGN, and settlement happens in NGN. Every other currency is a
// *presentment* currency — derived from the NGN price and a rate the admin
// sets in /admin/settings, never stored per product.
//
// The conversion order matters and is deliberate: unit prices are converted
// and rounded FIRST, then multiplied by quantity and summed. Converting the
// line total instead would produce a subtotal that doesn't equal the sum of
// the prices on screen, which customers notice.

export const CURRENCY_CODES = ["NGN", "USD"] as const;
export type CurrencyCode = (typeof CURRENCY_CODES)[number];

export const ROUNDING_MODES = ["charm", "whole", "exact"] as const;
export type RoundingMode = (typeof ROUNDING_MODES)[number];

export type CurrencyContext = {
  code: CurrencyCode;
  /** NGN per 1 unit of `code`. Always 1 for NGN. */
  rate: number;
  rounding: RoundingMode;
};

export const NGN_CONTEXT: CurrencyContext = { code: "NGN", rate: 1, rounding: "whole" };

export const CURRENCY_META: Record<
  CurrencyCode,
  { symbol: string; label: string; locale: string; fractionDigits: number }
> = {
  NGN: { symbol: "₦", label: "NGN", locale: "en-NG", fractionDigits: 0 },
  USD: { symbol: "$", label: "USD", locale: "en-US", fractionDigits: 2 },
};

export function isCurrencyCode(v: unknown): v is CurrencyCode {
  return typeof v === "string" && (CURRENCY_CODES as readonly string[]).includes(v);
}

export function isRoundingMode(v: unknown): v is RoundingMode {
  return typeof v === "string" && (ROUNDING_MODES as readonly string[]).includes(v);
}

/**
 * Apply the rounding rule so converted prices read like prices someone chose
 * rather than the output of a division. Zero always stays zero — a free
 * shipping line must not become $0.99.
 */
export function roundMajor(value: number, code: CurrencyCode, rounding: RoundingMode): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  if (CURRENCY_META[code].fractionDigits === 0) return Math.round(value);
  // Work in integer cents throughout: 28.99 + 0.01 is 29.000000000000004 in
  // binary floating point, which would push a price a whole dollar up.
  const cents = Math.ceil(value * 100 - 1e-6);
  switch (rounding) {
    case "charm": {
      // Smallest $X.99 that is still at or above the true converted price —
      // `ceil(value) - 0.01` would round $1.00 down to $0.99 and quietly give
      // away margin on every exact-dollar amount.
      const whole = Math.ceil((cents + 1) / 100);
      return whole - 0.01;
    }
    case "whole":
      return Math.ceil(cents / 100);
    case "exact":
      return cents / 100;
  }
}

/** Convert a whole-naira amount into major units of the context currency. */
export function fromNGN(amountNGN: number, ctx: CurrencyContext): number {
  if (ctx.code === "NGN") return Math.round(amountNGN);
  if (!(ctx.rate > 0)) return Math.round(amountNGN); // guard: never divide by zero
  return roundMajor(amountNGN / ctx.rate, ctx.code, ctx.rounding);
}

/** Major units → the currency's minor unit (kobo, cents) as an integer. */
export function toMinor(amountMajor: number, code: CurrencyCode): number {
  return Math.round(amountMajor * (CURRENCY_META[code].fractionDigits === 0 ? 1 : 100));
}

/** Minor units → major. Inverse of toMinor. */
export function fromMinor(amountMinor: number, code: CurrencyCode): number {
  return CURRENCY_META[code].fractionDigits === 0 ? amountMinor : amountMinor / 100;
}

export function formatMoney(amountMajor: number, code: CurrencyCode): string {
  const meta = CURRENCY_META[code];
  return new Intl.NumberFormat(meta.locale, {
    style: "currency",
    currency: code,
    minimumFractionDigits: meta.fractionDigits,
    maximumFractionDigits: meta.fractionDigits,
  }).format(amountMajor);
}

/** The common case: take a naira amount, show it in the active currency. */
export function formatFromNGN(amountNGN: number, ctx: CurrencyContext): string {
  return formatMoney(fromNGN(amountNGN, ctx), ctx.code);
}

/**
 * Price a set of cart/order lines in the presentment currency, converting
 * unit prices before multiplying so the arithmetic on screen adds up.
 * Amounts come back in minor units, ready to store or hand to a PSP.
 */
export function priceLines(
  lines: { unitPriceNGN: number; quantity: number }[],
  shippingNGN: number,
  ctx: CurrencyContext,
): {
  lines: { unitMajor: number; unitMinor: number; lineMajor: number }[];
  subtotalMinor: number;
  shippingMinor: number;
  totalMinor: number;
} {
  const priced = lines.map((l) => {
    const unitMajor = fromNGN(l.unitPriceNGN, ctx);
    return {
      unitMajor,
      unitMinor: toMinor(unitMajor, ctx.code),
      lineMajor: unitMajor * l.quantity,
    };
  });
  const subtotalMinor = priced.reduce(
    (sum, p, i) => sum + p.unitMinor * lines[i].quantity,
    0,
  );
  const shippingMinor = toMinor(fromNGN(shippingNGN, ctx), ctx.code);
  return {
    lines: priced,
    subtotalMinor,
    shippingMinor,
    totalMinor: subtotalMinor + shippingMinor,
  };
}

/**
 * Format an amount recorded on an order. Receipts must show exactly what the
 * customer was charged, so stored presentment figures win over a fresh
 * conversion — the rate may well have moved since.
 */
export function formatStored(
  amountNGN: number,
  amountMinor: number | null | undefined,
  currency: string,
): string {
  if (isCurrencyCode(currency) && currency !== "NGN" && amountMinor != null) {
    return formatMoney(fromMinor(amountMinor, currency), currency);
  }
  return formatMoney(amountNGN, "NGN");
}
