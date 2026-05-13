import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { listActiveProducts, toDisplayProduct, getActiveCategories } from "@/lib/server/products";
import { ProductCard } from "@/components/product/ProductCard";

const BASE_DESCRIPTION =
  "Streetwear and football jerseys from Shoptees — tees, jerseys, jorts, hoodies, pants and more.";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}): Promise<Metadata> {
  const { c } = await searchParams;
  if (!c) {
    return buildMetadata({
      title: "Shop",
      description: BASE_DESCRIPTION,
      path: "/shop",
    });
  }
  // Category-aware: title + description carry the collection name; canonical
  // includes the query so each collection has its own indexable URL.
  const categories = await getActiveCategories();
  const match = categories.find((cat) => cat.slug === c);
  if (!match) {
    return buildMetadata({ title: "Shop", description: BASE_DESCRIPTION, path: "/shop" });
  }
  return buildMetadata({
    title: `${match.name} — Shop`,
    description: `Shop ${match.name.toLowerCase()} from Shoptees. Streetwear and football apparel for men and women.`,
    path: `/shop?c=${match.slug}`,
  });
}

export const dynamic = "force-dynamic";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  const { c: activeSlug } = await searchParams;

  const [categories, products] = await Promise.all([
    getActiveCategories(),
    listActiveProducts({ categorySlug: activeSlug }),
  ]);
  const display = products.map(toDisplayProduct);

  const activeCategory = activeSlug
    ? categories.find((cat) => cat.slug === activeSlug)
    : null;
  // If the slug doesn't match any category, treat it as "no filter" so the
  // page doesn't show a misleading "0 pieces" state.
  const filterActive = Boolean(activeCategory);

  return (
    <main className="mx-auto max-w-[1400px] px-5 md:px-10 pt-12 pb-24">
      <header className="grid grid-cols-12 gap-6 mb-12 border-b border-line pb-8">
        <div className="col-span-12 md:col-span-7">
          <p className="font-mono-tight text-ink/55">
            {filterActive
              ? `${activeCategory!.name} · ${display.length} ${display.length === 1 ? "piece" : "pieces"}`
              : `Catalogue · ${display.length} ${display.length === 1 ? "piece" : "pieces"}`}
          </p>
          <h1 className="font-display text-6xl md:text-8xl tracking-tight leading-[0.95] mt-1">
            {filterActive ? (
              <>
                {activeCategory!.name.replace(/s$/, "")}
                <span className="font-italic-accent text-vermillion">
                  {activeCategory!.name.endsWith("s") ? "s." : "."}
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
            Streetwear and football jerseys for men and women. Sold by the piece or by the carton.
          </p>
        </div>
      </header>

      {categories.length > 0 && (
        <div className="mb-10">
          <p className="font-mono-tight text-ink/55 mb-3">Collections</p>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/shop"
              scroll={false}
              className={[
                "font-mono-tight px-3 py-1.5 border transition-colors",
                !filterActive
                  ? "border-ink bg-ink text-paper"
                  : "border-line hover:border-ink",
              ].join(" ")}
            >
              All
            </Link>
            {categories.map((cat) => {
              const selected = cat.slug === activeSlug;
              return (
                <Link
                  key={cat.id}
                  href={`/shop?c=${cat.slug}`}
                  scroll={false}
                  className={[
                    "font-mono-tight px-3 py-1.5 border transition-colors",
                    selected
                      ? "border-ink bg-ink text-paper"
                      : "border-line hover:border-ink",
                  ].join(" ")}
                >
                  {cat.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {display.length === 0 ? (
        <div className="border border-dashed border-line p-16 text-center">
          <p className="font-italic-accent text-2xl text-ink/55">
            {filterActive
              ? `Nothing in ${activeCategory!.name.toLowerCase()} right now.`
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
