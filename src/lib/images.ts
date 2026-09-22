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

const ARCHIVE_PREFIX = "/archive/";
const CUT_PREFIX = "/archive-cut/";

export function productImageUrl(url: string): string {
  if (!url.startsWith(ARCHIVE_PREFIX)) return url;
  return CUT_PREFIX + url.slice(ARCHIVE_PREFIX.length).replace(/\.png$/i, ".webp");
}

/** True when an image is a cut-out flat, which needs `contain`, not `cover`. */
export function isArchiveArt(url: string): boolean {
  return url.startsWith(ARCHIVE_PREFIX) || url.startsWith(CUT_PREFIX);
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
