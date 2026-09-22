"use client";

import Image from "next/image";
import { productImageUrl } from "@/lib/images";
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
        <p className="font-label text-muted">Your bag is empty</p>
        <h1 className="font-display text-[clamp(1.9rem,5vw,3rem)] mt-3">Nothing in here yet</h1>
        <Link href="/shop" className="btn btn-ghost press mt-8">
          Browse the shop
          <ArrowUpRight size={14} />
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1400px] px-5 md:px-10 py-12">
      <header className="mb-8 border-b border-line pb-5">
        <p className="font-label text-muted mb-2">
          {isLoading
            ? "--"
            : `${String(lines.length).padStart(2, "0")} item${lines.length === 1 ? "" : "s"}`}
        </p>
        <h1 className="font-display text-[clamp(1.9rem,5vw,3rem)]">Your bag</h1>
      </header>

      {state.status === "ready" && state.dropped.length > 0 && (
        <p className="mb-6 font-label border-l-2 border-vermillion pl-3 py-2 text-ink-soft normal-case tracking-normal">
          Some items were no longer available and have been removed from your cart.
        </p>
      )}

      <div className="grid grid-cols-12 gap-y-10 gap-x-2 lg:gap-10">
        <ul className="col-span-12 lg:col-span-8 divide-y divide-line border-y border-line">
          {lines.map((l, idx) => {
            const hero = l.product.images[0];
            return (
              <li key={l.variantId} className="py-6 grid grid-cols-12 gap-4 items-center">
                {/* Line number — waybill row index */}
                <div className="hidden sm:block sm:col-span-1 font-label text-muted">
                  {String(idx + 1).padStart(2, "0")}
                </div>

                <div className="shot col-span-3 sm:col-span-2 aspect-square">
                  {hero && (
                    <Image
                      src={productImageUrl(hero.url)}
                      alt={hero.alt || l.product.name}
                      fill
                      sizes="120px"
                      className="object-contain p-2"
                    />
                  )}
                </div>

                <div className="col-span-9 sm:col-span-4">
                  <Link
                    href={`/shop/${l.product.slug}`}
                    className="font-sub text-[0.98rem] hover:underline underline-offset-4 decoration-1"
                  >
                    {l.product.name}
                  </Link>
                  <p className="font-label text-muted mt-1.5">
                    {l.variant.size} · {l.variant.color}
                  </p>
                  <p className="font-label text-muted">SKU {l.variant.sku}</p>
                </div>

                <div className="col-span-6 sm:col-span-3 flex items-center">
                  <div className="inline-flex items-center border-2 border-ink">
                    <button
                      type="button"
                      onClick={() => setQuantity(l.variantId, Math.max(0, l.quantity - 1))}
                      aria-label={`Decrease quantity of ${l.product.name}`}
                      className="w-9 h-9 hover:bg-ink hover:text-paper transition-colors leading-none"
                    >
                      −
                    </button>
                    <span className="w-10 text-center font-sub tnum text-[0.88rem]">
                      {String(l.quantity).padStart(2, "0")}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity(l.variantId, Math.min(l.variant.stock, l.quantity + 1))
                      }
                      aria-label={`Increase quantity of ${l.product.name}`}
                      className="w-9 h-9 hover:bg-ink hover:text-paper transition-colors leading-none"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="col-span-6 sm:col-span-2 flex items-center justify-end gap-3">
                  <p className="font-sub tnum text-[0.9rem]">
                    {l.lineTotalNGN > 0 ? money.formatLine(l.unitPriceNGN, l.quantity) : "—"}
                  </p>
                  <button
                    type="button"
                    onClick={() => remove(l.variantId)}
                    aria-label={`Remove ${l.product.name}`}
                    className="text-muted hover:text-vermillion transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            );
          })}
          {isLoading && (
            <li className="py-12 text-center">
              <p className="font-label text-muted">Loading cart…</p>
            </li>
          )}
        </ul>

        <aside className="col-span-12 lg:col-span-4 lg:sticky lg:top-24 self-start">
          <div className="border border-line p-6 bg-shot">
            <p className="font-label text-muted">Summary</p>
            <dl className="mt-4 space-y-2.5">
              <div className="flex justify-between font-label">
                <dt className="text-muted">Subtotal</dt>
                <dd className="font-sub tnum">{subtotal > 0 ? money.formatMajor(subtotalMajor) : "—"}</dd>
              </div>
              <div className="flex justify-between font-label">
                <dt className="text-muted">Shipping</dt>
                <dd className="text-muted">at checkout</dd>
              </div>
            </dl>
            <div className="mt-5 pt-5 border-t border-line flex justify-between items-baseline">
              <p className="font-label text-ink">Total</p>
              <p className="font-sub tnum text-xl">
                {subtotal > 0 ? money.formatMajor(subtotalMajor) : "—"}
              </p>
            </div>
            <Link
              href="/checkout"
              aria-disabled={lines.length === 0}
              className={`btn press mt-6 w-full py-4 ${
                lines.length === 0 ? "opacity-40 pointer-events-none" : ""
              }`}
            >
              Proceed to checkout
            </Link>
            <Link
              href="/shop"
              className="block text-center mt-4 font-label text-muted hover:text-ink transition-colors"
            >
              Continue shopping
            </Link>
          </div>
          <p className="mt-5 font-label text-muted normal-case tracking-normal">
            We pack in paper. Lagos deliveries usually go out within 48h.
          </p>
        </aside>
      </div>
    </main>
  );
}
