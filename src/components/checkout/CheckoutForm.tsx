"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/cart";
import { useHydratedCart } from "@/store/useHydratedCart";
import { formatNaira } from "@/lib/utils";

const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? "";

const NIGERIAN_STATES = [
  "Lagos", "FCT - Abuja", "Rivers", "Oyo", "Kano", "Kaduna", "Enugu",
  "Anambra", "Ogun", "Edo", "Delta", "Akwa Ibom", "Cross River", "Imo",
  "Plateau", "Other",
] as const;

export function CheckoutForm() {
  const router = useRouter();
  const cart = useHydratedCart();
  const clearCart = useCart((s) => s.clear);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const lines = cart.lines;
  const subtotal = lines.reduce((s, l) => s + l.lineTotalNGN, 0);
  const paystackReady = Boolean(PAYSTACK_PUBLIC_KEY);
  const empty = cart.status === "ready" && lines.length === 0;

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (lines.length === 0) return;

    const fd = new FormData(e.currentTarget);
    const payload = {
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      firstName: String(fd.get("firstName") ?? ""),
      lastName: String(fd.get("lastName") ?? ""),
      address: {
        line1: String(fd.get("address1") ?? ""),
        line2: String(fd.get("address2") ?? "") || null,
        city: String(fd.get("city") ?? ""),
        state: String(fd.get("state") ?? ""),
        postal: String(fd.get("postal") ?? "") || null,
      },
      lines: lines.map((l) => ({
        productId: l.productId,
        variantId: l.variantId,
        quantity: l.quantity,
      })),
    };

    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.error ?? "Checkout failed");
        return;
      }

      // Cart is now an order. Clear it so back-button doesn't double-purchase.
      clearCart();

      // If Paystack is configured, hand off to its hosted page; otherwise
      // fall through to the pay-later receipt.
      if (paystackReady) {
        const init = await fetch("/api/paystack/initialize", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ orderId: body.orderId }),
        });
        const initBody = await init.json().catch(() => ({}));
        if (!init.ok || !initBody.authorizationUrl) {
          setError(initBody.error ?? "Could not start payment. Your order is recorded as pending.");
          router.push(`/checkout/success?ref=${encodeURIComponent(body.orderNumber)}`);
          return;
        }
        window.location.href = initBody.authorizationUrl;
        return;
      }

      router.push(`/checkout/success?ref=${encodeURIComponent(body.orderNumber)}`);
    });
  };

  return (
    <main className="mx-auto max-w-[1400px] px-5 md:px-10 py-12">
      <header className="mb-10 border-b border-line pb-6">
        <p className="font-mono-tight text-ink/55">Checkout · step 1 of 2</p>
        <h1 className="font-display text-6xl md:text-7xl tracking-tight">
          Almost <span className="font-italic-accent text-vermillion">there.</span>
        </h1>
      </header>

      <form onSubmit={onSubmit} className="grid grid-cols-12 gap-10">
        <div className="col-span-12 lg:col-span-7 space-y-10">
          <fieldset>
            <legend className="font-mono-tight text-ink/55 mb-4">Contact</legend>
            <Field id="email" label="Email" type="email" autoComplete="email" required />
            <Field id="phone" label="Phone (WhatsApp)" type="tel" autoComplete="tel" required />
          </fieldset>

          <fieldset>
            <legend className="font-mono-tight text-ink/55 mb-4">Delivery</legend>
            <div className="grid grid-cols-2 gap-x-4">
              <Field id="firstName" label="First name" autoComplete="given-name" required />
              <Field id="lastName" label="Last name" autoComplete="family-name" required />
            </div>
            <Field id="address1" label="Street address" autoComplete="address-line1" required />
            <Field id="address2" label="Apt, suite, etc. (optional)" autoComplete="address-line2" />
            <div className="grid grid-cols-2 gap-x-4">
              <Field id="city" label="City" autoComplete="address-level2" required />
              <SelectField id="state" label="State" required options={[...NIGERIAN_STATES]} />
            </div>
            <Field id="postal" label="Postal code (optional)" autoComplete="postal-code" />
          </fieldset>

          <fieldset>
            <legend className="font-mono-tight text-ink/55 mb-4">Payment</legend>
            <div className="border border-line p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-display text-2xl">Paystack</p>
                  <p className="font-italic-accent text-ink/55">
                    Cards, bank transfer, USSD — secured by Paystack.
                  </p>
                </div>
                <div className="font-mono-tight text-ink/55">₦ &nbsp; NGN</div>
              </div>
              {!paystackReady && (
                <p className="mt-4 bg-vermillion/10 border-l-2 border-vermillion px-3 py-2 font-mono-tight text-ink-soft">
                  Online payment is temporarily unavailable. Your order will be
                  recorded as <span className="font-mono-tight">PENDING</span>
                  &nbsp;and we&apos;ll reach out on WhatsApp to arrange payment.
                </p>
              )}
            </div>
          </fieldset>

          {error && (
            <p className="bg-vermillion/10 border-l-2 border-vermillion px-3 py-2 font-mono-tight text-ink-soft">
              {error}
            </p>
          )}
        </div>

        <aside className="col-span-12 lg:col-span-5 lg:sticky lg:top-24 self-start">
          <div className="bg-paper-deep p-6">
            <p className="font-mono-tight text-ink/55 mb-3">Order</p>
            <ul className="divide-y divide-ink/10">
              {lines.map((l) => (
                <li key={l.variantId} className="py-3 flex justify-between gap-4">
                  <div>
                    <p className="font-display text-lg leading-tight">{l.product.name}</p>
                    <p className="font-mono-tight text-ink/55">
                      {l.variant.size} × {l.quantity}
                    </p>
                  </div>
                  <p className="font-mono-tight whitespace-nowrap">
                    {l.lineTotalNGN > 0 ? formatNaira(l.lineTotalNGN) : "—"}
                  </p>
                </li>
              ))}
              {empty && (
                <li className="py-3 font-italic-accent text-ink/55">
                  Your cart is empty.
                </li>
              )}
              {cart.status === "loading" && (
                <li className="py-3 font-italic-accent text-ink/55">
                  Loading cart…
                </li>
              )}
            </ul>
            <div className="mt-5 pt-5 border-t border-ink/15 flex justify-between font-display text-2xl">
              <p>Total</p>
              <p>{subtotal > 0 ? formatNaira(subtotal) : "—"}</p>
            </div>
            <button
              type="submit"
              disabled={pending || empty || cart.status === "loading"}
              className="mt-6 w-full bg-ink text-paper py-4 font-mono-tight hover:bg-vermillion transition-colors disabled:opacity-40"
            >
              {pending
                ? "Placing order…"
                : paystackReady
                  ? "Pay with Paystack →"
                  : "Place order (pay-later) →"}
            </button>
            <p className="mt-3 font-mono-tight text-ink/55 text-center">
              By placing this order you agree to our terms.
            </p>
          </div>
        </aside>
      </form>
    </main>
  );
}

function Field({
  id,
  label,
  type = "text",
  required,
  autoComplete,
}: {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <div className="border-b border-line py-2">
      <label htmlFor={id} className="block font-mono-tight text-ink/55">
        {label}
        {required && <span className="text-vermillion"> *</span>}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        required={required}
        autoComplete={autoComplete}
        className="w-full bg-transparent py-1 outline-none font-display text-lg"
      />
    </div>
  );
}

function SelectField({
  id,
  label,
  options,
  required,
}: {
  id: string;
  label: string;
  options: string[];
  required?: boolean;
}) {
  return (
    <div className="border-b border-line py-2">
      <label htmlFor={id} className="block font-mono-tight text-ink/55">
        {label}
        {required && <span className="text-vermillion"> *</span>}
      </label>
      <select
        id={id}
        name={id}
        required={required}
        className="w-full bg-transparent py-1 outline-none font-display text-lg"
        defaultValue=""
      >
        <option value="" disabled>Select…</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
