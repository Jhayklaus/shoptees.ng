import Image from "next/image";
import Link from "next/link";
import type { DisplayProduct } from "@/types";
import { Money } from "@/components/currency/Money";
import { productCardUrl } from "@/lib/images";

type Props = {
  product: DisplayProduct;
  /** Wide tile — used for the lead slot of a grid. */
  lead?: boolean;
};

/**
 * Product tile.
 *
 * Quiet on purpose. An earlier version set the name in 800-weight
 * compressed caps and stamped a black archive ref into the corner of every
 * image, which turned a grid of 23 products into 23 competing posters and
 * left the garment as the least loud thing on its own card. Here the picture
 * carries it: name in plain sans, one grey line of context, price. The ref
 * moves to the product page, where there is room for it to mean something.
 *
 * The picture can only carry it if it is actually big, which it was not.
 * The tile was square, the art is a front-and-back PAIR in a wide frame, and
 * the CSS added p-8 on top — so the garment ended up spanning a bit over
 * half the tile, floating in grey. Now: a 4:5 portrait tile (the proportion
 * the garment itself has), the single-garment front crop where one exists,
 * and padding cut to a hairline. Same art, roughly twice the presence.
 */
export function ProductCard({ product, lead }: Props) {
  const hero = product.images[0];
  const back = product.images[1]; // back view / second colourway by convention
  const totalStock = product.variants.reduce((s, v) => s + v.stock, 0);
  const isSoldOut = totalStock === 0 && product.variants.length > 0;

  return (
    <Link href={`/shop/${product.slug}`} className={`group block ${lead ? "sm:col-span-2" : ""}`}>
      <div
        data-morph
        // Portrait, because the garment is. A square tile fitted a standing
        // tee to its height and left dead air either side; 4:5 is close to
        // the proportion of the crop itself, so the garment fills it.
        //
        // The lead tile spans 2 columns, so it takes 8:5 — double the width
        // at the same height, which keeps the row flush with the 4:5 tiles
        // beside it.
        className={`shot ${lead ? "aspect-[4/5] sm:aspect-[8/5]" : "aspect-[4/5]"}`}
      >
        {hero ? (
          <>
            <Image
              src={productCardUrl(hero.url)}
              alt={hero.alt || `${product.name} — ${product.category?.name ?? "product"}`}
              fill
              sizes={lead ? "(max-width: 640px) 100vw, 50vw" : "(max-width: 640px) 50vw, 25vw"}
              className={[
                // p-2, not p-8. The crops carry their own 3% margin, so
                // anything more is padding the padding.
                "object-contain p-2 md:p-3 transition-all duration-[650ms] ease-[cubic-bezier(.2,.7,.1,1)]",
                back ? "opacity-100 group-hover:opacity-0" : "group-hover:scale-[1.04]",
              ].join(" ")}
            />
            {back && (
              <Image
                src={productCardUrl(back.url)}
                alt=""
                fill
                sizes={lead ? "(max-width: 640px) 100vw, 50vw" : "(max-width: 640px) 50vw, 25vw"}
                className="object-contain p-2 md:p-3 absolute inset-0 opacity-0 scale-[1.03] transition-all duration-[650ms] ease-[cubic-bezier(.2,.7,.1,1)] group-hover:opacity-100 group-hover:scale-100"
              />
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center font-label text-muted">
            no image
          </div>
        )}

        {isSoldOut && (
          <span className="absolute top-3 left-3 z-10 bg-ink/90 text-paper font-label px-2 py-1 text-[0.64rem]">
            Sold out
          </span>
        )}
      </div>

      <div className="mt-3">
        <h3 className="font-sub text-[0.92rem] group-hover:underline underline-offset-4 decoration-1">
          {product.name}
        </h3>
        <p className="font-label text-muted mt-1 text-[0.68rem]">
          {product.category?.name ?? product.collection?.name ?? ""}
        </p>
        <p className="font-sub tnum text-[0.92rem] mt-1.5">
          <Money ngn={product.priceNGN} />
        </p>
      </div>
    </Link>
  );
}
