import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { listAdminProducts } from "@/lib/server/products";
import { formatNaira } from "@/lib/utils";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await listAdminProducts();

  return (
    <>
      <PageHeader
        eyebrow={`Catalogue · ${products.length} pieces`}
        title="Products"
        accent="all of them."
        actions={
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 bg-ink text-paper px-4 py-2 font-mono-tight hover:bg-vermillion transition-colors"
          >
            <Plus size={14} /> New product
          </Link>
        }
      />

      <div className="px-8 py-8">
        {products.length === 0 ? (
          <div className="border border-dashed border-line p-12 text-center">
            <p className="font-italic-accent text-2xl text-ink/55">No products yet.</p>
            <Link
              href="/admin/products/new"
              className="inline-block mt-5 border border-ink px-5 py-2 font-mono-tight hover:bg-ink hover:text-paper"
            >
              Create the first one →
            </Link>
          </div>
        ) : (
          <div className="border border-line overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead className="bg-paper-deep border-b border-line">
                <tr className="text-left">
                  <Th></Th>
                  <Th>Name</Th>
                  <Th>Status</Th>
                  <Th>Collection</Th>
                  <Th>Category</Th>
                  <Th>Price</Th>
                  <Th>Stock</Th>
                  <Th>Sales</Th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const stock = p.variants.reduce((s, v) => s + v.stock, 0);
                  const img = p.images[0];
                  return (
                    <tr key={p.id} className="border-b border-line last:border-0 hover:bg-paper-deep">
                      <Td className="w-16">
                        {img ? (
                          <div className="relative w-12 h-14 bg-paper-deep">
                            <Image src={img.url} alt={img.alt} fill sizes="48px" className="object-cover" />
                          </div>
                        ) : (
                          <div className="w-12 h-14 bg-paper-deep border border-line" />
                        )}
                      </Td>
                      <Td>
                        <Link
                          href={`/admin/products/${p.id}`}
                          className="font-display text-lg leading-tight hover:text-vermillion"
                        >
                          {p.name}
                        </Link>
                        <p className="font-mono-tight text-ink/40 text-[0.65rem]">/{p.slug}</p>
                      </Td>
                      <Td>
                        <StatusBadge status={p.status} variant="product" />
                      </Td>
                      <Td className="font-italic-accent text-ink-soft">
                        {p.collection?.name ?? "—"}
                      </Td>
                      <Td className="font-italic-accent text-ink-soft">
                        {p.category?.name ?? "—"}
                      </Td>
                      <Td className="font-mono-tight">
                        {p.priceNGN > 0 ? formatNaira(p.priceNGN) : "—"}
                      </Td>
                      <Td className={`font-mono-tight ${stock <= 3 ? "text-vermillion" : ""}`}>
                        {stock}
                      </Td>
                      <Td className="font-mono-tight text-ink/55">{p._count.orderItems}</Td>
                    </tr>
                  );
                })}
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
