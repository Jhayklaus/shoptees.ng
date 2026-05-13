import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatNaira } from "@/lib/utils";
import { KpiCard } from "@/components/admin/KpiCard";
import { PageHeader } from "@/components/admin/PageHeader";

export const dynamic = "force-dynamic";

async function loadKpis() {
  const now = new Date();
  const last30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    revenueAgg,
    revenue30Agg,
    paidOrders,
    pendingOrders,
    customers,
    activeProducts,
    lowStockVariants,
    recentOrders,
  ] = await Promise.all([
    prisma.order.aggregate({
      _sum: { totalNGN: true },
      where: { status: { in: ["PAID", "FULFILLED"] } },
    }),
    prisma.order.aggregate({
      _sum: { totalNGN: true },
      where: {
        status: { in: ["PAID", "FULFILLED"] },
        createdAt: { gte: last30 },
      },
    }),
    prisma.order.count({ where: { status: { in: ["PAID", "FULFILLED"] } } }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.customer.count(),
    prisma.product.count({ where: { status: "ACTIVE" } }),
    prisma.variant.count({ where: { stock: { lte: 3 } } }),
    prisma.order.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { customer: true, items: true },
    }),
  ]);

  return {
    totalRevenue: revenueAgg._sum.totalNGN ?? 0,
    revenue30: revenue30Agg._sum.totalNGN ?? 0,
    paidOrders,
    pendingOrders,
    customers,
    activeProducts,
    lowStockVariants,
    recentOrders,
  };
}

export default async function AdminDashboard() {
  const k = await loadKpis();

  return (
    <>
      <PageHeader
        eyebrow="Studio · Today"
        title="Overview"
        accent="at a glance."
      />

      <div className="px-8 py-8 space-y-10">
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              accent
              label="Total revenue"
              value={k.totalRevenue > 0 ? formatNaira(k.totalRevenue) : "₦0"}
              hint="paid + fulfilled, all-time"
            />
            <KpiCard
              label="Last 30 days"
              value={k.revenue30 > 0 ? formatNaira(k.revenue30) : "₦0"}
              hint="rolling window"
            />
            <KpiCard
              label="Paid orders"
              value={k.paidOrders.toString()}
              hint={`${k.pendingOrders} pending`}
            />
            <KpiCard
              label="Customers"
              value={k.customers.toString()}
              hint="all-time"
            />
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Active products"
            value={k.activeProducts.toString()}
          />
          <KpiCard
            label="Low-stock variants"
            value={k.lowStockVariants.toString()}
            hint="≤ 3 in stock"
          />
        </section>

        <section>
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="font-mono-tight text-ink/55">Recent</p>
              <h2 className="font-display text-3xl tracking-tight">
                Latest <span className="font-italic-accent text-vermillion">orders.</span>
              </h2>
            </div>
            <Link href="/admin/orders" className="font-mono-tight underline-offset-4 hover:underline">
              See all →
            </Link>
          </div>

          {k.recentOrders.length === 0 ? (
            <div className="border border-dashed border-line p-10 text-center">
              <p className="font-italic-accent text-2xl text-ink/55">
                No orders yet — your storefront is quiet.
              </p>
              <p className="font-mono-tight text-ink/55 mt-2">
                Once a customer checks out, the order will appear here.
              </p>
            </div>
          ) : (
            <div className="border border-line">
              <table className="w-full text-sm">
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
                  {k.recentOrders.map((o) => (
                    <tr key={o.id} className="border-b border-line last:border-0 hover:bg-paper-deep">
                      <Td>
                        <Link href={`/admin/orders/${o.id}`} className="font-mono-tight hover:text-vermillion">
                          {o.orderNumber}
                        </Link>
                      </Td>
                      <Td>{o.customer.email}</Td>
                      <Td>{o.items.length}</Td>
                      <Td>
                        <StatusBadge status={o.status} />
                      </Td>
                      <Td className="font-mono-tight">{formatNaira(o.totalNGN)}</Td>
                      <Td className="font-mono-tight text-ink/55">
                        {new Date(o.createdAt).toLocaleDateString("en-NG")}
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="font-mono-tight text-ink/55 px-4 py-3 font-normal">{children}</th>;
}
function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING: "bg-paper-deep text-ink-soft border-line",
    PAID: "bg-ink text-paper border-ink",
    FULFILLED: "bg-vermillion text-paper border-vermillion",
    CANCELLED: "bg-paper text-ink/40 border-line line-through",
  };
  return (
    <span
      className={`font-mono-tight px-2 py-0.5 border ${map[status] ?? "border-line"}`}
    >
      {status.toLowerCase()}
    </span>
  );
}
