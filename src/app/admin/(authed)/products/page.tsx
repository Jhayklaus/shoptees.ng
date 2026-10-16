import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { listAdminProducts } from "@/lib/server/products";
import { PRODUCT_STATUSES, PRODUCT_STATUS_LABELS, type ProductStatus } from "@/lib/constants";
import { formatNaira } from "@/lib/utils";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";

export const dynamic = "force-dynamic";

type Params = { status?: string };

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  const { status: statusParam } = await searchParams;
  const products = await listAdminProducts();

  // Tabs are filtered in memory rather than in the query, because every tab
  // needs the count of every OTHER tab to label itself. One read of the
  // catalogue answers all of them; a per-tab query would be five.
  const tally = (status: ProductStatus) =>
    products.filter((p) => p.status === status).length;

  // An unknown ?status= falls back to "All" rather than an empty table.
  const active: ProductStatus | null =
    PRODUCT_STATUSES.find((s) => s === statusParam) ?? null;

  const shown = active ? products.filter((p) => p.status === active) : products;

  return (
    <>
      <PageHeader
        eyebrow={`Catalogue · ${tally("ACTIVE")} live · ${tally("COMING_SOON")} coming soon`}
        title="Products"
        accent="all of them."
        actions={
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 bg-ink text-paper px-4 py-2 font-label hover:bg-vermillion transition-colors"
          >
            <Plus size={14} /> New product
          </Link>
        }
      />

      <div className="px-8 py-8">
        {/* Status tabs. "Coming soon" is the one worth having here: it is
            the wave being staged, and before this the only way to see it as
            a list was to read the status column of the whole catalogue. */}
        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-line mb-6">
          <Tab href="/admin/products" on={active === null} count={products.length}>
            All
          </Tab>
          {PRODUCT_STATUSES.map((s) => (
            <Tab
              key={s}
              href={`/admin/products?status=${s}`}
              on={active === s}
              count={tally(s)}
            >
              {PRODUCT_STATUS_LABELS[s]}
            </Tab>
          ))}
        </nav>

        {products.length === 0 ? (
          <div className="border border-dashed border-line p-12 text-center">
            <p className="font-italic-accent text-2xl text-ink/55">No products yet.</p>
            <Link
              href="/admin/products/new"
              className="inline-block mt-5 border border-ink px-5 py-2 font-label hover:bg-ink hover:text-paper"
            >
              Create the first one →
            </Link>
          </div>
        ) : shown.length === 0 ? (
          <div className="border border-dashed border-line p-12 text-center">
            <p className="font-italic-accent text-2xl text-ink/55">
              Nothing {active ? PRODUCT_STATUS_LABELS[active].toLowerCase() : ""} right now.
            </p>
            <Link
              href="/admin/products"
              className="inline-block mt-5 border border-ink px-5 py-2 font-label hover:bg-ink hover:text-paper"
            >
              See the whole catalogue →
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
                {shown.map((p) => {
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
                        <p className="font-label text-ink/40 text-[0.65rem]">/{p.slug}</p>
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
                      <Td className="font-label">
                        {p.priceNGN > 0 ? formatNaira(p.priceNGN) : "—"}
                      </Td>
                      <Td
                        className={`font-label ${
                          // A coming-soon piece is expected to sit at zero,
                          // so flagging it red every time trains the eye to
                          // ignore the column where it matters.
                          stock <= 3 && p.status !== "COMING_SOON" ? "text-vermillion" : ""
                        }`}
                      >
                        {stock}
                      </Td>
                      <Td className="font-label text-ink/55">{p._count.orderItems}</Td>
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

/** One status tab. The count is part of the label — an empty tab says so. */
function Tab({
  href,
  on,
  count,
  children,
}: {
  href: string;
  on: boolean;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={on ? "page" : undefined}
      className={`font-label -mb-px border-b-2 pb-2 pt-1 transition-colors ${
        on ? "border-ink text-ink" : "border-transparent text-ink/45 hover:text-ink"
      }`}
    >
      {children}
      <span className="tnum ml-2 text-ink/40">{count}</span>
    </Link>
  );
}

function Th({ children }: { children?: React.ReactNode }) {
  return <th className="font-label text-ink/55 px-4 py-3 font-normal">{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}
