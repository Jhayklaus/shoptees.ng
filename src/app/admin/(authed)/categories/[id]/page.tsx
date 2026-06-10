import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/admin/PageHeader";
import { TaxonomyForm } from "@/components/admin/TaxonomyForm";
import { saveCategoryAction, deleteCategoryAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });
  if (!category) notFound();

  const deleteAction = async () => {
    "use server";
    return deleteCategoryAction(category.id);
  };

  return (
    <>
      <PageHeader eyebrow="Catalogue" title="Edit category" accent={category.name} />
      <TaxonomyForm
        noun="category"
        listHref="/admin/categories"
        action={saveCategoryAction}
        deleteAction={deleteAction}
        productCount={category._count.products}
        initial={{
          id: category.id,
          slug: category.slug,
          name: category.name,
          sortOrder: category.sortOrder,
        }}
      />
    </>
  );
}
