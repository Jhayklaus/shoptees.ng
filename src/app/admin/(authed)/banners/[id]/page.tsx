import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { BannerForm } from "@/components/admin/BannerForm";
import {
  getBanner,
  BANNER_LAYOUTS,
  SLOT_LABEL,
  isSingletonSlot,
  toBannerSlot,
  type BannerLayout,
  type BannerSlot,
} from "@/lib/server/banners";

export const dynamic = "force-dynamic";

/** Blank form for a singleton slot that has no row yet. */
function emptySingleton(slot: BannerSlot) {
  return {
    slot,
    enabled: true,
    sortOrder: 0,
    eyebrow: slot === "feature" ? "Featured collection" : "",
    title: "",
    body: "",
    cycleWords: "",
    caption: "",
    ctaLabel: slot === "feature" ? "Explore collection" : "Shop the drop",
    ctaHref: slot === "feature" ? "/collections" : "/shop",
    imageUrl: "",
    imageAlt: "",
    layout: "imageLeft" as BannerLayout,
  };
}

/**
 * Edit one banner.
 *
 * The id may also be a singleton slot name — /admin/banners/hero or
 * /admin/banners/feature — which opens a blank form bound to that slot. The
 * banner list has always linked to /admin/banners/hero when no hero existed;
 * until now that route 404'd, because nothing created the row.
 */
export default async function EditBannerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (isSingletonSlot(id)) {
    const slot = toBannerSlot(id);
    return (
      <>
        <PageHeader eyebrow="Homepage" title={SLOT_LABEL[slot]} accent="not set yet." />
        <BannerForm initial={emptySingleton(slot)} />
      </>
    );
  }

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
          slot: toBannerSlot(banner.slot),
          enabled: banner.enabled,
          sortOrder: banner.sortOrder,
          eyebrow: banner.eyebrow,
          title: banner.title,
          body: banner.body,
          cycleWords: banner.cycleWords,
          caption: banner.caption,
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
