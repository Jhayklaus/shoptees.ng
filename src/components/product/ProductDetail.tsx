"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { DisplayProduct, DisplayImage } from "@/types";
import { useMoney } from "@/components/currency/CurrencyProvider";
import { useCart } from "@/store/cart";
import { Check, ArrowUpRight } from "lucide-react";

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
  const money = useMoney();
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
    <main className="mx-auto max-w-[1400px] px-5 md:px-10 pt-8 pb-32 lg:pb-24">
      {/* Breadcrumb as a routing slip */}
      <p className="font-mono-tight text-ink/55 mb-6">
        <Link href="/shop" className="hover:text-vermillion">Shop</Link>
        {product.collection && (
          <>
            {" "}/{" "}
            <Link
              href={`/collections/${product.collection.slug}`}
              className="hover:text-vermillion"
            >
              {product.collection.name}
            </Link>
          </>
        )}
        {product.category && (
          <>
            {" "}/{" "}
            <Link
              href={`/shop?c=${product.category.slug}`}
              className="hover:text-vermillion"
            >
              {product.category.name}
            </Link>
          </>
        )}
      </p>

      <div className="grid grid-cols-12 gap-6 lg:gap-12">
        <div className="col-span-12 lg:col-span-6 xl:col-span-7">
          <div className="max-w-[560px] mx-auto lg:mx-0">
            <ProductGallery images={product.images} fallbackAlt={product.name} />
          </div>
        </div>

        <aside className="col-span-12 lg:col-span-6 xl:col-span-5 lg:sticky lg:top-24 self-start">
          {product.category && (
            <span className="stamp text-vermillion">{product.category.name}</span>
          )}
          <h1 className="font-display text-5xl md:text-6xl leading-[0.92] mt-3">
            {product.name}
          </h1>

          <p className="mt-5 inline-block font-mono-tight text-xl bg-paper-deep px-3 py-1.5">
            {displayPrice > 0 ? money.format(displayPrice) : "Price on request"}
          </p>

          <p className="mt-6 text-ink-soft leading-relaxed whitespace-pre-line">
            {product.description}
          </p>

          {/* Size — jersey squad-number picker */}
          <div className="mt-10">
            <div className="flex items-baseline justify-between mb-3">
              <span className="stamp text-ink/60">Pick your size</span>
              {variant && !inStock && (
                <span className="stamp stamp-in text-vermillion">Sold out</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2.5">
              {product.variants.map((v) => {
                const selected = v.id === variantId;
                const out = v.stock === 0;
                return (
                  <button
                    key={v.id}
                    type="button"
                    disabled={out}
                    onClick={() => setVariantId(v.id)}
                    aria-pressed={selected}
                    className={[
                      "relative w-16 h-16 md:w-[4.5rem] md:h-[4.5rem] border-2 font-display text-2xl md:text-3xl transition-colors duration-150",
                      selected
                        ? "border-ink bg-ink text-paper"
                        : "border-line hover:border-ink",
                      out && "opacity-35 cursor-not-allowed line-through decoration-2 decoration-vermillion hover:border-line",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {v.size}
                    {selected && (
                      <span
                        key={v.id}
                        className="stamp-in absolute -top-1.5 -right-1.5 w-4 h-4 bg-vermillion flex items-center justify-center"
                        aria-hidden
                      >
                        <Check size={11} strokeWidth={3.5} className="text-paper" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity */}
          <div className="mt-8">
            <span className="stamp text-ink/60 mb-3 inline-block">Quantity</span>
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center border-2 border-ink">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="w-11 h-11 hover:bg-ink hover:text-paper transition-colors font-mono-tight"
                >
                  −
                </button>
                <span className="w-12 text-center font-mono-tight font-bold">
                  {String(qty).padStart(2, "0")}
                </span>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(variant?.stock ?? 99, q + 1))}
                  aria-label="Increase quantity"
                  className="w-11 h-11 hover:bg-ink hover:text-paper transition-colors font-mono-tight"
                >
                  +
                </button>
              </div>
              {variant && inStock && variant.stock <= 5 && (
                <span className="stamp stamp-in text-vermillion">
                  Only {variant.stock} left
                </span>
              )}
            </div>
          </div>

          {/* Desktop CTAs */}
          <div className="mt-10 hidden lg:flex flex-col gap-3">
            <AddButton added={added} inStock={inStock} onClick={onAdd} />
            <button
              type="button"
              onClick={onBuyNow}
              disabled={!inStock}
              className="btn-wipe w-full border-2 border-ink py-4 font-condensed text-[0.82rem] hover:text-paper transition-colors duration-200 disabled:opacity-40"
            >
              Buy now
            </button>
          </div>

          {/* Spec sheet */}
          <dl className="mt-10 border-t-2 border-ink pt-5 grid grid-cols-[auto_1fr] gap-x-8 gap-y-3 text-sm">
            <dt className="font-mono-tight text-ink/55">SKU</dt>
            <dd className="font-mono-tight">{variant?.sku ?? "—"}</dd>
            <dt className="font-mono-tight text-ink/55">Made in</dt>
            <dd className="font-mono-tight">Nigeria</dd>
            <dt className="font-mono-tight text-ink/55">Care</dt>
            <dd className="font-mono-tight">Cold wash · line dry</dd>
            <dt className="font-mono-tight text-ink/55">Dispatch</dt>
            <dd className="font-mono-tight">Lagos, nationwide delivery</dd>
          </dl>
        </aside>
      </div>

      {/* Sticky mobile add-to-cart bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-paper border-t-[3px] border-ink px-4 py-3 flex items-center gap-3">
        <div className="min-w-0">
          <p className="font-condensed text-[0.72rem] truncate">{product.name}</p>
          <p className="font-mono-tight text-sm font-bold">
            {displayPrice > 0 ? money.formatLine(displayPrice, qty) : "—"}
          </p>
        </div>
        <div className="ml-auto shrink-0 w-[55%] max-w-[240px]">
          <AddButton added={added} inStock={inStock} onClick={onAdd} compact />
        </div>
      </div>
    </main>
  );
}

function AddButton({
  added,
  inStock,
  onClick,
  compact,
}: {
  added: boolean;
  inStock: boolean;
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!inStock}
      className={[
        "btn-wipe btn-wipe-hazard w-full bg-ink text-paper font-condensed transition-colors duration-200 disabled:opacity-40",
        compact ? "py-3.5 text-[0.78rem]" : "py-4 text-[0.82rem]",
      ].join(" ")}
    >
      {!inStock ? (
        "Sold out"
      ) : added ? (
        <span className="stamp-in inline-flex items-center gap-2 justify-center">
          <Check size={15} strokeWidth={3} /> In the bag
        </span>
      ) : (
        <span className="inline-flex items-center gap-2 justify-center">
          Add to cart
          <ArrowUpRight size={14} />
        </span>
      )}
    </button>
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
      <div className="aspect-[4/5] bg-paper-deep border-2 border-dashed border-ink/25 flex items-center justify-center">
        <span className="stamp text-ink/40">No images</span>
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
      {/* Hero — selected image, framed like a crate face */}
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

        {/* Crate corner brackets */}
        <span className="absolute top-0 left-0 w-8 h-[3px] bg-tan z-10" />
        <span className="absolute top-0 left-0 w-[3px] h-8 bg-tan z-10" />
        <span className="absolute bottom-0 right-0 w-8 h-[3px] bg-tan z-10" />
        <span className="absolute bottom-0 right-0 w-[3px] h-8 bg-tan z-10" />

        {images.length > 1 && (
          <span className="absolute bottom-3 right-3 font-mono-tight bg-ink text-paper px-2 py-1 z-10">
            {String(activeIdx + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
          </span>
        )}
      </div>

      {/* Thumbnails */}
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
                  "relative w-16 h-16 shrink-0 bg-paper-deep overflow-hidden border-2 transition-all",
                  isActive ? "border-vermillion" : "border-transparent opacity-65 hover:opacity-100",
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
