"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/store/cart";
import { useHydrated } from "@/store/useHydrated";
import { products } from "@/data/products";
import { formatNaira } from "@/lib/utils";
import { Trash2 } from "lucide-react";

export function CartView() {
  const lines = useCart((s) => s.lines);
  const remove = useCart((s) => s.remove);
  const setQuantity = useCart((s) => s.setQuantity);
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

  if (hydrated && hydratedLines.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-5 md:px-10 py-24 text-center">
        <p className="font-mono-tight text-ink/55 mb-3">Cart · empty</p>
        <h1 className="font-display text-6xl tracking-tight">
          Nothing yet,
          <br />
          <span className="font-italic-accent text-vermillion">go and look.</span>
        </h1>
        <Link
          href="/shop"
          className="inline-block mt-10 border border-ink px-6 py-3 font-mono-tight hover:bg-ink hover:text-paper transition-colors"
        >
          Browse the collection →
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1400px] px-5 md:px-10 py-12">
      <header className="mb-10 border-b border-line pb-6">
        <p className="font-mono-tight text-ink/55">Cart · {hydratedLines.length} item{hydratedLines.length === 1 ? "" : "s"}</p>
        <h1 className="font-display text-6xl md:text-7xl tracking-tight">
          Your <span className="font-italic-accent text-vermillion">basket.</span>
        </h1>
      </header>

      <div className="grid grid-cols-12 gap-10">
        <ul className="col-span-12 lg:col-span-8 divide-y divide-line border-y border-line">
          {hydratedLines.map((l) => (
            <li key={l.variantId} className="py-6 grid grid-cols-12 gap-4 items-center">
              <div className="col-span-3 sm:col-span-2 relative aspect-[4/5] bg-paper-deep">
                <Image
                  src={l.product.images[0]?.src ?? ""}
                  alt={l.product.images[0]?.alt ?? l.product.name}
                  fill
                  sizes="120px"
                  className="object-cover"
                />
              </div>
              <div className="col-span-9 sm:col-span-5">
                <Link href={`/shop/${l.product.slug}`} className="font-display text-2xl leading-tight hover:text-vermillion">
                  {l.product.name}
                </Link>
                <p className="font-mono-tight text-ink/55 mt-1">
                  {l.variant.size} · {l.variant.color}
                </p>
                <p className="font-mono-tight text-ink/55">SKU {l.variant.sku}</p>
              </div>
              <div className="col-span-6 sm:col-span-3 flex items-center">
                <div className="inline-flex items-center border border-line">
                  <button
                    type="button"
                    onClick={() => setQuantity(l.variantId, Math.max(0, l.quantity - 1))}
                    aria-label={`Decrease quantity of ${l.product.name}`}
                    className="px-3 py-1.5 hover:bg-ink hover:text-paper transition-colors"
                  >
                    −
                  </button>
                  <span className="px-4 font-mono-tight">{l.quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(l.variantId, l.quantity + 1)}
                    aria-label={`Increase quantity of ${l.product.name}`}
                    className="px-3 py-1.5 hover:bg-ink hover:text-paper transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="col-span-6 sm:col-span-2 flex items-center justify-end gap-3">
                <p className="font-display text-xl">
                  {l.lineTotalNGN > 0 ? formatNaira(l.lineTotalNGN) : "—"}
                </p>
                <button
                  type="button"
                  onClick={() => remove(l.variantId)}
                  aria-label={`Remove ${l.product.name}`}
                  className="text-ink/40 hover:text-vermillion"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>

        <aside className="col-span-12 lg:col-span-4 lg:sticky lg:top-24 self-start">
          <div className="bg-paper-deep p-6">
            <p className="font-mono-tight text-ink/55 mb-3">Summary</p>
            <dl className="space-y-2">
              <div className="flex justify-between font-display text-lg">
                <dt>Subtotal</dt>
                <dd>{subtotal > 0 ? formatNaira(subtotal) : "[PLACEHOLDER]"}</dd>
              </div>
              <div className="flex justify-between text-ink-soft">
                <dt>Shipping</dt>
                <dd className="font-mono-tight">calculated at checkout</dd>
              </div>
              <div className="flex justify-between text-ink-soft">
                <dt>Tax</dt>
                <dd className="font-mono-tight">included</dd>
              </div>
            </dl>
            <div className="mt-5 pt-5 border-t border-ink/15 flex justify-between font-display text-2xl">
              <p>Total</p>
              <p>{subtotal > 0 ? formatNaira(subtotal) : "—"}</p>
            </div>
            <Link
              href="/checkout"
              className="mt-6 block bg-ink text-paper text-center py-4 font-mono-tight hover:bg-vermillion transition-colors"
            >
              Proceed to checkout →
            </Link>
            <Link href="/shop" className="block text-center mt-3 font-mono-tight underline-offset-4 hover:underline">
              Continue shopping
            </Link>
          </div>
          <p className="mt-4 font-italic-accent text-sm text-ink/55">
            We pack in paper. Lagos deliveries usually go out within 48h.
          </p>
        </aside>
      </div>
    </main>
  );
}
