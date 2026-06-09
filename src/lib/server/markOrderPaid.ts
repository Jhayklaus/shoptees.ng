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
//
// Emails are best-effort and never block the status update.

type Result =
  | { ok: true; alreadyPaid: false }
  | { ok: true; alreadyPaid: true }
  | { ok: false; reason: "not_found" | "amount_mismatch" };

export async function markOrderPaid(args: {
  reference: string;
  paidAmountKobo: number;
}): Promise<Result> {
  const order = await prisma.order.findFirst({
    where: { paystackReference: args.reference },
    include: { items: true },
  });
  if (!order) return { ok: false, reason: "not_found" };

  if (order.status === "PAID") return { ok: true, alreadyPaid: true };

  if (args.paidAmountKobo !== order.totalNGN * 100) {
    console.error(
      `[markOrderPaid] amount mismatch for ${args.reference}: paid=${args.paidAmountKobo}, expected=${order.totalNGN * 100}`,
    );
    return { ok: false, reason: "amount_mismatch" };
  }

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

  // Await the emails. They must NOT be fire-and-forget: on serverless hosts
  // (e.g. Vercel) the function freezes once the response is returned, so a
  // dangling promise is killed before the email request completes — the
  // confirmation silently never sends. sendEmail already swallows and logs its
  // own failures, so awaiting here is best-effort and never throws.
  await sendPaidEmails(order.id).catch((e) => {
    console.error("[markOrderPaid] sendPaidEmails threw", e);
  });

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
    items: full.items.map((i) => ({
      productName: i.productName,
      variantSize: i.variantSize,
      quantity: i.quantity,
      unitPriceNGN: i.unitPriceNGN,
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
