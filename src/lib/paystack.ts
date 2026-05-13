// Server-side Paystack REST helpers. No SDK — direct fetch against api.paystack.co.
// Public key is exposed to the client only via NEXT_PUBLIC_*; the secret key
// must never leave the server.

import "server-only";

export const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? "";
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY ?? "";

const PAYSTACK_BASE = "https://api.paystack.co";

export function isPaystackConfigured() {
  return Boolean(PAYSTACK_PUBLIC_KEY && PAYSTACK_SECRET_KEY);
}

type InitInput = {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
};

type InitResponse = {
  authorization_url: string;
  access_code: string;
  reference: string;
};

export async function initializeTransaction(input: InitInput): Promise<InitResponse> {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: input.email,
      amount: input.amountKobo,
      reference: input.reference,
      callback_url: input.callbackUrl,
      currency: "NGN",
      metadata: input.metadata ?? {},
    }),
    cache: "no-store",
  });

  const body = (await res.json().catch(() => ({}))) as {
    status?: boolean;
    message?: string;
    data?: InitResponse;
  };

  if (!res.ok || !body.status || !body.data) {
    throw new Error(body.message ?? `Paystack initialize failed (${res.status})`);
  }
  return body.data;
}

type VerifyResponse = {
  status: "success" | "failed" | "abandoned" | string;
  reference: string;
  amount: number;
  currency: string;
  paid_at: string | null;
  channel: string | null;
  customer: { email: string };
};

export async function verifyTransaction(reference: string): Promise<VerifyResponse> {
  const res = await fetch(
    `${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
      cache: "no-store",
    },
  );

  const body = (await res.json().catch(() => ({}))) as {
    status?: boolean;
    message?: string;
    data?: VerifyResponse;
  };

  if (!res.ok || !body.status || !body.data) {
    throw new Error(body.message ?? `Paystack verify failed (${res.status})`);
  }
  return body.data;
}
