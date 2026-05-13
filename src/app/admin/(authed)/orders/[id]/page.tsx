import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getOrderById } from "@/lib/server/orders";
import { formatNaira } from "@/lib/utils";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  return (
    <>
      <PageHeader
        eyebrow={
          <Link href="/admin/orders" className="inline-flex items-center gap-1 hover:text-vermillion">
            <ArrowLeft size={12} /> Orders
          </Link>
        }
        title={order.orderNumber}
        accent={order.status.toLowerCase()}
      />

      <div className="px-8 py-8 grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8 space-y-8">
          <section>
            <h2 className="font-mono-tight text-ink/55 mb-3">Items</h2>
            <div className="border border-line">
              <table className="w-full text-sm">
                <thead className="bg-paper-deep border-b border-line">
                  <tr className="text-left">
                    <Th>Product</Th>
                    <Th>Size</Th>
                    <Th>Unit</Th>
                    <Th>Qty</Th>
                    <Th>Line total</Th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id} className="border-b border-line last:border-0">
                      <Td>
                        {item.product ? (
                          <Link
                            href={`/admin/products/${item.product.id}`}
                            className="font-display text-lg leading-tight hover:text-vermillion"
                          >
                            {item.productName}
                          </Link>
                        ) : (
                          <span className="font-display text-lg leading-tight">{item.productName}</span>
                        )}
                      </Td>
                      <Td className="font-mono-tight">{item.variantSize}</Td>
                      <Td className="font-mono-tight">{formatNaira(item.unitPriceNGN)}</Td>
                      <Td className="font-mono-tight">{item.quantity}</Td>
                      <Td className="font-mono-tight">
                        {formatNaira(item.unitPriceNGN * item.quantity)}
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="font-mono-tight text-ink/55 mb-3">Customer</h2>
            <div className="border border-line p-5 space-y-1">
              <p className="font-display text-2xl">
                {order.customer.firstName} {order.customer.lastName}
              </p>
              <p className="font-mono-tight">{order.customer.email}</p>
              {order.customer.phone && (
                <p className="font-mono-tight text-ink/55">{order.customer.phone}</p>
              )}
            </div>
          </section>

          {order.address && (
            <section>
              <h2 className="font-mono-tight text-ink/55 mb-3">Delivery address</h2>
              <div className="border border-line p-5">
                <p>{order.address.line1}</p>
                {order.address.line2 && <p>{order.address.line2}</p>}
                <p>
                  {order.address.city}, {order.address.state}
                  {order.address.postal && ` ${order.address.postal}`}
                </p>
                <p className="font-mono-tight text-ink/55">{order.address.country}</p>
              </div>
            </section>
          )}
        </div>

        <aside className="col-span-12 lg:col-span-4 space-y-6 lg:sticky lg:top-6 self-start">
          <div className="border border-line p-5">
            <p className="font-mono-tight text-ink/55 mb-3">Status</p>
            <div className="flex items-center justify-between gap-3 mb-4">
              <StatusBadge status={order.status} />
              <p className="font-mono-tight text-ink/55">
                {new Date(order.createdAt).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}
              </p>
            </div>
            <OrderStatusSelect id={order.id} current={order.status} />
          </div>

          <div className="border border-line p-5">
            <p className="font-mono-tight text-ink/55 mb-3">Totals</p>
            <dl className="space-y-1">
              <Row k="Subtotal" v={formatNaira(order.subtotalNGN)} />
              <Row k="Shipping" v={order.shippingNGN > 0 ? formatNaira(order.shippingNGN) : "—"} />
            </dl>
            <div className="mt-3 pt-3 border-t border-line flex justify-between font-display text-2xl">
              <p>Total</p>
              <p>{formatNaira(order.totalNGN)}</p>
            </div>
          </div>

          {order.paystackReference && (
            <div className="border border-line p-5">
              <p className="font-mono-tight text-ink/55 mb-2">Paystack reference</p>
              <p className="font-mono-tight break-all">{order.paystackReference}</p>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}

function Th({ children }: { children?: React.ReactNode }) {
  return <th className="font-mono-tight text-ink/55 text-left px-4 py-3 font-normal">{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}
function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between font-mono-tight text-ink-soft">
      <dt>{k}</dt>
      <dd>{v}</dd>
    </div>
  );
}
