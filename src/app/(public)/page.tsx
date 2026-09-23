import { Hero, type HeroContent } from "@/components/marketing/Hero";
import { CategoryTiles } from "@/components/marketing/CategoryTiles";
import { FeaturedGrid } from "@/components/marketing/FeaturedGrid";
import { FeatureBanner } from "@/components/marketing/FeatureBanner";
import { CollectionRows } from "@/components/marketing/CollectionRows";
import { CampaignBanner } from "@/components/marketing/CampaignBanner";
import { HomeBanners } from "@/components/marketing/HomeBanners";
import { Newsletter } from "@/components/marketing/Newsletter";
import { getAllSettings } from "@/lib/server/settings";
import { getHeroBanner, getFeatureBanner } from "@/lib/server/banners";
import { listCollectionsWithProducts } from "@/lib/server/collections";
import { FEATURE_CROP, COLLECTION_CROP } from "@/lib/images";

// Homepage content (hero banner, campaign banners, settings) is admin-managed
// in the DB, so render per-request instead of freezing it at build time.
export const dynamic = "force-dynamic";

/**
 * Shown when no `feature`-slot banner row exists at all.
 *
 * This section was hard-coded until the slot existed, so every deploy that
 * predates it has no row — falling back keeps those homepages intact rather
 * than opening a hole mid-page. An editor who wants the section gone sets the
 * row up and switches it off.
 */
const FEATURE_DEFAULT = {
  image: FEATURE_CROP.allover,
  imageAlt: "Flaming-dice Trap House mark repeated across an all-over knit.",
  eyebrow: "Featured collection",
  headline: "One mark, every scale",
  body: "Trap House runs headwear, socks and bottoms — the same flaming die applied from a sock cuff to an all-over beanie repeat.",
  ctaLabel: "Explore collection",
  ctaHref: "/collections/trap-house",
  align: "left" as const,
};

export default async function HomePage() {
  // `take: 1` because only the counts are wanted here — the rows render a
  // graphic crop, not a product rail — but reusing the existing query keeps
  // this page out of the data layer.
  const [s, heroBanner, featureBanner, collections] = await Promise.all([
    getAllSettings(),
    getHeroBanner(),
    getFeatureBanner(),
    listCollectionsWithProducts(1),
  ]);

  // ── Featured collection ────────────────────────────────────────────
  // The hero advertises one collection. Admin picks it with
  // `hero.collection`; anything missing or unpublished falls back to the
  // first active collection in the archive's own order, so the hero is
  // never empty and never links somewhere a customer cannot open.
  const featured =
    collections.find((c) => c.slug === s["hero.collection"].trim()) ?? collections[0];

  // Copy keys are overrides. Blank means "use the collection's own", which
  // keeps the homepage correct when a collection is edited in admin without
  // needing a second edit here. A hero-slot banner still wins over both.
  const hero: HeroContent | null = featured
    ? {
        slug: featured.slug,
        name: featured.name,
        pieces: featured._count.products,
        eyebrow: heroBanner?.eyebrow || s["hero.eyebrow"] || "Featured collection",
        headline: heroBanner?.title || s["hero.headline"] || featured.name,
        body: heroBanner?.body || s["hero.body"] || featured.description,
        ctaLabel: heroBanner?.ctaLabel || s["hero.cta_label"] || `Shop ${featured.name}`,
        imageUrl:
          heroBanner?.imageUrl ||
          featured.imageUrl ||
          COLLECTION_CROP[featured.slug] ||
          s["hero.image_url"],
        imageAlt:
          heroBanner?.imageAlt || featured.imageAlt || `${featured.name} — ${featured.description}`,
        caption: heroBanner?.caption || s["hero.caption"],
      }
    : null;

  // ── Feature banner ─────────────────────────────────────────────────
  // Three distinct states, and the middle one is easy to lose:
  //   row enabled  → render it
  //   row disabled → render nothing (the editor switched the section off)
  //   no row       → render the coded default, because this section was
  //                  hard-coded before the slot existed and a site that has
  //                  never been edited should not lose it
  // This is why getFeatureBanner does not filter on `enabled` itself.
  const feature = !featureBanner
    ? FEATURE_DEFAULT
    : !featureBanner.enabled
    ? null
    : {
        // A row saved without an image would blow up next/image, so the
        // coded artwork stands in until one is uploaded.
        image: featureBanner.imageUrl || FEATURE_DEFAULT.image,
        imageAlt:
          featureBanner.imageAlt ||
          (featureBanner.imageUrl ? featureBanner.title : FEATURE_DEFAULT.imageAlt),
        eyebrow: featureBanner.eyebrow || undefined,
        headline: featureBanner.title,
        body: featureBanner.body || undefined,
        ctaLabel: featureBanner.ctaLabel || undefined,
        ctaHref: featureBanner.ctaHref || "/collections",
        align: featureBanner.layout === "imageRight" ? ("right" as const) : ("left" as const),
      };

  const rows = collections.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    imageUrl: c.imageUrl || null,
    count: c._count.products,
  }));

  return (
    <>
      {hero && <Hero content={hero} />}
      <CategoryTiles />
      <FeaturedGrid />

      {/* Editorial banner. The serif display voice appears here and in the
          hero, and nowhere else — both sit on a photograph, which is what
          earns the size.

          Admin-managed via the `feature` banner slot. With no row set it
          falls back to the coded default below, so the section is never
          simply missing on a site that has not been edited yet; switching
          the row off in admin is what removes it. */}
      {feature && (
        <FeatureBanner
          image={feature.image}
          imageAlt={feature.imageAlt}
          eyebrow={feature.eyebrow}
          headline={feature.headline}
          body={feature.body}
          ctaLabel={feature.ctaLabel}
          ctaHref={feature.ctaHref}
          align={feature.align}
        />
      )}

      <CollectionRows collections={rows} />

      <CampaignBanner />

      <Newsletter />

      {/* The banner stack closes the page, between the newsletter and the
          footer. Renders nothing when no banner is enabled. */}
      <HomeBanners />
    </>
  );
}
