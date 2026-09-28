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
import { listPublishedCollections } from "@/lib/server/collections";
import { collectionBanner, collectionCard, FEATURE_CROP } from "@/lib/images";

// Homepage content (hero banner, campaign banners, settings) is admin-managed
// in the DB, so render per-request instead of freezing it at build time.
export const dynamic = "force-dynamic";

/**
 * Shown when no `feature`-slot banner row exists AND no collection is picked
 * for the feature block.
 *
 * This section was hard-coded before either existed, so a deploy that
 * predates them has neither — falling back keeps those homepages intact
 * rather than opening a hole mid-page.
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
  const [s, heroBanner, featureBanner, collections] = await Promise.all([
    getAllSettings(),
    getHeroBanner(),
    getFeatureBanner(),
    // EVERY published collection, not just the featured ones: the hero and
    // the feature block each resolve a slug against this list, and a
    // collection that is not in the featured row must still be pickable for
    // them. The featured row takes its three from this further down.
    listPublishedCollections(),
  ]);

  const bySlug = (slug: string) => collections.find((c) => c.slug === slug.trim());

  // ── Hero ───────────────────────────────────────────────────────────
  // Admin picks the collection with `hero.collection`; anything missing or
  // unpublished falls back to the first published collection, so the hero is
  // never empty and never links somewhere a customer cannot open.
  const featured = bySlug(s["hero.collection"]) ?? collections[0];

  // Image precedence, and the order here is the whole point:
  //   1. a hero-slot banner row's own image
  //   2. the setting's image — an explicit upload, so it outranks artwork
  //      derived from the collection
  //   3. the collection's banner image, or the archive crop of its defining
  //      graphic when it has none
  //
  // The setting used to sit LAST, behind the archive crop. Since a crop
  // exists for every seeded collection, an image uploaded under Settings →
  // Hero image could never win, and the upload silently did nothing.
  const heroArt = featured ? collectionBanner(featured) : null;
  const hero: HeroContent | null = featured
    ? {
        slug: featured.slug,
        name: featured.name,
        pieces: featured._count.products,
        eyebrow: heroBanner?.eyebrow || s["hero.eyebrow"] || "Featured collection",
        headline: heroBanner?.title || s["hero.headline"] || featured.name,
        body: heroBanner?.body || s["hero.body"] || featured.description,
        ctaLabel: heroBanner?.ctaLabel || s["hero.cta_label"] || `Shop ${featured.name}`,
        imageUrl: heroBanner?.imageUrl || s["hero.image_url"] || heroArt?.url || "",
        imageAlt:
          heroBanner?.imageAlt ||
          (heroBanner?.imageUrl ? "" : s["hero.image_url"] ? s["hero.image_alt"] : "") ||
          heroArt?.alt ||
          featured.name,
        caption: heroBanner?.caption || s["hero.caption"],
      }
    : null;

  // ── Feature block ──────────────────────────────────────────────────
  // Three ways to fill it, most specific first:
  //   1. a `feature`-slot banner row — free-form art and copy
  //   2. a collection picked with `feature.collection` — uses that
  //      collection's banner image and its own name and description, so
  //      editing the collection updates the homepage
  //   3. the coded default, only when neither is set
  // A row that exists but is switched off renders nothing: "off" and "never
  // configured" are different states and the toggle has to mean what it says.
  const featureCollection = bySlug(s["feature.collection"]);
  const featureArt = featureCollection ? collectionBanner(featureCollection) : null;
  const feature =
    featureBanner && !featureBanner.enabled
      ? null
      : featureBanner
        ? {
            image: featureBanner.imageUrl || FEATURE_DEFAULT.image,
            imageAlt:
              featureBanner.imageAlt ||
              (featureBanner.imageUrl ? featureBanner.title : FEATURE_DEFAULT.imageAlt),
            eyebrow: featureBanner.eyebrow || undefined,
            headline: featureBanner.title,
            body: featureBanner.body || undefined,
            ctaLabel: featureBanner.ctaLabel || undefined,
            ctaHref: featureBanner.ctaHref || "/collections",
            align:
              featureBanner.layout === "imageRight" ? ("right" as const) : ("left" as const),
          }
        : featureCollection && featureArt
          ? {
              image: featureArt.url,
              imageAlt: featureArt.alt,
              eyebrow: "Featured collection",
              headline: featureCollection.name,
              body: featureCollection.description || undefined,
              ctaLabel: `Shop ${featureCollection.name}`,
              ctaHref: `/collections/${featureCollection.slug}`,
              align: "left" as const,
            }
          : FEATURE_DEFAULT;

  // ── Featured collections row ───────────────────────────────────────
  // Three, hand-picked with the `featured` flag and falling back to the
  // first three by sort order.
  const picked = collections.filter((c) => c.featured);
  const rows = (picked.length > 0 ? picked : collections).slice(0, 3).map((c) => {
    const art = collectionCard(c);
    return {
      id: c.id,
      slug: c.slug,
      name: c.name,
      description: c.description,
      imageUrl: art?.url ?? null,
      imageAlt: art?.alt ?? "",
      count: c._count.products,
    };
  });

  return (
    <>
      {hero && <Hero content={hero} />}
      <CategoryTiles />
      <FeaturedGrid />

      {/* Editorial banner. The serif display voice appears here and in the
          hero, and nowhere else — both sit on a photograph, which is what
          earns the size. */}
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


      <Newsletter />
      <CampaignBanner />

      {/* The banner stack closes the page, between the newsletter and the
          footer. Renders nothing when no banner is enabled. */}
      <HomeBanners />
    </>
  );
}
