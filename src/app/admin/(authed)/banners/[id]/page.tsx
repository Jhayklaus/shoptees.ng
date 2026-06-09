import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { BannerForm } from "@/components/admin/BannerForm";
import { getBanner, BANNER_LAYOUTS, type BannerLayout } from "@/lib/server/banners";

export const dynamic = "force-dynamic";

export default async function EditBannerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const banner = await getBanner(id);
  if (!banner) notFound();

  const layout: BannerLayout = BANNER_LAYOUTS.includes(banner.layout as BannerLayout)
    ? (banner.layout as BannerLayout)
    : "imageLeft";

  return (
    <>
      <PageHeader eyebrow="Homepage" title="Edit banner" accent={banner.title || "untitled."} />
      <BannerForm
        initial={{
          id: banner.id,
          enabled: banner.enabled,
          sortOrder: banner.sortOrder,
          eyebrow: banner.eyebrow,
          title: banner.title,
          body: banner.body,
          ctaLabel: banner.ctaLabel,
          ctaHref: banner.ctaHref,
          imageUrl: banner.imageUrl,
          imageAlt: banner.imageAlt,
          layout,
        }}
      />
    </>
  );
}
