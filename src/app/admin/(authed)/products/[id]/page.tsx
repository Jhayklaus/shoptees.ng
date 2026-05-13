import { notFound } from "next/navigation";
import { getProductById, getActiveCategories } from "@/lib/server/products";
import { ProductForm } from "@/components/admin/ProductForm";
import { PageHeader } from "@/components/admin/PageHeader";
import { saveProductAction, deleteProductAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getProductById(id),
    getActiveCategories(),
  ]);
  if (!product) notFound();

  const deleteAction = async () => {
    "use server";
    return deleteProductAction(product.id);
  };

  return (
    <>
      <PageHeader eyebrow="Catalogue" title="Edit" accent={`/${product.slug}`} />
      <ProductForm
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        action={saveProductAction}
        deleteAction={deleteAction}
        initial={{
          id: product.id,
          slug: product.slug,
          name: product.name,
          description: product.description,
          priceNGN: product.priceNGN,
          status: product.status as "DRAFT" | "ACTIVE" | "ARCHIVED",
          categoryId: product.categoryId,
          variants: product.variants.map((v) => ({
            id: v.id,
            size: v.size,
            color: v.color,
            sku: v.sku,
            stock: v.stock,
            priceOverrideNGN: v.priceOverrideNGN,
          })),
          images: product.images.map((i) => ({
            id: i.id,
            url: i.url,
            alt: i.alt,
            sortOrder: i.sortOrder,
          })),
        }}
      />
    </>
  );
}
