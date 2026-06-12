import { getActiveCategories } from "@/lib/server/products";
import { getActiveCollections } from "@/lib/server/collections";
import { ProductForm } from "@/components/admin/ProductForm";
import { PageHeader } from "@/components/admin/PageHeader";
import { saveProductAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const [categories, collections] = await Promise.all([
    getActiveCategories(),
    getActiveCollections(),
  ]);

  return (
    <>
      <PageHeader eyebrow="Catalogue" title="New product" accent="from scratch." />
      <ProductForm
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        collections={collections.map((c) => ({ id: c.id, name: c.name }))}
        action={saveProductAction}
        initial={{
          slug: "",
          name: "",
          description: "",
          priceNGN: 0,
          status: "DRAFT",
          categoryId: null,
          collectionId: null,
          variants: [
            { size: "S", color: "Default", sku: "", stock: 0, priceOverrideNGN: null },
            { size: "M", color: "Default", sku: "", stock: 0, priceOverrideNGN: null },
            { size: "L", color: "Default", sku: "", stock: 0, priceOverrideNGN: null },
          ],
          images: [],
        }}
      />
    </>
  );
}
