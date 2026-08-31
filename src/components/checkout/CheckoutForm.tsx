"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/cart";
import { useHydratedCart } from "@/store/useHydratedCart";
import { useMoney } from "@/components/currency/CurrencyProvider";
import { formatMoney } from "@/lib/currency";
import { SHIPPING_COUNTRIES, SHIPPING_COUNTRY_NAMES } from "@/lib/constants";

const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? "";

export function CheckoutForm() {
  const router = useRouter();
  const money = useMoney();
  const cart = useHydratedCart();
  // Destination drives the region/postal fields. Default to the country that
  // matches the currency being browsed in — a US visitor shouldn't have to
  // find "United States" in a list before the form makes sense.
  const [country, setCountry] = useState(
    money.code === "USD" ? "United States" : "Nigeria",
  );
  const destination = SHIPPING_COUNTRIES[country] ?? SHIPPING_COUNTRIES.Nigeria;
  const clearCart = useCart((s) => s.clear);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const lines = cart.lines;
  const subtotal = lines.reduce((s, l) => s + l.lineTotalNGN, 0);
  // Presentment subtotal: sum the converted line totals rather than
  // converting the naira subtotal, so it matches the lines shown above it.
  const subtotalMajor = lines.reduce(
    (s, l) => s + money.line(l.unitPriceNGN, l.quantity),
    0,
  );
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
        country,
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
      <header className="mb-10 border-b-[3px] border-ink pb-6">
        <span className="stamp text-vermillion">Waybill · step 1 of 2</span>
        <h1 className="font-display text-6xl md:text-7xl mt-3">
          Almost <span className="text-vermillion">there.</span>
        </h1>
      </header>

      <form onSubmit={onSubmit} className="grid grid-cols-12 gap-y-10 gap-x-2 lg:gap-10">
        <div className="col-span-12 lg:col-span-7 space-y-10">
          <fieldset>
            <legend className="stamp text-ink/60 mb-4">01 · Contact</legend>
            <Field id="email" label="Email" type="email" autoComplete="email" required />
            <Field id="phone" label="Phone (WhatsApp)" type="tel" autoComplete="tel" required />
          </fieldset>

          <fieldset>
            <legend className="stamp text-ink/60 mb-4">02 · Delivery</legend>
            <div className="grid grid-cols-2 gap-x-4">
              <Field id="firstName" label="First name" autoComplete="given-name" required />
              <Field id="lastName" label="Last name" autoComplete="family-name" required />
            </div>
            <SelectField
              id="country"
              label="Country"
              required
              options={SHIPPING_COUNTRY_NAMES}
              value={country}
              onChange={setCountry}
            />
            <Field id="address1" label="Street address" autoComplete="address-line1" required />
            <Field id="address2" label="Apt, suite, etc. (optional)" autoComplete="address-line2" />
            <div className="grid grid-cols-2 gap-x-4">
              <Field id="city" label="City" autoComplete="address-level2" required />
              <SelectField
                key={country}
                id="state"
                label={destination.stateLabel}
                required
                options={[...destination.states]}
              />
            </div>
            <Field
              id="postal"
              label={destination.postalLabel}
              autoComplete="postal-code"
              required={destination.postalRequired}
            />
          </fieldset>

          <fieldset>
            <legend className="stamp text-ink/60 mb-4">03 · Payment</legend>
            <div className="relative border-2 border-ink p-5">
              <span className="absolute top-0 right-0 w-6 h-[3px] bg-vermillion" />
              <span className="absolute top-0 right-0 w-[3px] h-6 bg-vermillion" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-display text-2xl">Paystack</p>
                  <p className="font-mono-tight text-ink/55 mt-1">
                    Cards · bank transfer · USSD
                  </p>
                </div>
                <div className="font-mono-tight text-ink/55">
                  {money.code === "NGN" ? "₦ NGN" : `$ ${money.code}`}
                </div>
              </div>
              {money.code !== "NGN" && subtotal > 0 && (
                <p className="mt-4 font-mono-tight text-ink/55 leading-relaxed">
                  Prices are shown in {money.code} at ₦{money.rate.toLocaleString()}/
                  {money.code}. Your card is charged{" "}
                  <span className="text-ink">{formatMoney(subtotal, "NGN")}</span> and your
                  bank converts at its own rate, so the final amount may differ by a little.
                </p>
              )}
              {!paystackReady && (
                <p className="mt-4 bg-vermillion/10 border-l-[3px] border-vermillion px-3 py-2 font-mono-tight text-ink-soft">
                  Online payment is temporarily unavailable. Your order will be
                  recorded as <span className="font-mono-tight">PENDING</span>
                  &nbsp;and we&apos;ll reach out on WhatsApp to arrange payment.
                </p>
              )}
            </div>
          </fieldset>

          {error && (
            <p className="bg-vermillion/10 border-l-[3px] border-vermillion px-3 py-2 font-mono-tight text-ink-soft">
              {error}
            </p>
          )}
        </div>

        <aside className="col-span-12 lg:col-span-5 lg:sticky lg:top-24 self-start">
          <div className="relative border-2 border-ink p-6 bg-paper shadow-[6px_6px_0_0_var(--ink)]">
            <span className="absolute top-0 left-0 w-8 h-[3px] bg-vermillion" />
            <span className="absolute top-0 left-0 w-[3px] h-8 bg-vermillion" />

            <span className="stamp text-ink/60">Order summary</span>
            <ul className="divide-y divide-line mt-3">
              {lines.map((l, idx) => (
                <li key={l.variantId} className="py-3 flex justify-between gap-4">
                  <div className="flex gap-3 min-w-0">
                    <span className="font-mono-tight text-ink/40 shrink-0">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0">
                      <p className="font-display text-lg leading-tight truncate">
                        {l.product.name}
                      </p>
                      <p className="font-mono-tight text-ink/55">
                        {l.variant.size} × {l.quantity}
                      </p>
                    </div>
                  </div>
                  <p className="font-mono-tight whitespace-nowrap">
                    {l.lineTotalNGN > 0 ? money.formatLine(l.unitPriceNGN, l.quantity) : "—"}
                  </p>
                </li>
              ))}
              {empty && (
                <li className="py-4 text-center">
                  <span className="stamp text-ink/40">Cart is empty</span>
                </li>
              )}
              {cart.status === "loading" && (
                <li className="py-4 text-center">
                  <span className="stamp text-ink/40">Loading…</span>
                </li>
              )}
            </ul>
            <div className="mt-5 pt-5 border-t-2 border-ink flex justify-between items-baseline">
              <p className="font-condensed text-[0.82rem]">Total</p>
              <p className="font-display text-3xl">
                {subtotal > 0 ? money.formatMajor(subtotalMajor) : "—"}
              </p>
            </div>
            <button
              type="submit"
              disabled={pending || empty || cart.status === "loading"}
              className="btn-wipe btn-wipe-hazard mt-6 w-full bg-ink text-paper py-4 font-condensed text-[0.82rem] transition-colors duration-200 disabled:opacity-40"
            >
              {pending
                ? "Placing order…"
                : paystackReady
                  ? "Pay with Paystack →"
                  : "Place order (pay-later) →"}
            </button>
            <p className="mt-4 font-mono-tight text-ink/55 text-center text-xs">
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
    <div className="border-b-2 border-line py-2 focus-within:border-vermillion transition-colors">
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
  value,
  onChange,
}: {
  id: string;
  label: string;
  options: string[];
  required?: boolean;
  value?: string;
  onChange?: (value: string) => void;
}) {
  const controlled = value !== undefined;
  return (
    <div className="border-b-2 border-line py-2 focus-within:border-vermillion transition-colors">
      <label htmlFor={id} className="block font-mono-tight text-ink/55">
        {label}
        {required && <span className="text-vermillion"> *</span>}
      </label>
      <select
        id={id}
        name={id}
        required={required}
        className="w-full bg-transparent py-1 outline-none font-display text-lg"
        {...(controlled
          ? { value, onChange: (e) => onChange?.(e.target.value) }
          : { defaultValue: "" })}
      >
        {!controlled && <option value="" disabled>Select…</option>}
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
