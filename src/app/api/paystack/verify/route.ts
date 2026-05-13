import { NextResponse } from "next/server";
import { z } from "zod";
import { isPaystackConfigured, verifyTransaction } from "@/lib/paystack";
import { markOrderPaid } from "@/lib/server/markOrderPaid";

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

  const verification = await verifyTransaction(reference).catch((e: Error) => {
    console.error("[paystack/verify]", e);
    return null;
  });
  if (!verification) {
    return NextResponse.json({ error: "Could not verify payment." }, { status: 502 });
  }

  if (verification.status !== "success") {
    return NextResponse.json({ status: verification.status }, { status: 200 });
  }

  const result = await markOrderPaid({
    reference,
    paidAmountKobo: verification.amount,
  });

  if (!result.ok) {
    if (result.reason === "not_found") {
      return NextResponse.json({ error: "Order not found for this reference." }, { status: 404 });
    }
    return NextResponse.json({ error: "Payment amount mismatch." }, { status: 409 });
  }

  return NextResponse.json({ status: "success" });
}
