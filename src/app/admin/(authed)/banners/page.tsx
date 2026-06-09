import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { listAllBanners } from "@/lib/server/banners";
import { PageHeader } from "@/components/admin/PageHeader";

export const dynamic = "force-dynamic";

export default async function AdminBannersPage() {
  const banners = await listAllBanners();

  return (
    <>
      <PageHeader
        eyebrow={`Homepage · ${banners.length} banner${banners.length === 1 ? "" : "s"}`}
        title="Banners"
        accent="on the homepage."
        actions={
          <Link
            href="/admin/banners/new"
            className="inline-flex items-center gap-2 bg-ink text-paper px-4 py-2 font-mono-tight hover:bg-vermillion transition-colors"
          >
            <Plus size={14} /> New banner
          </Link>
        }
      />

      <div className="px-8 py-8">
        {banners.length === 0 ? (
          <div className="border border-dashed border-line p-12 text-center">
            <p className="font-italic-accent text-2xl text-ink/55">No banners yet.</p>
            <Link
              href="/admin/banners/new"
              className="inline-block mt-5 border border-ink px-5 py-2 font-mono-tight hover:bg-ink hover:text-paper"
            >
              Create the first one →
            </Link>
          </div>
        ) : (
          <div className="border border-line overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead className="bg-paper-deep border-b border-line">
                <tr className="text-left">
                  <Th></Th>
                  <Th>Headline</Th>
                  <Th>Status</Th>
                  <Th>Layout</Th>
                  <Th>Order</Th>
                </tr>
              </thead>
              <tbody>
                {banners.map((b) => (
                  <tr key={b.id} className="border-b border-line last:border-0 hover:bg-paper-deep">
                    <Td className="w-20">
                      {b.imageUrl ? (
                        <div className="relative w-16 h-12 bg-paper-deep">
                          <Image src={b.imageUrl} alt={b.imageAlt} fill sizes="64px" className="object-cover" />
                        </div>
                      ) : (
                        <div className="w-16 h-12 bg-paper-deep border border-line" />
                      )}
                    </Td>
                    <Td>
                      <Link
                        href={`/admin/banners/${b.id}`}
                        className="font-display text-lg leading-tight hover:text-vermillion"
                      >
                        {b.title}
                      </Link>
                      {b.eyebrow && (
                        <p className="font-mono-tight text-ink/40 text-[0.65rem]">{b.eyebrow}</p>
                      )}
                    </Td>
                    <Td>
                      <span
                        className={[
                          "inline-block px-2 py-0.5 font-mono-tight text-[0.65rem] uppercase tracking-wider",
                          b.enabled
                            ? "bg-ink text-paper"
                            : "bg-vermillion/10 text-vermillion border border-vermillion/40",
                        ].join(" ")}
                      >
                        {b.enabled ? "Live" : "Hidden"}
                      </span>
                    </Td>
                    <Td className="font-italic-accent text-ink-soft">
                      {b.layout === "imageRight" ? "Image right" : "Image left"}
                    </Td>
                    <Td className="font-mono-tight text-ink/55">{b.sortOrder}</Td>
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
