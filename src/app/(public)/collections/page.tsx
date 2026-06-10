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
      <header className="mb-12 border-b border-line pb-8">
        <p className="font-mono-tight text-ink/55">
          {collections.length} {collections.length === 1 ? "line" : "lines"}
        </p>
        <h1 className="font-display text-6xl md:text-8xl tracking-tight leading-[0.95] mt-1">
          Collections<span className="font-italic-accent text-vermillion">.</span>
        </h1>
      </header>

      {collections.length === 0 ? (
        <div className="border border-dashed border-line p-16 text-center">
          <p className="font-italic-accent text-2xl text-ink/55">
            No collections yet — the studio is curating.
          </p>
          <Link
            href="/shop"
            className="inline-block mt-4 font-mono-tight text-ink underline-offset-4 hover:underline"
          >
            Browse everything →
          </Link>
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
                  <p className="font-italic-accent text-ink/55 mt-6">
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
                    <div className="mt-4 text-right">
                      <Link
                        href={`/collections/${col.slug}`}
                        className="font-mono-tight text-ink/70 hover:text-ink underline-offset-4 hover:underline"
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
