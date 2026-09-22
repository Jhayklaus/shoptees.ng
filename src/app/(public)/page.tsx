import { Hero, type HeroContent } from "@/components/marketing/Hero";
import { CategoryTiles } from "@/components/marketing/CategoryTiles";
import { FeaturedGrid } from "@/components/marketing/FeaturedGrid";
import { FeatureBanner } from "@/components/marketing/FeatureBanner";
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
      <Hero content={hero} />
      <CategoryTiles />
      <FeaturedGrid />

      {/* Editorial banner. The serif display voice appears here and in the
          hero, and nowhere else — both sit on a photograph, which is what
          earns the size. */}
      <FeatureBanner
        image={FEATURE_CROP.allover}
        imageAlt="Flaming-dice Trap House mark repeated across an all-over knit."
        eyebrow="Featured collection"
        headline="One mark, every scale"
        body="Trap House runs headwear, socks and bottoms — the same flaming die applied from a sock cuff to an all-over beanie repeat."
        ctaLabel="Explore collection"
        ctaHref="/collections/trap-house"
      />

      <CollectionRows collections={rows} />

      {/* Admin-managed slots. Both render nothing when empty. */}
      <HomeBanners />
      <CampaignBanner />

      {/* Brand story block, on the studio sketch — the only other real
          photograph in the repo besides the hero rack shot. */}
      <FeatureBanner
        image="/about-img.webp"
        imageAlt="Pencil sketch of a Shptz Wrld jersey, front and back, on studio paper."
        headline="More than just clothes"
        body="Cut and sewn in Lagos. Sold by the piece, or by the carton."
        ctaLabel="Our story"
        ctaHref="/about"
        tone="light"
      />

      <Newsletter />
    </>
  );
}
