import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { listActiveProducts, toDisplayProduct, getActiveCategories } from "@/lib/server/products";
import {
  getActiveCollections,
  getCollectionBySlug,
  getCollectionCategories,
} from "@/lib/server/collections";
import { ProductCard } from "@/components/product/ProductCard";
import { FilterPanel } from "@/components/shop/FilterPanel";

const BASE_DESCRIPTION =
  "Streetwear and football jerseys from Shoptees — tees, jerseys, jorts, hoodies, pants and more.";

type ShopParams = { c?: string; collection?: string };

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<ShopParams>;
}): Promise<Metadata> {
  const { c, collection } = await searchParams;

  // Collection-filtered shop views canonicalise to the dedicated
  // /collections/[slug] page so search engines index one URL per collection.
  if (collection) {
    const match = await getCollectionBySlug(collection);
    if (match) {
      return buildMetadata({
        title: `${match.name} — Shop`,
        description:
          match.description ||
          `Shop the ${match.name} collection from Shoptees. Streetwear and football apparel for men and women.`,
        path: `/collections/${match.slug}`,
      });
    }
  }

  // Category-aware: title + description carry the category name; canonical
  // includes the query so each category has its own indexable URL.
  if (c) {
    const categories = await getActiveCategories();
    const match = categories.find((cat) => cat.slug === c);
    if (match) {
      return buildMetadata({
        title: `${match.name} — Shop`,
        description: `Shop ${match.name.toLowerCase()} from Shoptees. Streetwear and football apparel for men and women.`,
        path: `/shop?c=${match.slug}`,
      });
    }
  }

  return buildMetadata({
    title: "Shop",
    description: BASE_DESCRIPTION,
    path: "/shop",
  });
}

export const dynamic = "force-dynamic";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<ShopParams>;
}) {
  const { c: categorySlugParam, collection: collectionSlugParam } = await searchParams;

  const [collections, allCategories] = await Promise.all([
    getActiveCollections(),
    getActiveCategories(),
  ]);

  // Unknown slugs are treated as "no filter" so the page never shows a
  // misleading "0 pieces" state for a mistyped URL.
  const activeCollection = collectionSlugParam
    ? collections.find((col) => col.slug === collectionSlugParam) ?? null
    : null;

  // Inside a collection, only offer the categories its active products
  // actually span — a collection without pants shouldn't show a Pants chip.
  const categories = activeCollection
    ? await getCollectionCategories(activeCollection.slug)
    : allCategories;

  const activeCategory = categorySlugParam
    ? categories.find((cat) => cat.slug === categorySlugParam) ?? null
    : null;

  const products = await listActiveProducts({
    categorySlug: activeCategory?.slug,
    collectionSlug: activeCollection?.slug,
  });
  const display = products.map(toDisplayProduct);

  const filterActive = Boolean(activeCategory || activeCollection);

  const eyebrowLabel = [activeCollection?.name, activeCategory?.name]
    .filter(Boolean)
    .join(" · ");

  return (
    <main className="mx-auto max-w-[1400px] px-5 md:px-10 pt-12 pb-24">
      <header className="grid grid-cols-12 gap-6 mb-12 border-b border-line pb-8">
        <div className="col-span-12 md:col-span-7">
          <p className="font-mono-tight text-ink/55">
            {filterActive
              ? `${eyebrowLabel} · ${display.length} ${display.length === 1 ? "piece" : "pieces"}`
              : `Catalogue · ${display.length} ${display.length === 1 ? "piece" : "pieces"}`}
          </p>
          <h1 className="font-display text-6xl md:text-8xl tracking-tight leading-[0.95] mt-1">
            {activeCollection ? (
              <>
                {activeCollection.name}
                <span className="font-italic-accent text-vermillion">.</span>
              </>
            ) : activeCategory ? (
              <>
                {activeCategory.name.replace(/s$/, "")}
                <span className="font-italic-accent text-vermillion">
                  {activeCategory.name.endsWith("s") ? "s." : "."}
                </span>
              </>
            ) : (
              <>
                All <span className="font-italic-accent text-vermillion">cloth.</span>
              </>
            )}
          </h1>
        </div>
        <div className="col-span-12 md:col-span-5 md:pt-3">
          <p className="font-italic-accent text-xl md:text-2xl text-ink/70 max-w-md">
            {activeCollection?.description ||
              "Streetwear and football jerseys for men and women. Sold by the piece or by the carton."}
          </p>
        </div>
      </header>

      <div className="mb-10 flex items-center justify-between gap-4">
        <FilterPanel
          collections={collections.map((col) => ({ slug: col.slug, name: col.name }))}
          categories={categories.map((cat) => ({ slug: cat.slug, name: cat.name }))}
          activeCollection={activeCollection?.slug ?? null}
          activeCategory={activeCategory?.slug ?? null}
        />
        {filterActive && (
          <Link
            href="/shop"
            scroll={false}
            className="font-mono-tight text-ink/55 hover:text-vermillion transition-colors"
          >
            Clear filters ×
          </Link>
        )}
      </div>

      {display.length === 0 ? (
        <div className="border border-dashed border-line p-16 text-center">
          <p className="font-italic-accent text-2xl text-ink/55">
            {filterActive
              ? `Nothing in ${eyebrowLabel.toLowerCase()} right now.`
              : "The studio is between drops."}
          </p>
          {filterActive ? (
            <Link
              href="/shop"
              className="inline-block mt-4 font-mono-tight text-ink underline-offset-4 hover:underline"
            >
              See everything →
            </Link>
          ) : (
            <p className="font-mono-tight text-ink/55 mt-2">
              Add active products in the admin to populate this page.
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-14">
          {display.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      )}
    </main>
  );
}
