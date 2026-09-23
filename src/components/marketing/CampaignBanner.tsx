import { FeatureBanner } from "@/components/marketing/FeatureBanner";
import { getAllSettings } from "@/lib/server/settings";

/**
 * Full-bleed campaign banner, admin-managed via the `campaign.*` settings.
 * Hidden unless enabled and an image is set.
 *
 * Rendered through FeatureBanner like every other banner on the page. It
 * previously ran its own format — tan corner brackets, an 8xl headline and a
 * filled button — which made the one slot a marketer controls the one slot
 * that looked like a different site. It keeps the larger height, since a
 * campaign is meant to outweigh the banners stacked above it; the type scale
 * comes from the shared component so it can no longer drift.
 */
export async function CampaignBanner() {
  const s = await getAllSettings();
  if (s["campaign.enabled"] !== "true" || !s["campaign.image_url"]) return null;

  const headline = s["campaign.headline"];
  if (!headline) return null;

  return (
    <FeatureBanner
      image={s["campaign.image_url"]}
      imageAlt={s["campaign.image_alt"] || headline}
      headline={headline}
      body={s["campaign.subcopy"] || undefined}
      ctaLabel={s["campaign.cta_label"] || undefined}
      ctaHref={s["campaign.cta_href"] || "/shop"}
      height="lg"
    />
  );
}
