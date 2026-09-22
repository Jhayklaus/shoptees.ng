import Image from "next/image";
import Link from "next/link";
import type { DisplayProduct } from "@/types";
import { Money } from "@/components/currency/Money";
import { productImageUrl } from "@/lib/images";

type Props = {
  product: DisplayProduct;
  /** Wide tile — used for the lead slot of a grid. */
  lead?: boolean;
};

/**
 * Product tile.
 *
 * Quiet on purpose. The previous version set the name in 800-weight
 * compressed caps and stamped a black archive ref into the corner of every
 * image, which turned a grid of 23 products into 23 competing posters and
 * left the garment as the least loud thing on its own card. Here the picture
 * carries it: name in plain sans, one grey line of context, price. The ref
 * moves to the product page, where there is room for it to mean something.
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
        // 2:1 is not arbitrary. A lead tile spans 2 columns, so at a 3- or
        // 4-column grid its height at 2:1 lands on the height of a square
        // 1-column tile beside it and the row stays flush.
        className={`shot ${lead ? "aspect-square sm:aspect-[2/1]" : "aspect-square"}`}
      >
        {hero ? (
          <>
            <Image
              src={productImageUrl(hero.url)}
              alt={hero.alt || `${product.name} — ${product.category?.name ?? "product"}`}
              fill
              sizes={lead ? "(max-width: 640px) 100vw, 50vw" : "(max-width: 640px) 50vw, 25vw"}
              className={[
                "object-contain p-4 md:p-8 transition-all duration-[650ms] ease-[cubic-bezier(.2,.7,.1,1)]",
                back ? "opacity-100 group-hover:opacity-0" : "group-hover:scale-[1.04]",
              ].join(" ")}
            />
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
