/**
 * Where a product image is actually served from.
 *
 * Product rows point at the original archive flats — `/archive/<collection>/
 * <category>/<file>.png` — and those are the source of truth, kept in the
 * repo untouched. What the storefront renders is the derived cut-out:
 * same path, `/archive-cut/…`, `.webp`, with the grey studio background
 * removed (see scripts/cut-archive-art.py).
 *
 * Done as a pure string transform at render time rather than by rewriting
 * ProductImage.url, because the URL in the database is data — it records
 * which artwork file a product is, and rewriting 56 rows to point at a
 * derived asset would lose that and make the pipeline non-repeatable.
 *
 * Anything that isn't an archive path — admin uploads on R2, banner art,
 * the hero — passes straight through.
 */

import { ARCHIVE_FRONTS } from "@/lib/archive-fronts";

const ARCHIVE_PREFIX = "/archive/";
const CUT_PREFIX = "/archive-cut/";
const FRONT_PREFIX = "/archive-front/";

export function productImageUrl(url: string): string {
  if (!url.startsWith(ARCHIVE_PREFIX)) return url;
  return CUT_PREFIX + url.slice(ARCHIVE_PREFIX.length).replace(/\.png$/i, ".webp");
}

/**
 * Which image a product CARD shows.
 *
 * Most archive flats photograph the garment twice — front and back, side by
 * side in one frame. Fitted into a card that pair is letterboxed, so each
 * garment lands at roughly half the size it could be and the grid reads as
 * a line sheet. Where a single-garment front crop exists (see
 * scripts/split-archive-fronts.py) the card uses it instead; the product
 * page keeps the full flat, where seeing front and back at once is the
 * point.
 *
 * Falls back to the full cut-out when no front was produced — a flat with
 * no clean seam is left whole on purpose rather than sliced through a
 * garment.
 */
export function productCardUrl(url: string): string {
  const cut = productImageUrl(url);
  if (!cut.startsWith(CUT_PREFIX)) return cut;
  const rel = cut.slice(CUT_PREFIX.length);
  return ARCHIVE_FRONTS.has(rel) ? FRONT_PREFIX + rel : cut;
}

/** True when an image is a cut-out flat, which needs `contain`, not `cover`. */
export function isArchiveArt(url: string): boolean {
  return (
    url.startsWith(ARCHIVE_PREFIX) ||
    url.startsWith(CUT_PREFIX) ||
    url.startsWith(FRONT_PREFIX)
  );
}

/**
 * The detail crops of each collection's defining graphic, keyed by
 * collection slug. These are the editorial imagery the brand has instead of
 * lookbook photography — the archive's own rule is that a collection IS its
 * chest graphic, so the graphic is what represents it.
 */
export const COLLECTION_CROP: Record<string, string> = {
  "trap-house": "/archive-crop/th-dice.webp",
  "urban-classic": "/archive-crop/uc-script.webp",
  "shptz-wrld": "/archive-crop/sw-seal.webp",
  "fight-or-flight": "/archive-crop/ff-wall.webp",
  "live-laugh-love": "/archive-crop/lll-script.webp",
  "previous-season": "/archive-crop/ps-26.webp",
};

/** Crops used as full-bleed editorial breaks, independent of collection. */
export const FEATURE_CROP = {
  wall: "/archive-crop/ff-wall.webp",
  allover: "/archive-crop/th-allover.webp",
  squiggle: "/archive-crop/ps-squiggle.webp",
  script: "/archive-crop/uc-script.webp",
} as const;

/**
 * Which image a collection shows, for each of the two places it appears.
 *
 * Precedence is the same in both: the image uploaded for that slot, then the
 * legacy single image, then the archive crop of the collection's defining
 * graphic, then nothing. The crop is LAST among the real options rather than
 * ahead of an upload — it is a stand-in for collections that have no
 * photography yet, and it used to sit ahead of the admin's own uploads,
 * which silently swallowed them.
 */
export type CollectionArtSource = {
  slug: string;
  name: string;
  bannerImageUrl?: string | null;
  bannerImageAlt?: string | null;
  cardImageUrl?: string | null;
  cardImageAlt?: string | null;
  imageUrl?: string | null;
  imageAlt?: string | null;
};

export function collectionBanner(c: CollectionArtSource): { url: string; alt: string } | null {
  const url = c.bannerImageUrl || c.imageUrl || COLLECTION_CROP[c.slug] || "";
  if (!url) return null;
  const uploaded = Boolean(c.bannerImageUrl || c.imageUrl);
  return {
    url,
    alt: c.bannerImageAlt || c.imageAlt || (uploaded ? c.name : `${c.name} — defining graphic`),
  };
}

export function collectionCard(c: CollectionArtSource): { url: string; alt: string } | null {
  const url = c.cardImageUrl || c.imageUrl || COLLECTION_CROP[c.slug] || "";
  if (!url) return null;
  const uploaded = Boolean(c.cardImageUrl || c.imageUrl);
  return {
    url,
    alt: c.cardImageAlt || c.imageAlt || (uploaded ? c.name : `${c.name} — defining graphic`),
  };
}
