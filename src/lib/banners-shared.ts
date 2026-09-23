// Shared banner constants/types — safe to import from both client and server.
// Keep this free of "server-only" and any DB imports.

export const BANNER_LAYOUTS = ["imageLeft", "imageRight"] as const;
export type BannerLayout = (typeof BANNER_LAYOUTS)[number];

/**
 * Which homepage slot a row fills.
 *
 * `hero` and `feature` are singletons — one row each, never deleted, never
 * reordered. `banner` is the stack, which is ordered and unbounded.
 *
 * `feature` is the mid-page editorial block. It was hard-coded until now, so
 * a row may well not exist; the homepage falls back to the coded default in
 * that case rather than dropping a section out of the layout.
 */
export const BANNER_SLOTS = ["hero", "feature", "banner"] as const;
export type BannerSlot = (typeof BANNER_SLOTS)[number];

/** Slots that allow at most one row, and so cannot be created or deleted freely. */
export const SINGLETON_SLOTS: readonly BannerSlot[] = ["hero", "feature"];

export function isSingletonSlot(slot: string): boolean {
  return (SINGLETON_SLOTS as readonly string[]).includes(slot);
}

/** Narrows an arbitrary DB string to a known slot, defaulting to the stack. */
export function toBannerSlot(slot: string): BannerSlot {
  return (BANNER_SLOTS as readonly string[]).includes(slot) ? (slot as BannerSlot) : "banner";
}

export const SLOT_LABEL: Record<BannerSlot, string> = {
  hero: "Hero banner",
  feature: "Feature banner",
  banner: "Banner",
};

export type SaveBannerInput = {
  id?: string;
  slot?: BannerSlot;
  enabled: boolean;
  sortOrder: number;
  eyebrow: string;
  title: string;
  body: string;
  cycleWords: string;
  caption: string;
  ctaLabel: string;
  ctaHref: string;
  imageUrl: string;
  imageAlt: string;
  layout: BannerLayout;
};
