import { PageHeader } from "@/components/admin/PageHeader";
import { TaxonomyForm } from "@/components/admin/TaxonomyForm";
import { saveCollectionAction } from "../actions";

export const dynamic = "force-dynamic";

export default function NewCollectionPage() {
  return (
    <>
      <PageHeader eyebrow="Catalogue" title="New collection" accent="a fresh line." />
      <TaxonomyForm
        noun="collection"
        listHref="/admin/collections"
        withDescription
        withImage
        action={saveCollectionAction}
        initial={{ slug: "", name: "", description: "", imageUrl: "", imageAlt: "", sortOrder: 0 }}
      />
    </>
  );
}
