"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { DisplayProduct, DisplayImage } from "@/types";
import { useMoney } from "@/components/currency/CurrencyProvider";
import { useCart } from "@/store/cart";
import { Check } from "lucide-react";
import { productImageUrl } from "@/lib/images";
import { archiveRef } from "@/lib/archive-ref";
import { sortBySize } from "@/lib/sizes";

export function ProductDetail({ product }: { product: DisplayProduct }) {
  const router = useRouter();

  // Sizes render in garment order, not the alphabetical order the query
  // returns them in — a shirt used to offer "L, M, S, XL". Sorted here
  // rather than in the query because it is a presentation concern and that
  // query is shared with the admin and the cart. The default selection
  // follows the sorted list, so the pre-selected chip is the first size
  // shown rather than whichever one happened to sort first alphabetically.
  const variants = useMemo(() => sortBySize(product.variants), [product.variants]);
  const inStockVariants = variants.filter((v) => v.stock > 0);

  const [variantId, setVariantId] = useState<string>(
    inStockVariants[0]?.id ?? variants[0]?.id ?? ""
  );
  const [imageIdx, setImageIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const add = useCart((s) => s.add);

  const variant = product.variants.find((v) => v.id === variantId);
  const inStock = (variant?.stock ?? 0) > 0;
  const money = useMoney();
  const displayPrice = variant?.priceOverrideNGN ?? product.priceNGN;
  // Each colourway carries its own archive ref (TH-16, TH-17, TH-18), so
  // the ref shown has to follow the selection rather than reporting the
  // first variant's for all of them.
  const ref = variant ? archiveRef({ variants: [variant] }) : archiveRef(product);

  // A variant is a colourway AND a size. The picker used to expose only
  // size, so a three-colourway bucket hat rendered as three identical
  // "One size" chips and there was no way to choose black over red. The
  // colourway is the other half of the choice, so it gets its own control.
  const colourways = useMemo(() => {
    const seen = new Set<string>();
    return product.variants
      .map((v) => v.color)
      .filter((c) => c && !seen.has(c) && (seen.add(c), true));
  }, [product.variants]);

  const selected = product.variants.find((v) => v.id === variantId);
  const activeColour = selected?.color ?? colourways[0] ?? "";

  // Sizes offered in the chosen colourway. A colourway that has only one
  // size still renders its chip, so the control never silently disappears.
  const sizesForColour = useMemo(
    () => variants.filter((v) => !activeColour || v.color === activeColour),
    [variants, activeColour],
  );

  // The importer writes one image per colourway, in colourway order, so
  // index alignment holds for every imported product. Guarded on the counts
  // matching, because a product edited by hand in /admin need not follow it.
  const imagesTrackColours =
    colourways.length > 1 && product.images.length === colourways.length;

  const pickColour = (colour: string) => {
    const pool = variants.filter((v) => v.color === colour);
    const next = pool.find((v) => v.stock > 0) ?? pool[0];
    if (next) setVariantId(next.id);
    if (imagesTrackColours) {
      const i = colourways.indexOf(colour);
      if (i >= 0) setImageIdx(i);
    }
  };

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
    <main className="mx-auto max-w-[1400px] px-5 md:px-10 pt-6 pb-28 lg:pb-14">
      <nav aria-label="Breadcrumb" className="font-label text-muted mb-5">
        <Link href="/shop" className="hover:text-ink transition-colors">
          Shop
        </Link>
        {product.collection && (
          <>
            {" / "}
            <Link
              href={`/collections/${product.collection.slug}`}
              className="hover:text-ink transition-colors"
            >
              {product.collection.name}
            </Link>
          </>
        )}
        {product.category && (
          <>
            {" / "}
            <span className="text-ink">{product.category.name}</span>
          </>
        )}
      </nav>

      {/* 1.2/0.8, not a gentler split: the gallery is square, so its height is
          its column width. Too narrow a gallery column and the row height is
          set by the spec column, leaving a band of dead space under the
          picture — which is what 1.15/0.85 did. */}
      <div className="grid lg:grid-cols-[1.2fr_.8fr] gap-8 lg:gap-14">
        <ProductGallery
          images={product.images}
          fallbackAlt={product.name}
          activeIdx={imageIdx}
          onSelect={setImageIdx}
        />

        <aside className="lg:sticky lg:top-28 self-start">
          <h1 className="font-display text-[clamp(1.9rem,4.4vw,2.9rem)]">{product.name}</h1>

          <p className="font-sub tnum text-xl mt-4">
            {displayPrice > 0 ? money.format(displayPrice) : "Price on request"}
          </p>

          <p className="mt-5 text-ink-soft leading-relaxed whitespace-pre-line text-[0.94rem] max-w-[46ch]">
            {product.description}
          </p>

          {colourways.length > 1 ? (
            <div className="mt-7">
              <p className="font-label text-muted">
                Colourway
                <span className="ml-2 text-ink normal-case tracking-normal">
                  {activeColour}
                </span>
              </p>
              <div className="flex flex-wrap gap-2 mt-2.5">
                {colourways.map((c) => {
                  const any = variants.some((v) => v.color === c && v.stock > 0);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => pickColour(c)}
                      aria-pressed={c === activeColour}
                      disabled={!any}
                      className="chip px-3.5 text-[0.82rem] font-medium"
                      style={{ fontVariationSettings: '"wdth" 100' }}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            colourways.length === 1 && (
              <p className="font-label text-muted mt-7">
                Colourway
                <span className="ml-2 text-ink normal-case tracking-normal">
                  {colourways[0]}
                </span>
              </p>
            )
          )}

          {/* ── Size ─────────────────────────────────────────────── */}
          <div className="mt-7">
            <div className="flex items-baseline justify-between gap-3 mb-2.5">
              <p className="font-label text-muted">Size</p>
              {variant && !inStock && (
                <p className="font-label text-vermillion">Sold out</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {sizesForColour.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  disabled={v.stock === 0}
                  onClick={() => setVariantId(v.id)}
                  aria-pressed={v.id === variantId}
                  className="chip"
                >
                  {v.size}
                </button>
              ))}
            </div>
          </div>

          {/* ── Quantity ─────────────────────────────────────────── */}
          <div className="mt-6">
            <p className="font-label text-muted mb-2.5">Quantity</p>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="inline-flex items-center border-2 border-ink">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="w-11 h-11 hover:bg-ink hover:text-paper transition-colors text-lg leading-none"
                >
                  −
                </button>
                <span className="w-12 text-center font-sub tnum">
                  {String(qty).padStart(2, "0")}
                </span>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(variant?.stock ?? 99, q + 1))}
                  aria-label="Increase quantity"
                  className="w-11 h-11 hover:bg-ink hover:text-paper transition-colors text-lg leading-none"
                >
                  +
                </button>
              </div>
              {variant && inStock && variant.stock <= 5 && (
                <p className="font-label text-vermillion">Only {variant.stock} left</p>
              )}
            </div>
          </div>

          {/* ── Desktop actions ──────────────────────────────────── */}
          <div className="mt-8 hidden lg:grid gap-2.5">
            <AddButton added={added} inStock={inStock} onClick={onAdd} />
            <button
              type="button"
              onClick={onBuyNow}
              disabled={!inStock}
              className="btn btn-ghost press w-full py-4"
            >
              Buy now
            </button>
          </div>

          {/* ── Spec sheet ───────────────────────────────────────── */}
          <table className="w-full mt-9 border-collapse">
            <tbody>
              {[
                ...(ref ? [["Archive ref", ref] as const] : []),
                ...(product.collection
                  ? [["Collection", product.collection.name] as const]
                  : []),
                ["SKU", variant?.sku ?? "—"] as const,
                ["Made in", "Nigeria"] as const,
                ["Care", "Cold wash · line dry"] as const,
                ["Dispatch", "Lagos, nationwide delivery"] as const,
              ].map(([k, v]) => (
                <tr key={k} className="border-b border-line">
                  <th
                    scope="row"
                    className="text-left font-label text-muted font-medium py-2.5 pr-6 w-[38%] align-top"
                  >
                    {k}
                  </th>
                  <td className="py-2.5 text-[0.88rem] text-ink align-top">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </aside>
      </div>

      {/* ── Sticky mobile bar ──────────────────────────────────── */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-paper border-t-2 border-ink px-4 py-3 flex items-center gap-3">
        <div className="min-w-0">
          <p className="font-sub text-[0.82rem] truncate">{product.name}</p>
          <p className="font-sub tnum text-[0.88rem]">
            {displayPrice > 0 ? money.formatLine(displayPrice, qty) : "—"}
          </p>
        </div>
        <div className="ml-auto shrink-0 w-[52%] max-w-[15rem]">
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
      className={`btn press w-full ${compact ? "py-3.5" : "py-4"}`}
    >
      {!inStock ? (
        "Sold out"
      ) : added ? (
        <>
          <Check size={15} strokeWidth={3} /> In the bag
        </>
      ) : (
        "Add to cart"
      )}
    </button>
  );
}

function ProductGallery({
  images,
  fallbackAlt,
  activeIdx,
  onSelect,
}: {
  images: DisplayImage[];
  fallbackAlt: string;
  /** Controlled by the parent so picking a colourway moves the picture. */
  activeIdx: number;
  onSelect: (i: number) => void;
}) {
  const setActiveIdx = (next: number | ((i: number) => number)) =>
    onSelect(typeof next === "function" ? next(activeIdx) : next);

  if (images.length === 0) {
    return (
      <div className="shot aspect-square flex items-center justify-center">
        <p className="font-label text-muted">No images</p>
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
      <div
        // Marks where a card's image should land. The transition name is
        // attached only while a morph is in flight (see ViewTransitions);
        // leaving it on permanently makes this image fly across every page
        // you navigate to next. Square, matching the grid tile, so the morph
        // scales rather than warps.
        data-morph-target
        className="shot shot-lg aspect-square"
        role="region"
        aria-roledescription="product gallery"
        aria-label={`${fallbackAlt} — image ${activeIdx + 1} of ${images.length}`}
      >
        <Image
          key={active.url}
          src={productImageUrl(active.url)}
          alt={active.alt || fallbackAlt}
          fill
          sizes="(max-width: 1024px) 100vw, 55vw"
          className="object-contain p-8 md:p-14"
          priority
        />

        {images.length > 1 && (
          <p className="absolute bottom-4 right-4 font-label text-muted tnum z-10">
            {String(activeIdx + 1).padStart(2, "0")} /{" "}
            {String(images.length).padStart(2, "0")}
          </p>
        )}
      </div>

      {images.length > 1 && (
        <div
          className="mt-3 flex flex-wrap gap-2.5"
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
                  "shot relative w-[4.25rem] h-[4.25rem] shrink-0 border-2 transition-colors",
                  isActive ? "border-ink" : "border-transparent",
                ].join(" ")}
              >
                <Image
                  src={productImageUrl(img.url)}
                  alt=""
                  fill
                  sizes="68px"
                  className="object-contain p-1.5"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
