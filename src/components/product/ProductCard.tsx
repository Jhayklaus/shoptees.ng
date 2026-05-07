import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types";
import { formatNaira } from "@/lib/utils";

type Props = {
  product: Product;
  index?: number;
  /** When true, the card sits lower on the page baseline (asymmetric grid) */
  offset?: boolean;
};

export function ProductCard({ product, index = 0, offset }: Props) {
  const number = String(index + 1).padStart(2, "0");
  return (
    <Link
      href={`/shop/${product.slug}`}
      className={`group block ${offset ? "md:translate-y-16" : ""}`}
    >
      <div className="relative overflow-hidden bg-paper-deep aspect-[4/5]">
        <Image
          src={product.images[0]?.src ?? "/placeholders/product-1.svg"}
          alt={product.images[0]?.alt ?? product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
        <span className="absolute top-3 left-3 font-mono-tight text-ink/70 bg-paper/80 px-2 py-0.5">
          № {number}
        </span>
        {product.isPlaceholder && (
          <span className="absolute top-3 right-3 font-mono-tight text-paper bg-vermillion px-2 py-0.5">
            placeholder
          </span>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-3">
        <h3 className="font-display text-lg leading-tight tracking-tight">
          {product.name}
        </h3>
        <p className="font-mono-tight text-ink/70 whitespace-nowrap">
          {product.priceNGN > 0 ? formatNaira(product.priceNGN) : "—"}
        </p>
      </div>
      <p className="font-italic-accent text-ink/55 text-base mt-0.5">
        {product.category.replace(/^\[PLACEHOLDER:\s*/i, "").replace(/\]$/, "")}
      </p>
    </Link>
  );
}
