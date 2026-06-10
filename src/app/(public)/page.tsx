import { Hero, type HeroContent } from "@/components/marketing/Hero";
import { CampaignBanner } from "@/components/marketing/CampaignBanner";
import { DropMarquee } from "@/components/marketing/DropMarquee";
import { FeaturedGrid } from "@/components/marketing/FeaturedGrid";
import { CollectionsGrid } from "@/components/marketing/CollectionsGrid";
import { CategoriesGrid } from "@/components/marketing/CategoriesGrid";
import { HomeBanners } from "@/components/marketing/HomeBanners";
import { Manifesto } from "@/components/marketing/Manifesto";
import { Newsletter } from "@/components/marketing/Newsletter";
import { getAllSettings } from "@/lib/server/settings";
import { getHeroBanner } from "@/lib/server/banners";

// Homepage content (hero banner, campaign banners, settings) is admin-managed
// in the DB, so render per-request instead of freezing it at build time.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [s, heroBanner] = await Promise.all([getAllSettings(), getHeroBanner()]);

  // Hero content: DB hero-slot banner takes priority, settings keys are the fallback.
  const hero: HeroContent = heroBanner
    ? {
        eyebrow: heroBanner.eyebrow || s["hero.eyebrow"],
        headline: heroBanner.title,
        cycleWords: heroBanner.cycleWords
          .split(",")
          .map((w) => w.trim())
          .filter(Boolean),
        body: heroBanner.body,
        ctaLabel: heroBanner.ctaLabel,
        ctaHref: heroBanner.ctaHref || "/shop",
        imageUrl: heroBanner.imageUrl,
        imageAlt: heroBanner.imageAlt,
        caption: heroBanner.caption,
      }
    : {
        eyebrow: s["hero.eyebrow"],
        headline: s["hero.headline"],
        cycleWords: s["hero.cycle_words"]
          .split(",")
          .map((w) => w.trim())
          .filter(Boolean),
        body: s["hero.body"],
        ctaLabel: s["hero.cta_label"],
        ctaHref: s["hero.cta_href"],
        imageUrl: s["hero.image_url"],
        imageAlt: s["hero.image_alt"],
        caption: s["hero.caption"],
      };

  return (
    <>
      <Hero content={hero} />
      <FeaturedGrid />
      <DropMarquee />
      {/* <CollectionsGrid /> */}
      <CategoriesGrid />
      <HomeBanners />
      <CampaignBanner />
      {/* <Manifesto /> */}
      <Newsletter />
    </>
  );
}
