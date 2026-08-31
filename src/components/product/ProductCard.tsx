import Image from "next/image";
import Link from "next/link";
import type { DisplayProduct } from "@/types";
import { Money } from "@/components/currency/Money";

type Props = {
  product: DisplayProduct;
  index?: number;
  /** When true, the card sits lower on the page baseline (asymmetric grid) */
  offset?: boolean;
};

export function ProductCard({ product, index = 0, offset }: Props) {
  const number = String(index + 1).padStart(2, "0");
  const hero = product.images[0];
  const back = product.images[1]; // back view by convention
  const totalStock = product.variants.reduce((s, v) => s + v.stock, 0);
  const isSoldOut = totalStock === 0 && product.variants.length > 0;

  return (
    <Link
      href={`/shop/${product.slug}`}
      className={`group block ${offset ? "md:translate-y-16" : ""}`}
    >
      {/* data-morph: the box that flies into place as the product page's
          hero. Same 4:5 ratio on both ends, so it scales rather than warps. */}
      <div data-morph className="relative overflow-hidden bg-paper-deep aspect-[4/5]">
        {hero ? (
          <>
            {/* Front (default). Stays put on solo-image products. */}
            <Image
              src={hero.url}
              alt={hero.alt || product.name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className={[
                "object-contain p-4 transition-all duration-[650ms] ease-[cubic-bezier(.2,.7,.1,1)]",
                back
                  ? "opacity-100 scale-100 group-hover:opacity-0 group-hover:scale-[0.96] group-hover:-translate-y-1"
                  : "transition-transform group-hover:scale-[1.04]",
              ].join(" ")}
            />

            {/* Back view — rendered only if a second image exists. Starts
                slightly zoomed + offset, settles into place on hover. */}
            {back && (
              <Image
                src={back.url}
                alt={back.alt || `${product.name} — back view`}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-contain p-4 absolute inset-0 opacity-0 scale-[1.05] translate-y-1 transition-all duration-[650ms] ease-[cubic-bezier(.2,.7,.1,1)] group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0"
              />
            )}

            {/* Subtle vermillion sweep across the bottom on hover */}
            {back && (
              <span
                aria-hidden
                className="absolute bottom-0 left-0 right-0 h-px bg-vermillion origin-left scale-x-0 transition-transform duration-[700ms] ease-out group-hover:scale-x-100"
              />
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center font-italic-accent text-ink/30">
            no image
          </div>
        )}
        <span className="absolute top-3 left-3 font-mono-tight text-ink/70 bg-paper/85 px-2 py-0.5 z-10">
          № {number}
        </span>
        {isSoldOut && (
          <span className="stamp absolute top-3 right-3 text-paper bg-ink border-ink z-10">
            sold out
          </span>
        )}
      </div>

      <div className="mt-3 border-t-2 border-ink pt-2 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-base md:text-lg leading-[1.05]">
            {product.name}
          </h3>
          {product.category && (
            <p className="font-mono-tight text-ink/50 mt-1">
              {product.category.name}
            </p>
          )}
        </div>
        <p className="font-mono-tight text-ink whitespace-nowrap bg-paper-deep px-1.5 py-0.5 mt-0.5">
          <Money ngn={product.priceNGN} />
        </p>
      </div>
    </Link>
  );
}
