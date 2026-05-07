"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/types";
import { formatNaira } from "@/lib/utils";
import { useCart } from "@/store/cart";
import { Check } from "lucide-react";

export function ProductDetail({ product }: { product: Product }) {
  const router = useRouter();
  const inStockVariants = product.variants.filter((v) => v.inStock);
  const [variantId, setVariantId] = useState<string>(
    inStockVariants[0]?.id ?? product.variants[0]?.id
  );
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const add = useCart((s) => s.add);

  const variant = product.variants.find((v) => v.id === variantId);

  const onAdd = () => {
    if (!variant) return;
    add({ productId: product.id, variantId: variant.id, quantity: qty });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const onBuyNow = () => {
    if (!variant) return;
    add({ productId: product.id, variantId: variant.id, quantity: qty });
    router.push("/checkout");
  };

  return (
    <main className="mx-auto max-w-[1400px] px-5 md:px-10 pt-8 pb-24">
      <p className="font-mono-tight text-ink/55 mb-6">
        <Link href="/shop" className="hover:text-vermillion">Shop</Link> / {product.category}
      </p>

      <div className="grid grid-cols-12 gap-6 lg:gap-12">
        {/* Gallery */}
        <div className="col-span-12 lg:col-span-7">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(product.images.length > 1 ? product.images : [...product.images, ...product.images, ...product.images, ...product.images]).slice(0, 4).map((img, i) => (
              <div
                key={i}
                className={`relative aspect-[4/5] bg-paper-deep ${i === 0 ? "md:col-span-2" : ""}`}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  priority={i === 0}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Info column — sticky on desktop */}
        <aside className="col-span-12 lg:col-span-5 lg:sticky lg:top-24 self-start">
          <h1 className="font-display text-5xl md:text-6xl leading-[0.95] tracking-tight">
            {product.name}
          </h1>
          <p className="font-italic-accent text-xl text-ink/55 mt-2">
            {product.category}
          </p>

          <p className="mt-6 font-display text-3xl">
            {product.priceNGN > 0 ? formatNaira(product.priceNGN) : "[PLACEHOLDER price]"}
          </p>

          <p className="mt-6 text-ink-soft leading-relaxed">{product.description}</p>

          {/* Size picker */}
          <div className="mt-8">
            <p className="font-mono-tight text-ink/55 mb-3">Size</p>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((v) => {
                const selected = v.id === variantId;
                return (
                  <button
                    key={v.id}
                    type="button"
                    disabled={!v.inStock}
                    onClick={() => setVariantId(v.id)}
                    className={[
                      "font-mono-tight px-4 py-2 border transition-colors",
                      selected
                        ? "bg-ink text-paper border-ink"
                        : "border-line hover:border-ink",
                      !v.inStock && "opacity-40 line-through cursor-not-allowed",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {v.size}
                  </button>
                );
              })}
            </div>
            {variant && !variant.inStock && (
              <p className="font-mono-tight text-vermillion mt-2">Sold out</p>
            )}
          </div>

          {/* Quantity */}
          <div className="mt-6">
            <p className="font-mono-tight text-ink/55 mb-3">Quantity</p>
            <div className="inline-flex items-center border border-line">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="px-4 py-2 hover:bg-ink hover:text-paper transition-colors"
              >
                −
              </button>
              <span className="px-5 font-mono-tight">{qty}</span>
              <button
                type="button"
                onClick={() => setQty((q) => q + 1)}
                aria-label="Increase quantity"
                className="px-4 py-2 hover:bg-ink hover:text-paper transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-8 flex flex-col gap-3">
            <button
              type="button"
              onClick={onAdd}
              disabled={!variant?.inStock}
              className="relative w-full bg-ink text-paper py-4 font-mono-tight hover:bg-vermillion transition-colors disabled:opacity-40 disabled:hover:bg-ink"
            >
              {added ? (
                <span className="inline-flex items-center gap-2 justify-center">
                  <Check size={16} /> Added to cart
                </span>
              ) : (
                "Add to cart"
              )}
            </button>
            <button
              type="button"
              onClick={onBuyNow}
              disabled={!variant?.inStock}
              className="w-full border border-ink py-4 font-mono-tight hover:bg-ink hover:text-paper transition-colors disabled:opacity-40"
            >
              Buy now
            </button>
          </div>

          {/* Care notes */}
          <dl className="mt-10 border-t border-line pt-5 grid grid-cols-2 gap-y-3 text-sm">
            <dt className="font-mono-tight text-ink/55">SKU</dt>
            <dd className="font-mono-tight">{variant?.sku ?? "—"}</dd>
            <dt className="font-mono-tight text-ink/55">Material</dt>
            <dd>[PLACEHOLDER · 220gsm cotton]</dd>
            <dt className="font-mono-tight text-ink/55">Made in</dt>
            <dd>Nigeria</dd>
            <dt className="font-mono-tight text-ink/55">Care</dt>
            <dd>Cold wash, line dry</dd>
          </dl>
        </aside>
      </div>
    </main>
  );
}
