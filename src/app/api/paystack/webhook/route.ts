import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { markOrderPaid } from "@/lib/server/markOrderPaid";

// Paystack webhook receiver.
//
// Configure the URL in Dashboard → Settings → API Keys & Webhooks (separate
// fields per test/live mode). Paystack POSTs JSON and signs the raw body with
// HMAC-SHA512 using the matching secret key.
//
// We only act on `charge.success`. Other events are acknowledged with 200 so
// Paystack doesn't retry — adding handlers later is just another switch case.
//
// This endpoint is idempotent: replays for an already-PAID order are a no-op,
// so it's safe for Paystack's retry-on-failure behaviour and overlaps fine
// with the verify-on-callback path in /checkout/success.

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY ?? "";

export async function POST(req: Request) {
  if (!PAYSTACK_SECRET_KEY) {
    // No key configured — reject loudly so misconfig is obvious in logs.
    return NextResponse.json({ error: "Webhook not configured." }, { status: 503 });
  }

  const raw = await req.text();
  const signature = req.headers.get("x-paystack-signature") ?? "";

  const expected = createHmac("sha512", PAYSTACK_SECRET_KEY).update(raw).digest("hex");
  if (!signaturesMatch(expected, signature)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let event: PaystackEvent;
  try {
    event = JSON.parse(raw) as PaystackEvent;
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  if (event.event === "charge.success") {
    await handleChargeSuccess(event.data as ChargeData).catch((e) => {
      console.error("[paystack/webhook] charge.success failed", e);
      // Swallow — return 200 so Paystack doesn't retry indefinitely. The
      // verify-on-callback path will catch the order next time the customer
      // lands on /checkout/success, and we have the error in logs.
    });
  }

  return NextResponse.json({ received: true });
}

async function handleChargeSuccess(data: ChargeData) {
  if (!data.reference || typeof data.amount !== "number") return;
  await markOrderPaid({ reference: data.reference, paidAmountMinor: data.amount });
}

function signaturesMatch(expectedHex: string, gotHex: string) {
  if (expectedHex.length !== gotHex.length) return false;
  try {
    return timingSafeEqual(Buffer.from(expectedHex, "hex"), Buffer.from(gotHex, "hex"));
  } catch {
    return false;
  }
}

type PaystackEvent = { event: string; data: unknown };

type ChargeData = {
  reference?: string;
  amount?: number;
  status?: string;
};
