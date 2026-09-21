import Image from "next/image";
import Link from "next/link";
import type { DisplayProduct } from "@/types";
import { Money } from "@/components/currency/Money";
import { productImageUrl } from "@/lib/images";
import { archiveRef } from "@/lib/archive-ref";

type Props = {
  product: DisplayProduct;
  /** Wide tile — used for the lead row of a grid. */
  lead?: boolean;
};

// The card used to stamp a sequence number (No 01, No 02…) in the corner.
// That was decoration dressed as data — the position of a product in
// whatever grid it happened to land in. It now carries the archive ref,
// which is the brand's own filing code and means the same thing everywhere.
export function ProductCard({ product, lead }: Props) {
  const hero = product.images[0];
  const back = product.images[1]; // back view / second colourway by convention
  const totalStock = product.variants.reduce((s, v) => s + v.stock, 0);
  const isSoldOut = totalStock === 0 && product.variants.length > 0;
  const ref = archiveRef(product);

  return (
    <Link
      href={`/shop/${product.slug}`}
      className={`group block ${lead ? "sm:col-span-2" : ""}`}
    >
      {/* data-morph: the box that flies into place as the product page's
          hero. The lead tile is wider, so it carries its own ratio — the
          morph scales rather than warps because the image inside is
          `contain` on both ends. */}
      <div
        data-morph
        className={`shot ${lead ? "aspect-[16/10]" : "aspect-square"}`}
      >
        {hero ? (
          <>
            {/* Front. Stays put on solo-image products. */}
            <Image
              src={productImageUrl(hero.url)}
              alt={hero.alt || `${product.name} — ${product.category?.name ?? "archive flat"}`}
              fill
              sizes={lead ? "(max-width: 640px) 100vw, 50vw" : "(max-width: 640px) 50vw, 25vw"}
              className={[
                "object-contain p-4 md:p-8 transition-all duration-[650ms] ease-[cubic-bezier(.2,.7,.1,1)]",
                back
                  ? "opacity-100 group-hover:opacity-0"
                  : "group-hover:scale-[1.04]",
              ].join(" ")}
            />

            {/* Second view — rendered only if there is one. */}
            {back && (
              <Image
                src={productImageUrl(back.url)}
                alt=""
                fill
                sizes={lead ? "(max-width: 640px) 100vw, 50vw" : "(max-width: 640px) 50vw, 25vw"}
                className="object-contain p-4 md:p-8 absolute inset-0 opacity-0 scale-[1.03] transition-all duration-[650ms] ease-[cubic-bezier(.2,.7,.1,1)] group-hover:opacity-100 group-hover:scale-100"
              />
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center font-mono-tight text-muted">
            no image
          </div>
        )}

        {/* Archive ref, burned into the corner like a filing stamp. This is
            the brand's own numbering, not decorative sequence numbering. */}
        {ref && (
          <span className="absolute top-0 left-0 z-10 bg-ink text-paper font-mono-tight px-2 py-1 text-[0.66rem]">
            {ref}
          </span>
        )}
        {isSoldOut && (
          <span className="absolute top-0 right-0 z-10 bg-vermillion text-paper font-mono-tight px-2 py-1 text-[0.66rem]">
            Sold out
          </span>
        )}
      </div>

      <div className="mt-3 border-t-2 border-ink pt-2 grid gap-1.5 sm:flex sm:items-start sm:justify-between sm:gap-3">
        <div className="min-w-0">
          <h3 className={`font-sub ${lead ? "text-lg md:text-xl" : "text-[0.9rem] md:text-base"}`}>
            {product.name}
          </h3>
          <p className="font-mono-tight text-muted mt-1">
            {[product.collection?.name, product.category?.name].filter(Boolean).join(" · ")}
          </p>
        </div>
        <p className="font-mono-tight tnum text-ink whitespace-nowrap sm:mt-0.5 text-[0.8rem]">
          <Money ngn={product.priceNGN} />
        </p>
      </div>
    </Link>
  );
}
