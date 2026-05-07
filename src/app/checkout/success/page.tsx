import Link from "next/link";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Order confirmed — Shoptees", path: "/checkout/success" });

export default function CheckoutSuccessPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 md:px-10 py-24 text-center">
      <p className="font-mono-tight text-ink/55 mb-3">Receipt · 01</p>
      <h1 className="font-display text-6xl tracking-tight leading-[0.95]">
        Thank you,
        <br />
        <span className="font-italic-accent text-vermillion">noted.</span>
      </h1>
      <p className="mt-6 font-italic-accent text-xl text-ink-soft">
        We&apos;ll send a confirmation by email and a packing-time update by
        WhatsApp. Lagos orders usually leave the studio within 48 hours.
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
