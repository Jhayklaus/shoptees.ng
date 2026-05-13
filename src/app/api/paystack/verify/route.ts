import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { isPaystackConfigured, verifyTransaction } from "@/lib/paystack";

const schema = z.object({ reference: z.string().min(1) });

export async function POST(req: Request) {
  if (!isPaystackConfigured()) {
    return NextResponse.json({ error: "Paystack not configured." }, { status: 501 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { reference } = parsed.data;

  const order = await prisma.order.findFirst({
    where: { paystackReference: reference },
    include: { items: true },
  });
  if (!order) {
    return NextResponse.json({ error: "Order not found for this reference." }, { status: 404 });
  }

  // Idempotent: if already PAID, just report success.
  if (order.status === "PAID") {
    return NextResponse.json({ status: "success", orderNumber: order.orderNumber });
  }

  const verification = await verifyTransaction(reference).catch((e: Error) => {
    console.error("[paystack/verify]", e);
    return null;
  });
  if (!verification) {
    return NextResponse.json({ error: "Could not verify payment." }, { status: 502 });
  }

  if (verification.status !== "success") {
    return NextResponse.json(
      { status: verification.status, orderNumber: order.orderNumber },
      { status: 200 },
    );
  }

  // Amount sanity check — kobo must match the order total. Defends against
  // tampering with the reference / amount mid-flow.
  if (verification.amount !== order.totalNGN * 100) {
    console.error(
      `[paystack/verify] amount mismatch for ${reference}: paid=${verification.amount}, expected=${order.totalNGN * 100}`,
    );
    return NextResponse.json({ error: "Payment amount mismatch." }, { status: 409 });
  }

  // Mark PAID and decrement stock atomically.
  await prisma.$transaction([
    prisma.order.update({
      where: { id: order.id },
      data: { status: "PAID" },
    }),
    ...order.items
      .filter((item) => item.variantId !== null)
      .map((item) =>
        prisma.variant.update({
          where: { id: item.variantId! },
          data: { stock: { decrement: item.quantity } },
        }),
      ),
  ]);

  return NextResponse.json({ status: "success", orderNumber: order.orderNumber });
}
