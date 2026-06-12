import { PageHeader } from "@/components/admin/PageHeader";
import { TaxonomyForm } from "@/components/admin/TaxonomyForm";
import { saveCategoryAction } from "../actions";

export const dynamic = "force-dynamic";

export default function NewCategoryPage() {
  return (
    <>
      <PageHeader eyebrow="Catalogue" title="New category" accent="a product type." />
      <TaxonomyForm
        noun="category"
        listHref="/admin/categories"
        action={saveCategoryAction}
        initial={{ slug: "", name: "", sortOrder: 0 }}
      />
    </>
  );
}
