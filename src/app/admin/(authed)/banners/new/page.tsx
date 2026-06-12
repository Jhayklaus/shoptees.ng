import { PageHeader } from "@/components/admin/PageHeader";
import { BannerForm } from "@/components/admin/BannerForm";

export const dynamic = "force-dynamic";

export default function NewBannerPage() {
  return (
    <>
      <PageHeader eyebrow="Homepage" title="New banner" accent="fresh slot." />
      <BannerForm
        initial={{
          slot: "banner",
          enabled: true,
          sortOrder: 0,
          eyebrow: "",
          title: "",
          body: "",
          cycleWords: "",
          caption: "",
          ctaLabel: "Shop the drop",
          ctaHref: "/shop",
          imageUrl: "",
          imageAlt: "",
          layout: "imageLeft",
        }}
      />
    </>
  );
}
