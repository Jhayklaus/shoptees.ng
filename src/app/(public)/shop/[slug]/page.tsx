import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/seo";
import { productJsonLd, breadcrumbJsonLd } from "@/lib/jsonld";
import { getProductBySlug, toDisplayProduct } from "@/lib/server/products";
import { ProductDetail } from "@/components/product/ProductDetail";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const row = await getProductBySlug(slug);
  if (!row || row.status === "ARCHIVED") return {};
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

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Shop", url: "/shop" },
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
    </>
  );
}
