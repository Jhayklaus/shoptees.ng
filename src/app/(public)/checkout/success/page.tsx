import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { getOrderByNumber, getOrderByPaystackReference } from "@/lib/server/orders";
import { formatStored } from "@/lib/currency";
import { isPaystackConfigured, verifyTransaction } from "@/lib/paystack";
import { markOrderPaid } from "@/lib/server/markOrderPaid";
import { PaymentPoller } from "@/components/checkout/PaymentPoller";

export const metadata = buildMetadata({
  title: "Order confirmed",
  path: "/checkout/success",
  noIndex: true,
});
export const dynamic = "force-dynamic";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string; reference?: string; trxref?: string }>;
}) {
  const { ref, reference, trxref } = await searchParams;

  // Paystack appends ?reference=...&trxref=... when redirecting back. Verify
  // server-side before showing the receipt as PAID. Idempotent — re-runs are safe.
  const paystackRef = reference ?? trxref;

  console.log(
    `[checkout/success] params ref=${ref ?? "—"} paystackRef=${paystackRef ?? "—"} configured=${isPaystackConfigured()}`,
  );

  if (paystackRef && isPaystackConfigured()) {
    await reconcilePaystack(paystackRef).catch((e) => {
      console.error("[checkout/success] reconcile threw:", e);
    });
  } else if (paystackRef && !isPaystackConfigured()) {
    console.warn("[checkout/success] paystackRef present but Paystack not configured — reconcile skipped");
  }

  // Prefer ref (pay-later / error path keeps ?ref= in the URL). After a normal
  // Paystack redirect, only paystackRef is available so we look up by that.
  const order = ref
    ? await getOrderByNumber(ref)
    : paystackRef
      ? await getOrderByPaystackReference(paystackRef)
      : null;

  console.log(
    `[checkout/success] order=${order?.orderNumber ?? "not found"} status=${order?.status ?? "—"}`,
  );

  if (!order) {
    return (
      <main className="mx-auto max-w-2xl px-5 md:px-10 py-24 text-center">
        <span className="stamp text-vermillion">Receipt</span>
        <h1 className="font-display text-6xl md:text-7xl leading-[0.92] mt-4">
          Thank you,
          <br />
          <span className="text-vermillion">noted.</span>
        </h1>
        <p className="mt-6 text-lg text-ink-soft max-w-md mx-auto">
          We&apos;ve recorded your order. A confirmation will follow by email and a
          packing-time update by WhatsApp.
        </p>
        <Link
          href="/shop"
          className="btn-wipe inline-block mt-10 border-2 border-ink px-7 py-3.5 font-condensed text-[0.78rem] hover:text-paper transition-colors duration-200"
        >
          Back to the shop →
        </Link>
      </main>
    );
  }

  // If the order is still PENDING after server-side reconcile, mount the
  // client-side poller as a safety net. It retries /api/paystack/verify with
  // exponential back-off and refreshes the page once PAID is confirmed.
  const isPendingAfterPaystack = order.status !== "PAID" && Boolean(paystackRef);

  return (
    <main className="mx-auto max-w-3xl px-5 md:px-10 py-20">
      {/* Receipt document — bordered like a waybill, with the big status stamp */}
      <div className="relative border-2 border-ink bg-paper shadow-[8px_8px_0_0_var(--ink)] px-6 md:px-12 py-12">
        <span className="absolute top-0 left-0 w-10 h-[3px] bg-vermillion" />
        <span className="absolute top-0 left-0 w-[3px] h-10 bg-vermillion" />
        <span className="absolute bottom-0 right-0 w-10 h-[3px] bg-vermillion" />
        <span className="absolute bottom-0 right-0 w-[3px] h-10 bg-vermillion" />

        {/* Big status stamp — thunks in on load */}
        <div className="absolute top-6 right-5 md:top-8 md:right-8 stamp-in" aria-hidden>
          <span
            className={`block border-[3px] px-4 py-2 md:px-5 md:py-2.5 font-display text-2xl md:text-4xl -rotate-[8deg] select-none ${
              order.status === "PAID"
                ? "border-olive text-olive"
                : "border-vermillion text-vermillion"
            }`}
          >
            {order.status === "PAID" ? "PAID" : "PENDING"}
          </span>
        </div>

        <div>
          <span className="stamp text-vermillion">Receipt</span>
          <h1 className="font-display text-5xl md:text-7xl leading-[0.92] mt-3 pr-28 md:pr-40">
            Thank you,
            <br />
            <span className="text-vermillion">{order.customer.firstName}.</span>
          </h1>
          <p className="font-mono-tight mt-5 text-ink-soft">
            Order <span className="text-ink font-bold">{order.orderNumber}</span>
            <br className="sm:hidden" />
            <span className="hidden sm:inline"> · </span>
            placed{" "}
            {new Date(order.createdAt).toLocaleString("en-NG", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
          <p className="sr-only">
            Order status: {order.status === "PAID" ? "Paid" : "Awaiting payment"}
          </p>
          {isPendingAfterPaystack && paystackRef && (
            <PaymentPoller paystackReference={paystackRef} />
          )}
        </div>

        <section className="mt-10 border-t-2 border-ink pt-6">
          <span className="stamp text-ink/60">Items</span>
          <ul className="divide-y divide-line mt-3">
            {order.items.map((item, idx) => (
              <li key={item.id} className="py-3 flex justify-between gap-4">
                <div className="flex gap-3">
                  <span className="font-mono-tight text-ink/40">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="font-display text-xl leading-tight">{item.productName}</p>
                    <p className="font-mono-tight text-ink/55">
                      {item.variantSize} × {item.quantity}
                    </p>
                  </div>
                </div>
                <p className="font-mono-tight whitespace-nowrap">
                  {formatStored(
                    item.unitPriceNGN * item.quantity,
                    item.unitPriceMinor == null ? null : item.unitPriceMinor * item.quantity,
                    order.currency,
                  )}
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-5 pt-5 border-t-2 border-ink flex justify-between items-baseline">
            <p className="font-condensed text-[0.82rem]">Total</p>
            <p className="font-display text-3xl">
              {formatStored(order.totalNGN, order.totalMinor, order.currency)}
            </p>
          </div>
        </section>

        {order.address && (
          <section className="mt-10 border-t-2 border-ink pt-6">
            <span className="stamp text-ink/60">Deliver to</span>
            <div className="mt-3 font-mono-tight leading-relaxed">
              <p className="font-bold">
                {order.customer.firstName} {order.customer.lastName}
              </p>
              <p>{order.address.line1}</p>
              {order.address.line2 && <p>{order.address.line2}</p>}
              <p>
                {order.address.city}, {order.address.state}
                {order.address.postal && ` ${order.address.postal}`}
              </p>
            </div>
          </section>
        )}

        {/* Perforated tear-off edge */}
        <div className="mt-10 border-t-2 border-dashed border-ink/30 pt-6">
          <p className="font-mono-tight text-ink/55 text-sm text-center">
            Save this page or check your email for the same details. Lagos orders
            usually leave the studio within 48 hours.
          </p>
        </div>
      </div>

      <div className="text-center mt-12">
        <Link
          href="/shop"
          className="btn-wipe inline-block border-2 border-ink px-7 py-3.5 font-condensed text-[0.78rem] hover:text-paper transition-colors duration-200"
        >
          Back to the shop →
        </Link>
      </div>
    </main>
  );
}

// Reconcile a Paystack reference returned via the callback URL: verify with
// Paystack, then mark the order PAID and decrement stock if successful.
// Idempotent — safe to call on every page load.
async function reconcilePaystack(reference: string) {
  console.log(`[reconcilePaystack] verifying reference=${reference}`);
  const verification = await verifyTransaction(reference);
  console.log(`[reconcilePaystack] verify response status=${verification.status} amount=${verification.amount}`);
  if (verification.status !== "success") {
    console.log(`[reconcilePaystack] payment not successful (${verification.status}) — not marking paid`);
    return;
  }
  const result = await markOrderPaid({ reference, paidAmountMinor: verification.amount });
  console.log(`[reconcilePaystack] markOrderPaid result=${JSON.stringify(result)}`);
}
