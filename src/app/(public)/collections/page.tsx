import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { listCollectionsWithProducts } from "@/lib/server/collections";
import { toDisplayProduct } from "@/lib/server/products";
import { ProductCard } from "@/components/product/ProductCard";
import { CarouselRail } from "@/components/marketing/CarouselRail";
import { CollectionBanner } from "@/components/collection/CollectionBanner";

export const metadata: Metadata = buildMetadata({
  title: "Collections",
  description:
    "Every Shoptees collection — curated lines of streetwear and football apparel for men and women.",
  path: "/collections",
});

export const dynamic = "force-dynamic";

export default async function CollectionsPage() {
  const collections = await listCollectionsWithProducts();

  return (
    <main className="mx-auto max-w-[1400px] px-5 md:px-10 pt-12 pb-24">
      <header className="mb-12 border-b-[3px] border-ink pb-8">
        <span className="stamp text-vermillion">
          {String(collections.length).padStart(2, "0")}{" "}
          {collections.length === 1 ? "line" : "lines"}
        </span>
        <h1 className="font-display text-6xl md:text-8xl leading-[0.92] mt-3">
          Collections<span className="text-vermillion">.</span>
        </h1>
      </header>

      {collections.length === 0 ? (
        <div className="border-2 border-dashed border-ink/30 p-16 text-center">
          <span className="stamp text-ink/50">The studio is curating — check back soon</span>
          <p className="mt-5">
            <Link
              href="/shop"
              className="font-condensed text-[0.78rem] underline underline-offset-4 hover:text-vermillion"
            >
              Browse everything →
            </Link>
          </p>
        </div>
      ) : (
        <div className="space-y-20">
          {collections.map((col) => {
            const display = col.products.map(toDisplayProduct);
            return (
              <section key={col.id} aria-label={col.name}>
                <CollectionBanner
                  name={col.name}
                  slug={col.slug}
                  description={col.description}
                  imageUrl={col.imageUrl}
                  imageAlt={col.imageAlt}
                  count={col._count.products}
                />

                {display.length === 0 ? (
                  <p className="font-mono-tight text-ink/55 mt-2">
                    Nothing in {col.name.toLowerCase()} yet — coming soon.
                  </p>
                ) : (
                  <div className="mt-6">
                    <CarouselRail
                      ariaLabel={col.name}
                      className="-mx-5 px-5 md:mx-0 md:px-0 md:gap-5"
                    >
                      {display.map((p, i) => (
                        <div
                          key={p.id}
                          className="min-w-[72vw] sm:min-w-[44vw] md:min-w-[280px] lg:min-w-[310px] snap-start"
                        >
                          <ProductCard product={p} index={i} />
                        </div>
                      ))}
                    </CarouselRail>
                    <div className="mt-5 text-right">
                      <Link
                        href={`/collections/${col.slug}`}
                        className="font-condensed text-[0.78rem] underline-offset-4 hover:underline hover:text-vermillion"
                      >
                        View all {col._count.products}{" "}
                        {col._count.products === 1 ? "piece" : "pieces"} →
                      </Link>
                    </div>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}
