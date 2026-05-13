import { listCustomersWithStats } from "@/lib/server/customers";
import { formatNaira } from "@/lib/utils";
import { PageHeader } from "@/components/admin/PageHeader";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const customers = await listCustomersWithStats();

  return (
    <>
      <PageHeader
        eyebrow={`People · ${customers.length}`}
        title="Customers"
        accent="who bought."
      />

      <div className="px-8 py-8">
        {customers.length === 0 ? (
          <div className="border border-dashed border-line p-12 text-center">
            <p className="font-italic-accent text-2xl text-ink/55">No customers yet.</p>
            <p className="font-mono-tight text-ink/55 mt-2">
              Customers are created automatically on first checkout.
            </p>
          </div>
        ) : (
          <div className="border border-line overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead className="bg-paper-deep border-b border-line">
                <tr className="text-left">
                  <Th>Name</Th>
                  <Th>Email</Th>
                  <Th>Phone</Th>
                  <Th>Orders</Th>
                  <Th>Lifetime spend</Th>
                  <Th>First order</Th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} className="border-b border-line last:border-0 hover:bg-paper-deep">
                    <Td className="font-display text-lg leading-tight">
                      {c.firstName} {c.lastName}
                    </Td>
                    <Td className="font-mono-tight">{c.email}</Td>
                    <Td className="font-mono-tight text-ink/55">{c.phone ?? "—"}</Td>
                    <Td className="font-mono-tight">{c.orderCount}</Td>
                    <Td className="font-mono-tight">
                      {c.lifetimeNGN > 0 ? formatNaira(c.lifetimeNGN) : "—"}
                    </Td>
                    <Td className="font-mono-tight text-ink/55">
                      {new Date(c.createdAt).toLocaleDateString("en-NG")}
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
