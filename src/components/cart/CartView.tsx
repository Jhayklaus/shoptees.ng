"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/store/cart";
import { useHydratedCart } from "@/store/useHydratedCart";
import { useMoney } from "@/components/currency/CurrencyProvider";
import { Trash2, ArrowUpRight } from "lucide-react";

// Cart styled as a packing slip / waybill: numbered order lines, mono
// metadata, hard rules, and a stamped summary panel.
export function CartView() {
  const money = useMoney();
  const remove = useCart((s) => s.remove);
  const setQuantity = useCart((s) => s.setQuantity);
  const state = useHydratedCart();

  const isLoading = state.status === "loading";
  const lines = state.lines;
  const subtotal = lines.reduce((s, l) => s + l.lineTotalNGN, 0);
  // Presentment subtotal: sum the converted line totals rather than
  // converting the naira subtotal, so it matches the lines shown above it.
  const subtotalMajor = lines.reduce(
    (s, l) => s + money.line(l.unitPriceNGN, l.quantity),
    0,
  );

  if (state.status === "ready" && lines.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-5 md:px-10 py-24 text-center">
        <span className="stamp text-ink/50">Cart · empty</span>
        <h1 className="font-display text-6xl md:text-7xl leading-[0.92] mt-4">
          Nothing yet,
          <br />
          <span className="text-vermillion">go and look.</span>
        </h1>
        <Link
          href="/shop"
          className="btn-wipe inline-flex items-center gap-2 mt-10 border-2 border-ink px-7 py-3.5 font-condensed text-[0.78rem] hover:text-paper transition-colors duration-200"
        >
          Browse the collection
          <ArrowUpRight size={14} className="text-vermillion" />
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1400px] px-5 md:px-10 py-12">
      <header className="mb-10 border-b-[3px] border-ink pb-6">
        <span className="stamp text-vermillion">
          Packing slip ·{" "}
          {isLoading
            ? "--"
            : `${String(lines.length).padStart(2, "0")} item${lines.length === 1 ? "" : "s"}`}
        </span>
        <h1 className="font-display text-6xl md:text-7xl mt-3">
          Your <span className="text-vermillion">basket.</span>
        </h1>
      </header>

      {state.status === "ready" && state.dropped.length > 0 && (
        <p className="mb-6 font-mono-tight bg-vermillion/10 border-l-[3px] border-vermillion px-3 py-2 text-ink-soft">
          Some items were no longer available and have been removed from your cart.
        </p>
      )}

      <div className="grid grid-cols-12 gap-y-10 gap-x-2 lg:gap-10">
        <ul className="col-span-12 lg:col-span-8 divide-y-2 divide-line border-y-2 border-ink">
          {lines.map((l, idx) => {
            const hero = l.product.images[0];
            return (
              <li key={l.variantId} className="py-6 grid grid-cols-12 gap-4 items-center">
                {/* Line number — waybill row index */}
                <div className="hidden sm:block sm:col-span-1 font-mono-tight text-ink/40">
                  {String(idx + 1).padStart(2, "0")}
                </div>

                <div className="col-span-3 sm:col-span-2 relative aspect-[4/5] bg-paper-deep">
                  {hero && (
                    <Image
                      src={hero.url}
                      alt={hero.alt || l.product.name}
                      fill
                      sizes="120px"
                      className="object-cover"
                    />
                  )}
                  <span className="absolute top-0 left-0 w-4 h-[2px] bg-vermillion" />
                  <span className="absolute top-0 left-0 w-[2px] h-4 bg-vermillion" />
                </div>

                <div className="col-span-9 sm:col-span-4">
                  <Link
                    href={`/shop/${l.product.slug}`}
                    className="font-display text-2xl leading-tight hover:text-vermillion"
                  >
                    {l.product.name}
                  </Link>
                  <p className="font-mono-tight text-ink/55 mt-1.5">
                    SIZE {l.variant.size} · {l.variant.color}
                  </p>
                  <p className="font-mono-tight text-ink/40">SKU {l.variant.sku}</p>
                </div>

                <div className="col-span-6 sm:col-span-3 flex items-center">
                  <div className="inline-flex items-center border-2 border-ink">
                    <button
                      type="button"
                      onClick={() => setQuantity(l.variantId, Math.max(0, l.quantity - 1))}
                      aria-label={`Decrease quantity of ${l.product.name}`}
                      className="w-9 h-9 hover:bg-ink hover:text-paper transition-colors font-mono-tight"
                    >
                      −
                    </button>
                    <span className="w-10 text-center font-mono-tight font-bold">
                      {String(l.quantity).padStart(2, "0")}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity(l.variantId, Math.min(l.variant.stock, l.quantity + 1))
                      }
                      aria-label={`Increase quantity of ${l.product.name}`}
                      className="w-9 h-9 hover:bg-ink hover:text-paper transition-colors font-mono-tight"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="col-span-6 sm:col-span-2 flex items-center justify-end gap-3">
                  <p className="font-mono-tight font-bold">
                    {l.lineTotalNGN > 0 ? money.formatLine(l.unitPriceNGN, l.quantity) : "—"}
                  </p>
                  <button
                    type="button"
                    onClick={() => remove(l.variantId)}
                    aria-label={`Remove ${l.product.name}`}
                    className="text-ink/40 hover:text-vermillion transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            );
          })}
          {isLoading && (
            <li className="py-12 text-center">
              <span className="stamp text-ink/40">Loading cart…</span>
            </li>
          )}
        </ul>

        <aside className="col-span-12 lg:col-span-4 lg:sticky lg:top-24 self-start">
          <div className="relative border-2 border-ink p-6 bg-paper shadow-[6px_6px_0_0_var(--ink)]">
            <span className="absolute top-0 left-0 w-8 h-[3px] bg-vermillion" />
            <span className="absolute top-0 left-0 w-[3px] h-8 bg-vermillion" />

            <span className="stamp text-ink/60">Summary</span>
            <dl className="mt-4 space-y-2.5">
              <div className="flex justify-between font-mono-tight">
                <dt className="text-ink/55">Subtotal</dt>
                <dd className="font-bold">{subtotal > 0 ? money.formatMajor(subtotalMajor) : "—"}</dd>
              </div>
              <div className="flex justify-between font-mono-tight">
                <dt className="text-ink/55">Shipping</dt>
                <dd className="text-ink/55">at checkout</dd>
              </div>
            </dl>
            <div className="mt-5 pt-5 border-t-2 border-ink flex justify-between items-baseline">
              <p className="font-condensed text-[0.82rem]">Total</p>
              <p className="font-display text-3xl">
                {subtotal > 0 ? money.formatMajor(subtotalMajor) : "—"}
              </p>
            </div>
            <Link
              href="/checkout"
              aria-disabled={lines.length === 0}
              className={`btn-wipe btn-wipe-hazard mt-6 block text-center py-4 font-condensed text-[0.82rem] transition-colors duration-200 ${
                lines.length === 0
                  ? "bg-ink/40 text-paper pointer-events-none"
                  : "bg-ink text-paper"
              }`}
            >
              Proceed to checkout →
            </Link>
            <Link
              href="/shop"
              className="block text-center mt-4 font-condensed text-[0.72rem] underline-offset-4 hover:underline hover:text-vermillion"
            >
              Continue shopping
            </Link>
          </div>
          <p className="mt-5 font-mono-tight text-ink/55 text-sm">
            We pack in paper. Lagos deliveries usually go out within 48h.
          </p>
        </aside>
      </div>
    </main>
  );
}
