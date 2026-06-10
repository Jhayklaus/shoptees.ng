import Link from "next/link";
import { Plus } from "lucide-react";
import { listAdminCategories } from "@/lib/server/categories";
import { PageHeader } from "@/components/admin/PageHeader";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await listAdminCategories();

  return (
    <>
      <PageHeader
        eyebrow={`Catalogue · ${categories.length} categor${categories.length === 1 ? "y" : "ies"}`}
        title="Categories"
        accent="product types."
        actions={
          <Link
            href="/admin/categories/new"
            className="inline-flex items-center gap-2 bg-ink text-paper px-4 py-2 font-mono-tight hover:bg-vermillion transition-colors"
          >
            <Plus size={14} /> New category
          </Link>
        }
      />

      <div className="px-8 py-8">
        {categories.length === 0 ? (
          <div className="border border-dashed border-line p-12 text-center">
            <p className="font-italic-accent text-2xl text-ink/55">No categories yet.</p>
            <p className="font-mono-tight text-ink/55 mt-2">
              Categories are product types — jerseys, hoodies, pants — shared across collections.
            </p>
            <Link
              href="/admin/categories/new"
              className="inline-block mt-5 border border-ink px-5 py-2 font-mono-tight hover:bg-ink hover:text-paper"
            >
              Create the first one →
            </Link>
          </div>
        ) : (
          <div className="border border-line overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead className="bg-paper-deep border-b border-line">
                <tr className="text-left">
                  <Th>Name</Th>
                  <Th>Slug</Th>
                  <Th>Products</Th>
                  <Th>Sort</Th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id} className="border-b border-line last:border-0 hover:bg-paper-deep">
                    <Td>
                      <Link
                        href={`/admin/categories/${c.id}`}
                        className="font-display text-lg leading-tight hover:text-vermillion"
                      >
                        {c.name}
                      </Link>
                    </Td>
                    <Td className="font-mono-tight text-ink/55">/{c.slug}</Td>
                    <Td className="font-mono-tight">{c._count.products}</Td>
                    <Td className="font-mono-tight text-ink/55">{c.sortOrder}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

function Th({ children }: { children?: React.ReactNode }) {
  return <th className="font-mono-tight text-ink/55 px-4 py-3 font-normal">{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}
