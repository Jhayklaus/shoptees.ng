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
import { FilterRail } from "@/components/shop/FilterRail";

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

  // Counts per term so the rail shows how big each slice is, the way a
  // real shop filter does. Derived from the rows already fetched — no extra
  // query, and it stays correct under an active collection filter.
  const all = activeCollection
    ? await listActiveProducts({ collectionSlug: activeCollection.slug })
    : products;
  const countBy = (pick: (p: (typeof all)[number]) => string | undefined) => {
    const m = new Map<string, number>();
    for (const p of all) {
      const k = pick(p);
      if (k) m.set(k, (m.get(k) ?? 0) + 1);
    }
    return m;
  };
  const catCounts = countBy((p) => p.category?.slug);

  return (
    <main className="mx-auto max-w-[1400px] px-5 md:px-10 pt-8 pb-24">
      <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3 border-b border-ink pb-5 mb-7">
        <div>
          <p className="font-label text-muted mb-2">
            {filterActive ? eyebrowLabel : "Full catalogue"}
          </p>
          <h1 className="font-display text-[clamp(1.9rem,5vw,3rem)]">
            {activeCollection?.name ?? activeCategory?.name ?? "All cloth"}
          </h1>
        </div>
        <p className="text-ink-soft text-[0.92rem] leading-snug max-w-[40ch]">
          {activeCollection?.description ||
            "Streetwear and football jerseys for men and women. Sold by the piece or by the carton."}
        </p>
      </header>

      <div className="grid lg:grid-cols-[13.5rem_1fr] gap-8 lg:gap-12">
        <div className="lg:contents">
          <div className="flex items-center justify-between gap-4 mb-5 lg:hidden">
            <FilterRail
              collections={collections.map((col) => ({ slug: col.slug, name: col.name }))}
              categories={categories.map((cat) => ({
                slug: cat.slug,
                name: cat.name,
                count: catCounts.get(cat.slug) ?? 0,
              }))}
              activeCollection={activeCollection?.slug ?? null}
              activeCategory={activeCategory?.slug ?? null}
              total={display.length}
            />
            <p className="font-label text-muted tnum">
              {String(display.length).padStart(2, "0")}{" "}
              {display.length === 1 ? "piece" : "pieces"}
            </p>
          </div>

          <div className="hidden lg:block lg:self-start lg:sticky lg:top-28">
            <FilterRail
              collections={collections.map((col) => ({ slug: col.slug, name: col.name }))}
              categories={categories.map((cat) => ({
                slug: cat.slug,
                name: cat.name,
                count: catCounts.get(cat.slug) ?? 0,
              }))}
              activeCollection={activeCollection?.slug ?? null}
              activeCategory={activeCategory?.slug ?? null}
              total={display.length}
            />
          </div>
        </div>

        <div>
          {display.length === 0 ? (
            <div className="border border-dashed border-line-2 p-16 text-center">
              <p className="font-label text-muted">
                {filterActive
                  ? `Nothing in ${eyebrowLabel.toLowerCase()} right now`
                  : "Between drops — check back soon"}
              </p>
              {filterActive && (
                <p className="mt-5">
                  <Link href="/shop" className="font-label underline underline-offset-4">
                    See everything →
                  </Link>
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-10 md:gap-x-6 md:gap-y-12">
              {display.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
