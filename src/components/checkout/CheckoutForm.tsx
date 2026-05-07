"use client";

import { useCart } from "@/store/cart";
import { useHydrated } from "@/store/useHydrated";
import { products } from "@/data/products";
import { formatNaira } from "@/lib/utils";
import { isPaystackConfigured } from "@/lib/paystack";

const NIGERIAN_STATES = [
  "Lagos", "FCT - Abuja", "Rivers", "Oyo", "Kano", "Kaduna", "Enugu",
  "Anambra", "Ogun", "Edo", "Delta", "Akwa Ibom", "Cross River", "Imo",
  "Plateau", "Other",
] as const;

export function CheckoutForm() {
  const lines = useCart((s) => s.lines);
  const hydrated = useHydrated();

  const hydratedLines = lines
    .map((l) => {
      const product = products.find((p) => p.id === l.productId);
      const variant = product?.variants.find((v) => v.id === l.variantId);
      if (!product || !variant) return null;
      return { ...l, product, variant, lineTotalNGN: product.priceNGN * l.quantity };
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x));

  const subtotal = hydratedLines.reduce((s, l) => s + l.lineTotalNGN, 0);
  const paystackReady = isPaystackConfigured();

  return (
    <main className="mx-auto max-w-[1400px] px-5 md:px-10 py-12">
      <header className="mb-10 border-b border-line pb-6">
        <p className="font-mono-tight text-ink/55">Checkout · step 1 of 2</p>
        <h1 className="font-display text-6xl md:text-7xl tracking-tight">
          Almost <span className="font-italic-accent text-vermillion">there.</span>
        </h1>
      </header>

      <form
        onSubmit={(e) => e.preventDefault()}
        className="grid grid-cols-12 gap-10"
      >
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
                <div className="font-mono-tight text-ink/55">
                  ₦ &nbsp; NGN
                </div>
              </div>
              {!paystackReady && (
                <p className="mt-4 bg-vermillion/10 border-l-2 border-vermillion px-3 py-2 font-mono-tight text-ink-soft">
                  [PLACEHOLDER] Paystack SDK not yet installed. Awaiting HILCS #3
                  approval and the user&apos;s NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY in
                  .env.local. Submitting this form is intentionally disabled.
                </p>
              )}
            </div>
          </fieldset>
        </div>

        <aside className="col-span-12 lg:col-span-5 lg:sticky lg:top-24 self-start">
          <div className="bg-paper-deep p-6">
            <p className="font-mono-tight text-ink/55 mb-3">Order</p>
            <ul className="divide-y divide-ink/10">
              {hydrated && hydratedLines.map((l) => (
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
              {hydrated && hydratedLines.length === 0 && (
                <li className="py-3 font-italic-accent text-ink/55">
                  Your cart is empty.
                </li>
              )}
            </ul>
            <div className="mt-5 pt-5 border-t border-ink/15 flex justify-between font-display text-2xl">
              <p>Total</p>
              <p>{subtotal > 0 ? formatNaira(subtotal) : "—"}</p>
            </div>
            <button
              type="submit"
              disabled={!paystackReady || hydratedLines.length === 0}
              className="mt-6 w-full bg-ink text-paper py-4 font-mono-tight hover:bg-vermillion transition-colors disabled:opacity-40"
            >
              {paystackReady ? "Pay with Paystack →" : "Payment unavailable"}
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
