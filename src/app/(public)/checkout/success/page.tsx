import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { getOrderByNumber } from "@/lib/server/orders";
import { formatNaira } from "@/lib/utils";
import { isPaystackConfigured, verifyTransaction } from "@/lib/paystack";
import { markOrderPaid } from "@/lib/server/markOrderPaid";

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
  if (paystackRef && isPaystackConfigured()) {
    await reconcilePaystack(paystackRef).catch((e) => {
      console.error("[checkout/success] reconcile failed", e);
    });
  }

  const order = ref ? await getOrderByNumber(ref) : null;

  if (!order) {
    return (
      <main className="mx-auto max-w-2xl px-5 md:px-10 py-24 text-center">
        <p className="font-mono-tight text-ink/55 mb-3">Receipt</p>
        <h1 className="font-display text-6xl tracking-tight leading-[0.95]">
          Thank you,
          <br />
          <span className="font-italic-accent text-vermillion">noted.</span>
        </h1>
        <p className="mt-6 font-italic-accent text-xl text-ink-soft">
          We&apos;ve recorded your order. A confirmation will follow by email and a
          packing-time update by WhatsApp.
        </p>
        <Link
          href="/shop"
          className="inline-block mt-10 border border-ink px-6 py-3 font-mono-tight hover:bg-ink hover:text-paper transition-colors"
        >
          Back to the shop →
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-5 md:px-10 py-20">
      <div className="text-center">
        <p className="font-mono-tight text-ink/55">Receipt</p>
        <h1 className="font-display text-6xl md:text-7xl tracking-tight leading-[0.95] mt-1">
          Thank you,
          <br />
          <span className="font-italic-accent text-vermillion">{order.customer.firstName}.</span>
        </h1>
        <p className="font-mono-tight mt-4 text-ink-soft">
          Order <span className="text-ink">{order.orderNumber}</span> · placed{" "}
          {new Date(order.createdAt).toLocaleString("en-NG", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
        <p className="mt-3">
          <span
            className={`inline-block px-3 py-1 font-mono-tight text-xs uppercase tracking-wider ${
              order.status === "PAID"
                ? "bg-ink text-paper"
                : "bg-vermillion/10 text-vermillion border border-vermillion/40"
            }`}
          >
            {order.status === "PAID" ? "Paid" : "Awaiting payment"}
          </span>
        </p>
      </div>

      <section className="mt-10 border-t border-line pt-6">
        <p className="font-mono-tight text-ink/55 mb-3">Items</p>
        <ul className="divide-y divide-line">
          {order.items.map((item) => (
            <li key={item.id} className="py-3 flex justify-between gap-4">
              <div>
                <p className="font-display text-xl leading-tight">{item.productName}</p>
                <p className="font-mono-tight text-ink/55">
                  {item.variantSize} × {item.quantity}
                </p>
              </div>
              <p className="font-mono-tight whitespace-nowrap">
                {formatNaira(item.unitPriceNGN * item.quantity)}
              </p>
            </li>
          ))}
        </ul>
        <div className="mt-5 pt-5 border-t border-line flex justify-between font-display text-2xl">
          <p>Total</p>
          <p>{formatNaira(order.totalNGN)}</p>
        </div>
      </section>

      {order.address && (
        <section className="mt-10 border-t border-line pt-6">
          <p className="font-mono-tight text-ink/55 mb-2">Shipping to</p>
          <p className="font-display text-xl">
            {order.customer.firstName} {order.customer.lastName}
          </p>
          <p>{order.address.line1}</p>
          {order.address.line2 && <p>{order.address.line2}</p>}
          <p>
            {order.address.city}, {order.address.state}
            {order.address.postal && ` ${order.address.postal}`}
          </p>
        </section>
      )}

      <p className="mt-10 font-italic-accent text-ink-soft text-center">
        Save this page or check your email for the same details. Lagos orders
        usually leave the studio within 48 hours.
      </p>

      <div className="text-center mt-8">
        <Link
          href="/shop"
          className="inline-block border border-ink px-6 py-3 font-mono-tight hover:bg-ink hover:text-paper transition-colors"
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
  const verification = await verifyTransaction(reference);
  if (verification.status !== "success") return;
  await markOrderPaid({ reference, paidAmountKobo: verification.amount });
}
