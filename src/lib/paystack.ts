// Paystack helpers — intentionally a stub until HILCS #3.
// No SDK is installed yet. After user provides PAYSTACK_PUBLIC_KEY (.env.local) and
// approves install, this file will wire up @paystack/inline-js or the HTTP API.

export const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? "";
export const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY ?? "";

export function isPaystackConfigured() {
  return Boolean(PAYSTACK_PUBLIC_KEY && PAYSTACK_SECRET_KEY);
}
