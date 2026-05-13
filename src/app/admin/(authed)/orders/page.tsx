import Link from "next/link";
import { listOrders } from "@/lib/server/orders";
import { formatNaira } from "@/lib/utils";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await listOrders();

  return (
    <>
      <PageHeader
        eyebrow={`Sales · ${orders.length} orders`}
        title="Orders"
        accent="every line."
      />

      <div className="px-8 py-8">
        {orders.length === 0 ? (
          <div className="border border-dashed border-line p-12 text-center">
            <p className="font-italic-accent text-2xl text-ink/55">
              No orders yet — your storefront is quiet.
            </p>
            <p className="font-mono-tight text-ink/55 mt-2">
              Once a customer checks out, the order will appear here.
            </p>
          </div>
        ) : (
          <div className="border border-line overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead className="bg-paper-deep border-b border-line">
                <tr className="text-left">
                  <Th>Order</Th>
                  <Th>Customer</Th>
                  <Th>Items</Th>
                  <Th>Status</Th>
                  <Th>Total</Th>
                  <Th>Placed</Th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr
                    key={o.id}
                    className="border-b border-line last:border-0 hover:bg-paper-deep"
                  >
                    <Td>
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="font-mono-tight hover:text-vermillion"
                      >
                        {o.orderNumber}
                      </Link>
                    </Td>
                    <Td>{o.customer.email}</Td>
                    <Td className="font-mono-tight">{o.items.length}</Td>
                    <Td>
                      <StatusBadge status={o.status} />
                    </Td>
                    <Td className="font-mono-tight">{formatNaira(o.totalNGN)}</Td>
                    <Td className="font-mono-tight text-ink/55">
                      {new Date(o.createdAt).toLocaleString("en-NG", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </Td>
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
