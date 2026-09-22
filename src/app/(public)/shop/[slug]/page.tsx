import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/seo";
import { productJsonLd, breadcrumbJsonLd } from "@/lib/jsonld";
import {
  getProductBySlug,
  listActiveProducts,
  toDisplayProduct,
} from "@/lib/server/products";
import { ProductDetail } from "@/components/product/ProductDetail";
import { ProductCard } from "@/components/product/ProductCard";
import { SectionHead } from "@/components/marketing/SectionHead";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const row = await getProductBySlug(slug);
  // Drafts and archived products must not leak their name through the page
  // title — the body is the 404, the <title> should match it.
  if (!row || row.status !== "ACTIVE") return {};
  return buildMetadata({
    title: row.name,
    description: row.description,
    path: `/shop/${row.slug}`,
    image: row.images[0]?.url,
  });
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const row = await getProductBySlug(slug);
  if (!row || row.status === "ARCHIVED") notFound();

  const product = toDisplayProduct(row);

  // Rest of the line. Falls back to the wider catalogue when a collection
  // holds only this one piece, so the block is never a lonely single card.
  const siblings = product.collection
    ? await listActiveProducts({ collectionSlug: product.collection.slug })
    : [];
  const pool = siblings.length > 1 ? siblings : await listActiveProducts();
  const related = pool
    .filter((p) => p.slug !== product.slug)
    .slice(0, 4)
    .map(toDisplayProduct);
  const relatedTitle =
    siblings.length > 1 && product.collection
      ? `More from ${product.collection.name}`
      : "Also in the archive";

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Shop", url: "/shop" },
    ...(product.collection
      ? [{ name: product.collection.name, url: `/collections/${product.collection.slug}` }]
      : []),
    ...(product.category
      ? [{ name: product.category.name, url: `/shop?c=${product.category.slug}` }]
      : []),
    { name: product.name, url: `/shop/${product.slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(product)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <ProductDetail product={product} />

      {related.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-5 md:px-10 pb-24 lg:pb-28">
          <SectionHead
            title={relatedTitle}
            href={
              siblings.length > 1 && product.collection
                ? `/collections/${product.collection.slug}`
                : "/shop"
            }
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-10 md:gap-x-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
