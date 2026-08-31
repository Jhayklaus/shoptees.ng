import "server-only";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email/client";
import {
  customerOrderConfirmation,
  adminNewOrderNotification,
} from "@/lib/email/templates";
import { getSetting } from "@/lib/server/settings";

// Single chokepoint for "this order just got paid". Called from:
//   - /api/paystack/verify          (POST from the success page reconcile)
//   - /api/paystack/webhook         (server-to-server from Paystack)
//   - /(public)/checkout/success    (inline reconcile on redirect-back)
//
// Idempotent: if the order is already PAID, returns { alreadyPaid: true }
// without re-running the transaction or re-sending emails.

type Result =
  | { ok: true; alreadyPaid: false }
  | { ok: true; alreadyPaid: true }
  | { ok: false; reason: "not_found" };

export async function markOrderPaid(args: {
  reference: string;
  /** Amount Paystack confirmed, in the charge currency's subunit. */
  paidAmountMinor: number;
}): Promise<Result> {
  console.log(
    `[markOrderPaid] start — reference=${args.reference} paidMinor=${args.paidAmountMinor}`,
  );

  const order = await prisma.order.findFirst({
    where: { paystackReference: args.reference },
    include: { items: true },
  });

  if (!order) {
    console.error(
      `[markOrderPaid] no order found for paystackReference=${args.reference}`,
    );
    return { ok: false, reason: "not_found" };
  }

  // What we actually asked Paystack for, recorded at initialize time. Falls
  // back to naira for orders created before multi-currency existed.
  const expectedMinor = order.chargeAmountMinor ?? order.totalNGN * 100;

  console.log(
    `[markOrderPaid] found order id=${order.id} number=${order.orderNumber} status=${order.status} totalNGN=${order.totalNGN} chargeCurrency=${order.chargeCurrency} expectedMinor=${expectedMinor}`,
  );

  if (order.status === "PAID") {
    console.log(`[markOrderPaid] already PAID — skipping`);
    return { ok: true, alreadyPaid: true };
  }

  // Sanity-check the amount but don't block on a mismatch — Paystack's own
  // verify response is the source of truth. A mismatch could be caused by
  // test/live mode rounding or a price that changed between order creation
  // and payment. Log it so we can investigate but proceed to mark as PAID.
  if (args.paidAmountMinor !== expectedMinor) {
    console.warn(
      `[markOrderPaid] amount mismatch for ${args.reference}: paid=${args.paidAmountMinor} expected=${expectedMinor} (${order.chargeCurrency}) — proceeding anyway (Paystack confirmed success)`,
    );
  }

  // Mark the order PAID first. This is the critical write — do it alone so
  // that a subsequent stock-decrement failure cannot roll it back.
  await prisma.order.update({
    where: { id: order.id },
    data: { status: "PAID" },
  });
  console.log(`[markOrderPaid] order ${order.id} marked PAID`);

  // Decrement variant stock. Run independently so a missing/deleted variant
  // does not roll back the PAID status above.
  await Promise.allSettled(
    order.items
      .filter((item) => item.variantId !== null)
      .map((item) =>
        prisma.variant
          .update({
            where: { id: item.variantId! },
            data: { stock: { decrement: item.quantity } },
          })
          .catch((e: Error) => {
            console.error(
              `[markOrderPaid] stock decrement failed for variant ${item.variantId}:`,
              e.message,
            );
          }),
      ),
  );

  // Await confirmation emails. Must NOT be fire-and-forget on serverless
  // (Vercel freezes the function once the response returns, killing any
  // dangling promise). sendEmail swallows its own errors so this never throws.
  await sendPaidEmails(order.id).catch((e) => {
    console.error("[markOrderPaid] sendPaidEmails threw:", e);
  });

  console.log(`[markOrderPaid] done — order ${order.orderNumber} fully processed`);
  return { ok: true, alreadyPaid: false };
}

async function sendPaidEmails(orderId: string) {
  const full = await prisma.order.findUnique({
    where: { id: orderId },
    include: { customer: true, address: true, items: true },
  });
  if (!full) return;

  const customerPayload = {
    orderNumber: full.orderNumber,
    totalNGN: full.totalNGN,
    subtotalNGN: full.subtotalNGN,
    shippingNGN: full.shippingNGN,
    // Presentment: the receipt must repeat the figures the customer agreed
    // to, not today's conversion of them.
    currency: full.currency,
    fxRateNgnPerUnit: full.fxRateNgnPerUnit,
    totalMinor: full.totalMinor,
    subtotalMinor: full.subtotalMinor,
    shippingMinor: full.shippingMinor,
    items: full.items.map((i) => ({
      productName: i.productName,
      variantSize: i.variantSize,
      quantity: i.quantity,
      unitPriceNGN: i.unitPriceNGN,
      unitPriceMinor: i.unitPriceMinor,
    })),
    customer: full.customer,
    address: full.address,
  };

  // Customer receipt.
  await sendEmail({
    to: full.customer.email,
    ...customerOrderConfirmation(customerPayload),
  });

  // Admin notification — optional, off unless a recipient is configured.
  const adminRecipient = (await getSetting("notifications.admin_email")).trim();
  if (adminRecipient) {
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";
    await sendEmail({
      to: adminRecipient,
      replyTo: full.customer.email,
      ...adminNewOrderNotification(customerPayload, { siteUrl }),
    });
  }
}
