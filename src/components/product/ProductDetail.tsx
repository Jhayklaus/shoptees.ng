"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { DisplayProduct, DisplayImage } from "@/types";
import { formatNaira } from "@/lib/utils";
import { useCart } from "@/store/cart";
import { Check } from "lucide-react";

export function ProductDetail({ product }: { product: DisplayProduct }) {
  const router = useRouter();
  const inStockVariants = product.variants.filter((v) => v.stock > 0);
  const [variantId, setVariantId] = useState<string>(
    inStockVariants[0]?.id ?? product.variants[0]?.id ?? ""
  );
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const add = useCart((s) => s.add);

  const variant = product.variants.find((v) => v.id === variantId);
  const inStock = (variant?.stock ?? 0) > 0;
  const displayPrice = variant?.priceOverrideNGN ?? product.priceNGN;

  const onAdd = () => {
    if (!variant || !inStock) return;
    add({ productId: product.id, variantId: variant.id, quantity: qty });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const onBuyNow = () => {
    if (!variant || !inStock) return;
    add({ productId: product.id, variantId: variant.id, quantity: qty });
    router.push("/checkout");
  };

  return (
    <main className="mx-auto max-w-[1400px] px-5 md:px-10 pt-8 pb-24">
      <p className="font-mono-tight text-ink/55 mb-6">
        <Link href="/shop" className="hover:text-vermillion">Shop</Link>
        {product.category && <> / {product.category.name}</>}
      </p>

      <div className="grid grid-cols-12 gap-6 lg:gap-12">
        <div className="col-span-12 lg:col-span-6 xl:col-span-7">
          <div className="max-w-[520px] mx-auto lg:mx-0">
            <ProductGallery images={product.images} fallbackAlt={product.name} />
          </div>
        </div>

        <aside className="col-span-12 lg:col-span-6 xl:col-span-5 lg:sticky lg:top-24 self-start">
          <h1 className="font-display text-5xl md:text-6xl leading-[0.95] tracking-tight">
            {product.name}
          </h1>
          {product.category && (
            <p className="font-italic-accent text-xl text-ink/55 mt-2">
              {product.category.name}
            </p>
          )}

          <p className="mt-6 font-display text-3xl">
            {displayPrice > 0 ? formatNaira(displayPrice) : "[PLACEHOLDER price]"}
          </p>

          <p className="mt-6 text-ink-soft leading-relaxed whitespace-pre-line">
            {product.description}
          </p>

          <div className="mt-8">
            <p className="font-mono-tight text-ink/55 mb-3">Size</p>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((v) => {
                const selected = v.id === variantId;
                const out = v.stock === 0;
                return (
                  <button
                    key={v.id}
                    type="button"
                    disabled={out}
                    onClick={() => setVariantId(v.id)}
                    className={[
                      "font-mono-tight px-4 py-2 border transition-colors",
                      selected ? "bg-ink text-paper border-ink" : "border-line hover:border-ink",
                      out && "opacity-40 line-through cursor-not-allowed",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {v.size}
                  </button>
                );
              })}
            </div>
            {variant && !inStock && (
              <p className="font-mono-tight text-vermillion mt-2">Sold out</p>
            )}
          </div>

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
                onClick={() => setQty((q) => Math.min(variant?.stock ?? 99, q + 1))}
                aria-label="Increase quantity"
                className="px-4 py-2 hover:bg-ink hover:text-paper transition-colors"
              >
                +
              </button>
            </div>
            {variant && inStock && variant.stock <= 5 && (
              <p className="font-mono-tight text-vermillion mt-2 text-xs">
                Only {variant.stock} left
              </p>
            )}
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <button
              type="button"
              onClick={onAdd}
              disabled={!inStock}
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
              disabled={!inStock}
              className="w-full border border-ink py-4 font-mono-tight hover:bg-ink hover:text-paper transition-colors disabled:opacity-40"
            >
              Buy now
            </button>
          </div>

          <dl className="mt-10 border-t border-line pt-5 grid grid-cols-2 gap-y-3 text-sm">
            <dt className="font-mono-tight text-ink/55">SKU</dt>
            <dd className="font-mono-tight">{variant?.sku ?? "—"}</dd>
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

function ProductGallery({
  images,
  fallbackAlt,
}: {
  images: DisplayImage[];
  fallbackAlt: string;
}) {
  const [activeIdx, setActiveIdx] = useState(0);

  if (images.length === 0) {
    return (
      <div className="aspect-[4/5] bg-paper-deep flex items-center justify-center font-italic-accent text-ink/30">
        no images
      </div>
    );
  }

  const active = images[Math.min(activeIdx, images.length - 1)];

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (images.length < 2) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      setActiveIdx((i) => (i + 1) % images.length);
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      setActiveIdx((i) => (i - 1 + images.length) % images.length);
    }
  };

  return (
    <div onKeyDown={onKeyDown}>
      {/* Hero — selected image */}
      <div
        className="relative aspect-[4/5] bg-paper-deep overflow-hidden"
        role="region"
        aria-roledescription="product gallery"
        aria-label={`${fallbackAlt} — image ${activeIdx + 1} of ${images.length}`}
      >
        <Image
          key={active.url}
          src={active.url}
          alt={active.alt || fallbackAlt}
          fill
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="object-contain p-6 rise"
          priority
        />
        {images.length > 1 && (
          <span className="absolute bottom-3 right-3 font-mono-tight bg-paper/85 text-ink px-2 py-0.5 backdrop-blur-sm">
            {String(activeIdx + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
          </span>
        )}
      </div>

      {/* Thumbnails — small fixed-size tiles, wrap if there are many */}
      {images.length > 1 && (
        <div
          className="mt-3 flex flex-wrap gap-2"
          role="tablist"
          aria-label="Choose product image"
        >
          {images.map((img, i) => {
            const isActive = i === activeIdx;
            return (
              <button
                key={img.url + i}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`Show image ${i + 1}`}
                onClick={() => setActiveIdx(i)}
                onMouseEnter={() => setActiveIdx(i)}
                className={[
                  "relative w-16 h-16 shrink-0 bg-paper-deep overflow-hidden transition-all",
                  isActive
                    ? "outline outline-2 outline-offset-2 outline-vermillion"
                    : "opacity-65 hover:opacity-100",
                ].join(" ")}
              >
                <Image
                  src={img.url}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
