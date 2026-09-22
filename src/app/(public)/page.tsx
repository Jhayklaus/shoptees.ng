import { Hero, type HeroContent } from "@/components/marketing/Hero";
import { CollectionIndex } from "@/components/marketing/CollectionIndex";
import { FeaturedGrid } from "@/components/marketing/FeaturedGrid";
import { ArchiveBreak } from "@/components/marketing/ArchiveBreak";
import { CollectionRows } from "@/components/marketing/CollectionRows";
import { CampaignBanner } from "@/components/marketing/CampaignBanner";
import { HomeBanners } from "@/components/marketing/HomeBanners";
import { Newsletter } from "@/components/marketing/Newsletter";
import { getAllSettings } from "@/lib/server/settings";
import { getHeroBanner } from "@/lib/server/banners";
import { listCollectionsWithProducts } from "@/lib/server/collections";
import { listActiveProducts } from "@/lib/server/products";
import { FEATURE_CROP } from "@/lib/images";

// Homepage content (hero banner, campaign banners, settings) is admin-managed
// in the DB, so render per-request instead of freezing it at build time.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  // `take: 1` because only the counts are wanted here — the rows render a
  // graphic crop, not a product rail — but reusing the existing query keeps
  // this page out of the data layer.
  const [s, heroBanner, collections, products] = await Promise.all([
    getAllSettings(),
    getHeroBanner(),
    listCollectionsWithProducts(1),
    listActiveProducts(),
  ]);

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

  const index = collections.map((c) => ({
    slug: c.slug,
    name: c.name,
    count: c._count.products,
  }));

  const rows = collections.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    imageUrl: c.imageUrl || null,
    count: c._count.products,
  }));

  return (
    <>
      <Hero
        content={hero}
        stats={{ collections: collections.length, pieces: products.length }}
      />
      <CollectionIndex collections={index} />
      <FeaturedGrid />

      {/* The page's one full-bleed moment. Quote is the archive's own line
          about this collection, not written copy. */}
      <ArchiveBreak
        image={FEATURE_CROP.wall}
        alt="Graffiti back print: a writer on a ladder tagging Shptz in white script across a black brick wall."
        eyebrow="Fight or Flight · FF-47"
        quote="The back print is the whole point: the front hit is small, the wall is the garment."
        attribution="— Shptz Wrld Collection Archive"
      />

      <CollectionRows collections={rows} />

      {/* Admin-managed slots, after the editorial run so they extend the
          page rather than interrupt it. Both render nothing when empty. */}
      <HomeBanners />
      <CampaignBanner />

      <Newsletter />
    </>
  );
}
