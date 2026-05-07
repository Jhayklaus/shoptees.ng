import { buildMetadata } from "@/lib/seo";
import { products, categories } from "@/data/products";
import { ProductCard } from "@/components/product/ProductCard";

export const metadata = buildMetadata({
  title: "Shop — Shoptees",
  description: "The full Shoptees collection — short runs, heavy cotton, made in Lagos.",
  path: "/shop",
});

export default function ShopPage() {
  return (
    <main className="mx-auto max-w-[1400px] px-5 md:px-10 pt-12 pb-24">
      <header className="grid grid-cols-12 gap-6 mb-12 border-b border-line pb-8">
        <div className="col-span-12 md:col-span-7">
          <p className="font-mono-tight text-ink/55">Catalogue · {products.length} pieces</p>
          <h1 className="font-display text-6xl md:text-8xl tracking-tight leading-[0.95] mt-1">
            All <span className="font-italic-accent text-vermillion">cloth.</span>
          </h1>
        </div>
        <div className="col-span-12 md:col-span-5 md:pt-3">
          <p className="font-italic-accent text-xl md:text-2xl text-ink/70 max-w-md">
            Sorted by the order things were dreamt up. Sizes run small. Heavyweight cotton, screen-printed in Lagos.
          </p>
        </div>
      </header>

      <div className="flex flex-wrap gap-2 mb-10">
        <button
          type="button"
          className="font-mono-tight border border-ink bg-ink text-paper px-3 py-1.5"
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            className="font-mono-tight border border-line px-3 py-1.5 hover:border-ink transition-colors"
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-14">
        {products.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
      </div>
    </main>
  );
}
