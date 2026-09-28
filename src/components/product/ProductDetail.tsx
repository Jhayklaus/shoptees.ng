"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { DisplayProduct, DisplayImage } from "@/types";
import { useMoney } from "@/components/currency/CurrencyProvider";
import { useCart } from "@/store/cart";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { productCardUrl, productImageUrl } from "@/lib/images";
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

  // The gallery shows the photos of the selected colourway, so a customer
  // looking at Burgundy flicks through Burgundy's front and back rather than
  // through every shot of every colour.
  //
  // An image with no colour set is not specific to one — a flat-lay, a
  // detail, a size guide — so it shows under every colourway. That is also
  // what every image looked like before images could be tagged, which is
  // why an untagged product behaves exactly as it always did.
  const imagesForColour = useMemo(() => {
    if (!activeColour) return product.images;
    const tagged = product.images.filter((i) => i.color === activeColour);
    const untagged = product.images.filter((i) => !i.color);
    const shown = [...tagged, ...untagged];
    // A colour whose images are all tagged to OTHER colours would otherwise
    // render an empty gallery; fall back to the full set rather than a hole.
    return shown.length > 0 ? shown : product.images;
  }, [product.images, activeColour]);

  // The image that stands for each colourway in the swatch strip: its first
  // tagged photo, or the product's first image when nothing is tagged yet.
  const swatchFor = (colour: string) =>
    product.images.find((i) => i.color === colour) ?? product.images[0] ?? null;

  const pickColour = (colour: string) => {
    const pool = variants.filter((v) => v.color === colour);
    const next = pool.find((v) => v.stock > 0) ?? pool[0];
    if (next) setVariantId(next.id);
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
          // Keyed by colourway: switching colour remounts the gallery, so its
          // position resets to the first shot with no state left over.
          // Pairing the index with the colour instead LOOKED right but kept a
          // stale index alive — leaving Burgundy, coming back, and landing on
          // slide 2 with the counter disagreeing with the picture.
          key={activeColour}
          images={imagesForColour}
          fallbackAlt={product.name}
          colourways={colourways}
          activeColour={activeColour}
          onPickColour={pickColour}
          colourInStock={(c) => variants.some((v) => v.color === c && v.stock > 0)}
          swatchFor={swatchFor}
        />

        <aside className="lg:sticky lg:top-28 self-start">
          <h1 className="font-display text-[clamp(1.9rem,4.4vw,2.9rem)]">{product.name}</h1>

          <p className="font-sub tnum text-xl mt-4">
            {displayPrice > 0 ? money.format(displayPrice) : "Price on request"}
          </p>

          <p className="mt-5 text-ink-soft leading-relaxed whitespace-pre-line text-[0.94rem] max-w-[46ch]">
            {product.description}
          </p>

          {/* A readout, not a control. The swatches under the gallery pick the
              colourway — two pickers for one choice is one too many, and the
              one beside the picture is the one that shows what it changes. */}
          {activeColour && (
            <p className="font-label text-muted mt-7">
              Colourway
              <span className="ml-2 text-ink normal-case tracking-normal">
                {activeColour}
              </span>
            </p>
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
          {/* Only rows we actually know.
              This used to end with "Made in Nigeria / Cold wash · line dry /
              Dispatch Lagos, nationwide" hardcoded — the same three lines on
              every product in the catalogue. A customer who opens two
              product pages sees identical specs and correctly stops
              believing the table. The fields are per-product and admin-set
              now, and an unfilled one is simply absent: a shorter honest
              table beats a longer invented one. */}
          <table className="w-full mt-9 border-collapse">
            <tbody>
              {(
                [
                  ...(ref ? [["Archive ref", ref] as const] : []),
                  ...(product.collection
                    ? [["Collection", product.collection.name] as const]
                    : []),
                  ...(variant?.sku ? [["SKU", variant.sku] as const] : []),
                  ...(product.spec.composition
                    ? [["Composition", product.spec.composition] as const]
                    : []),
                  ...(product.spec.fabricWeight
                    ? [["Weight", product.spec.fabricWeight] as const]
                    : []),
                  ...(product.spec.fit ? [["Fit", product.spec.fit] as const] : []),
                  ...(product.spec.care ? [["Care", product.spec.care] as const] : []),
                  ...(product.spec.madeIn
                    ? [["Made in", product.spec.madeIn] as const]
                    : []),
                ] as const
              ).map(([k, v]) => (
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
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-paper border-t border-line px-4 py-3 flex items-center gap-3">
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

/**
 * The gallery: one colourway's photos as a swipeable track, with the
 * colourways themselves as the strip underneath.
 *
 * It used to lay every image of every colourway out as thumbnails, so a
 * three-colour product gave you nine small boxes and no indication which
 * belonged together. The strip now holds one swatch per colourway — picking
 * one swaps the track to that colour's shots, and you flick through its
 * front and back.
 *
 * The track is a scroll-snap row, not a JS carousel: swipe, trackpad, arrow
 * keys and the buttons all drive the same native scroll, so it behaves
 * correctly on touch without shipping a carousel library for it.
 */
function ProductGallery({
  images,
  fallbackAlt,
  colourways,
  activeColour,
  onPickColour,
  colourInStock,
  swatchFor,
}: {
  images: DisplayImage[];
  fallbackAlt: string;
  colourways: string[];
  activeColour: string;
  onPickColour: (colour: string) => void;
  colourInStock: (colour: string) => boolean;
  swatchFor: (colour: string) => DisplayImage | null;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  // Plain position state. The parent remounts this component when the
  // colourway changes, so there is nothing here that has to be reset — and
  // nothing that can go stale behind the picture.
  const [current, setCurrent] = useState(0);

  const goTo = (next: number) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(next, images.length - 1));
    track.scrollTo({ left: clamped * track.clientWidth, behavior: "smooth" });
    setCurrent(clamped);
  };

  // Derive the index from the scroll position so a swipe updates the
  // counter and the dots, not just the buttons.
  const onScroll = () => {
    const track = trackRef.current;
    if (!track || track.clientWidth === 0) return;
    const next = Math.round(track.scrollLeft / track.clientWidth);
    if (next !== current) setCurrent(next);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (images.length < 2) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      goTo(current + 1);
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      goTo(current - 1);
    }
  };

  if (images.length === 0) {
    return (
      <div className="shot aspect-square flex items-center justify-center">
        <p className="font-label text-muted">No images</p>
      </div>
    );
  }

  return (
    <div>
      <div
        // Marks where a card's image should land. The transition name is
        // attached only while a morph is in flight (see ViewTransitions);
        // leaving it on permanently makes this image fly across every page
        // you navigate to next. Square, matching the grid tile, so the morph
        // scales rather than warps.
        data-morph-target
        className="shot aspect-square group/gallery"
        role="region"
        aria-roledescription="carousel"
        aria-label={`${fallbackAlt}${activeColour ? ` — ${activeColour}` : ""}`}
        onKeyDown={onKeyDown}
        tabIndex={0}
      >
        <div
          ref={trackRef}
          onScroll={onScroll}
          className="absolute inset-0 flex overflow-x-auto snap-x snap-mandatory no-scrollbar overscroll-x-contain"
        >
          {images.map((img, i) => (
            <div
              key={img.url + i}
              className="relative w-full h-full shrink-0 snap-center"
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${images.length}`}
            >
              <Image
                src={productImageUrl(img.url)}
                alt={img.alt || fallbackAlt}
                fill
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-contain p-8 md:p-14"
                priority={i === 0}
              />
            </div>
          ))}
        </div>

        {images.length > 1 && (
          <>
            {/* Rendered only when there is somewhere to go, rather than
                disabled-but-present. `disabled:opacity-0` and
                `md:group-hover:opacity-100` are both utilities, so which one
                wins is down to the order Tailwind emits them in — and on
                desktop the hover rule won, leaving a dead arrow visible on
                the first slide. Not rendering it cannot be out-specified. */}
            {current > 0 && <GalleryArrow side="left" onClick={() => goTo(current - 1)} />}
            {current < images.length - 1 && (
              <GalleryArrow side="right" onClick={() => goTo(current + 1)} />
            )}

            <p className="absolute bottom-4 right-4 font-label text-muted tnum z-10 pointer-events-none">
              {String(current + 1).padStart(2, "0")} /{" "}
              {String(images.length).padStart(2, "0")}
            </p>

            {/* Touch has no hover to reveal the arrows, so the dots carry the
                "there is more here" signal on a phone. */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 md:hidden">
              {images.map((img, i) => (
                <span
                  key={img.url + i}
                  aria-hidden
                  className={`h-1.5 rounded-full transition-all ${
                    i === current ? "w-4 bg-ink" : "w-1.5 bg-ink/25"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {colourways.length > 1 && (
        <div
          className="mt-3 flex flex-wrap gap-2.5"
          role="radiogroup"
          aria-label="Choose a colourway"
        >
          {colourways.map((c) => {
            const isActive = c === activeColour;
            const art = swatchFor(c);
            const available = colourInStock(c);
            return (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={isActive}
                aria-label={`${c}${available ? "" : " — sold out"}`}
                disabled={!available}
                onClick={() => onPickColour(c)}
                title={c}
                className={[
                  "shot relative w-[4.25rem] h-[4.25rem] shrink-0 border-2 transition-colors",
                  isActive ? "border-ink" : "border-transparent hover:border-line-2",
                  available ? "" : "opacity-40",
                ].join(" ")}
              >
                {art && (
                  <Image
                    // The front crop, not the full flat: at 68px a
                    // front-and-back pair is two illegible smudges.
                    src={productCardUrl(art.url)}
                    alt=""
                    fill
                    sizes="68px"
                    className="object-contain p-1"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}

      {colourways.length > 1 && (
        <p className="sr-only" aria-live="polite">
          {activeColour} selected, {images.length}{" "}
          {images.length === 1 ? "image" : "images"}
        </p>
      )}
    </div>
  );
}

function GalleryArrow({
  side,
  onClick,
}: {
  side: "left" | "right";
  onClick: () => void;
}) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Previous image" : "Next image"}
      className={[
        "absolute top-1/2 -translate-y-1/2 z-10 w-10 h-10 grid place-items-center",
        "bg-paper/85 backdrop-blur-[2px] border border-line text-ink",
        "transition-opacity hover:bg-paper",
        // Always reachable on touch; on desktop it stays out of the way
        // until the pointer is over the picture.
        "md:opacity-0 md:group-hover/gallery:opacity-100 focus-visible:opacity-100",
        side === "left" ? "left-3" : "right-3",
      ].join(" ")}
    >
      <Icon size={18} />
    </button>
  );
}
