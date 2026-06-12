import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/admin/PageHeader";
import { TaxonomyForm } from "@/components/admin/TaxonomyForm";
import { saveCollectionAction, deleteCollectionAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditCollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const collection = await prisma.collection.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });
  if (!collection) notFound();

  const deleteAction = async () => {
    "use server";
    return deleteCollectionAction(collection.id);
  };

  return (
    <>
      <PageHeader eyebrow="Catalogue" title="Edit collection" accent={collection.name} />
      <TaxonomyForm
        noun="collection"
        listHref="/admin/collections"
        withDescription
        withImage
        action={saveCollectionAction}
        deleteAction={deleteAction}
        productCount={collection._count.products}
        initial={{
          id: collection.id,
          slug: collection.slug,
          name: collection.name,
          description: collection.description,
          imageUrl: collection.imageUrl,
          imageAlt: collection.imageAlt,
          sortOrder: collection.sortOrder,
        }}
      />
    </>
  );
}
