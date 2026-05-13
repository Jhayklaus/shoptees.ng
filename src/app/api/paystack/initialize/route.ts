import { NextResponse } from "next/server";
import { z } from "zod";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/db";
import { initializeTransaction, isPaystackConfigured } from "@/lib/paystack";

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

  const init = await initializeTransaction({
    email: order.customer.email,
    amountKobo: order.totalNGN * 100,
    reference,
    callbackUrl: `${origin}/checkout/success?ref=${encodeURIComponent(order.orderNumber)}`,
    metadata: { orderId: order.id, orderNumber: order.orderNumber },
  }).catch((e: Error) => {
    console.error("[paystack/initialize]", e);
    return null;
  });

  if (!init) {
    return NextResponse.json({ error: "Could not start payment." }, { status: 502 });
  }

  await prisma.order.update({
    where: { id: order.id },
    data: { paystackReference: init.reference },
  });

  return NextResponse.json({
    authorizationUrl: init.authorization_url,
    reference: init.reference,
  });
}
