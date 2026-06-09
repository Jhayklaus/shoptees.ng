import { Hero, type HeroContent } from "@/components/marketing/Hero";
import { CampaignBanner } from "@/components/marketing/CampaignBanner";
import { FeaturedGrid } from "@/components/marketing/FeaturedGrid";
import { CollectionsGrid } from "@/components/marketing/CollectionsGrid";
import { HomeBanners } from "@/components/marketing/HomeBanners";
import { Manifesto } from "@/components/marketing/Manifesto";
import { Newsletter } from "@/components/marketing/Newsletter";
import { getAllSettings } from "@/lib/server/settings";

export default async function HomePage() {
  const s = await getAllSettings();

  const hero: HeroContent = {
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
      <CampaignBanner />
      <FeaturedGrid />
      <CollectionsGrid />
      <HomeBanners />
      <Manifesto />
      <Newsletter />
    </>
  );
}
