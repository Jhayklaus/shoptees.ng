import Link from "next/link";
import { Plus } from "lucide-react";
import { listAllBanners } from "@/lib/server/banners";
import { PageHeader } from "@/components/admin/PageHeader";
import { BannerList } from "@/components/admin/BannerList";

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
          <BannerList
            banners={banners.map((b) => ({
              id: b.id,
              slot: b.slot,
              title: b.title,
              eyebrow: b.eyebrow,
              enabled: b.enabled,
              imageUrl: b.imageUrl,
              imageAlt: b.imageAlt,
            }))}
          />
        )}
      </div>
    </>
  );
}
