import "server-only";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import {
  NGN_CONTEXT,
  isCurrencyCode,
  isRoundingMode,
  type CurrencyCode,
  type CurrencyContext,
  type RoundingMode,
} from "@/lib/currency";
import { getAllSettings } from "@/lib/server/settings";

export const CURRENCY_COOKIE = "shoptees-currency";
export const CURRENCY_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export type CurrencyOptions = {
  /** The currency this request is presented in. */
  active: CurrencyCode;
  /** Whether the switcher should be offered at all. */
  usdAvailable: boolean;
  /** NGN per 1 USD, or null when USD is off or misconfigured. */
  usdRate: number | null;
  usdRounding: RoundingMode;
};

/**
 * Resolve the visitor's currency, plus what else is on offer.
 *
 * Precedence for the active currency:
 *   1. the admin kill switch — USD off means NGN for everyone
 *   2. an explicit choice the visitor made (cookie)
 *   3. geo-IP country from the edge (Vercel sets x-vercel-ip-country)
 *   4. NGN
 *
 * Resolved on the server so the first paint already carries the right prices;
 * a client-only switcher would flash naira at US visitors before correcting
 * itself. `cache` keeps this to one settings read per request even though the
 * layout and individual server components both ask for it.
 */
export const getCurrencyOptions = cache(async (): Promise<CurrencyOptions> => {
  const settings = await getAllSettings();
  const off: CurrencyOptions = {
    active: "NGN",
    usdAvailable: false,
    usdRate: null,
    usdRounding: "charm",
  };

  if (settings["currency.usd_enabled"] !== "true") return off;

  const rate = Number(settings["currency.ngn_per_usd"]);
  // A missing or nonsense rate must not turn every product into $0.99.
  if (!Number.isFinite(rate) || rate <= 0) return off;

  const usdRounding = isRoundingMode(settings["currency.usd_rounding"])
    ? settings["currency.usd_rounding"]
    : "charm";

  return { active: await pickCode(), usdAvailable: true, usdRate: rate, usdRounding };
});

/** The active currency as a ready-to-use conversion context. */
export async function resolveCurrency(): Promise<CurrencyContext> {
  const o = await getCurrencyOptions();
  return o.active === "USD" && o.usdRate
    ? { code: "USD", rate: o.usdRate, rounding: o.usdRounding }
    : NGN_CONTEXT;
}

async function pickCode(): Promise<CurrencyCode> {
  const chosen = (await cookies()).get(CURRENCY_COOKIE)?.value;
  if (isCurrencyCode(chosen)) return chosen;

  const country = (await headers()).get("x-vercel-ip-country")?.toUpperCase();
  // Home market and unknown geo both default to naira — the currency we
  // actually settle in. Everyone else gets dollars and can switch back.
  if (!country || country === "NG") return "NGN";
  return "USD";
}

/**
 * Whether Paystack should be asked to charge in the presentment currency
 * rather than NGN. Off until the business has USD enabled on its Paystack
 * account and a domiciliary account to settle into.
 */
export async function shouldChargeInPresentmentCurrency(): Promise<boolean> {
  const settings = await getAllSettings();
  return settings["currency.charge_in_usd"] === "true";
}
