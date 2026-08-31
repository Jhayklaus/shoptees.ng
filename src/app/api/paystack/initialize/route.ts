import { NextResponse } from "next/server";
import { z } from "zod";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/db";
import { initializeTransaction, isPaystackConfigured } from "@/lib/paystack";
import { shouldChargeInPresentmentCurrency } from "@/lib/server/currency";
import { isCurrencyCode } from "@/lib/currency";

const schema = z.object({ orderId: z.string().min(1) });

export async function POST(req: Request) {
  if (!isPaystackConfigured()) {
    return NextResponse.json({ error: "Paystack not configured." }, { status: 501 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id: parsed.data.orderId },
    include: { customer: true },
  });
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  if (order.status !== "PENDING") {
    return NextResponse.json(
      { error: `Order is already ${order.status.toLowerCase()}.` },
      { status: 409 },
    );
  }

  const reference = `shptz_${order.orderNumber}_${randomBytes(4).toString("hex")}`;
  const origin = new URL(req.url).origin;

  // Which currency Paystack is asked to charge. Presentment (e.g. USD) is
  // only used once the business has that currency enabled on its Paystack
  // account and somewhere to settle it — until then the customer browses in
  // dollars and the card is charged the naira equivalent, which their issuer
  // converts. `currency.charge_in_usd` in /admin/settings is the switch.
  const chargeInPresentment =
    isCurrencyCode(order.currency) &&
    order.currency !== "NGN" &&
    order.totalMinor != null &&
    (await shouldChargeInPresentmentCurrency());

  const chargeCurrency = chargeInPresentment ? (order.currency as "USD") : "NGN";
  const chargeAmountMinor = chargeInPresentment ? order.totalMinor! : order.totalNGN * 100;

  // Do NOT append our own query params to the callback URL. Paystack appends
  // `?trxref=...&reference=...` with a naive `?`, which would collide with an
  // existing query string and corrupt both. The success page recovers the
  // order from the Paystack reference instead.
  const init = await initializeTransaction({
    email: order.customer.email,
    amountMinor: chargeAmountMinor,
    currency: chargeCurrency,
    reference,
    callbackUrl: `${origin}/checkout/success`,
    metadata: {
      orderId: order.id,
      orderNumber: order.orderNumber,
      presentmentCurrency: order.currency,
    },
  }).catch((e: Error) => {
    console.error("[paystack/initialize]", e);
    return null;
  });

  if (!init) {
    return NextResponse.json({ error: "Could not start payment." }, { status: 502 });
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      paystackReference: init.reference,
      chargeCurrency,
      chargeAmountMinor,
    },
  });

  return NextResponse.json({
    authorizationUrl: init.authorization_url,
    reference: init.reference,
  });
}
