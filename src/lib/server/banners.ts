import "server-only";
import { prisma } from "@/lib/db";
import { isSingletonSlot, type SaveBannerInput } from "@/lib/banners-shared";

export {
  BANNER_LAYOUTS,
  BANNER_SLOTS,
  SINGLETON_SLOTS,
  SLOT_LABEL,
  isSingletonSlot,
  toBannerSlot,
  type BannerLayout,
  type BannerSlot,
  type SaveBannerInput,
} from "@/lib/banners-shared";

// Storefront: enabled hero banner (slot = "hero"), or null.
export function getHeroBanner() {
  return prisma.homeBanner.findFirst({
    where: { slot: "hero", enabled: true },
    orderBy: { sortOrder: "asc" },
  });
}

/**
 * Storefront: the mid-page feature banner row, or null when none exists.
 *
 * Deliberately NOT filtered on `enabled`, unlike the hero. This section had
 * hard-coded content before the slot existed, and the homepage still falls
 * back to it when nothing has been configured — so "switched off" and "never
 * set up" have to be distinguishable. Filtering here collapses them into the
 * same null and makes disabling the banner resurrect the coded default, which
 * is the opposite of what the toggle says it does.
 *
 * The caller checks `.enabled`.
 */
export function getFeatureBanner() {
  return prisma.homeBanner.findFirst({
    where: { slot: "feature" },
    orderBy: { sortOrder: "asc" },
  });
}

// Storefront: every enabled banner in the ordered stack. Singleton slots
// (hero, feature) are excluded — they have their own getters above.
export function listEnabledBanners() {
  return prisma.homeBanner.findMany({
    where: { slot: "banner", enabled: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}

// Admin: all banners regardless of state.
export function listAllBanners() {
  return prisma.homeBanner.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}

export function getBanner(id: string) {
  return prisma.homeBanner.findUnique({ where: { id } });
}

export async function saveBanner(input: SaveBannerInput) {
  const data = {
    slot: input.slot ?? "banner",
    enabled: input.enabled,
    sortOrder: input.sortOrder,
    eyebrow: input.eyebrow,
    title: input.title,
    body: input.body,
    cycleWords: input.cycleWords,
    caption: input.caption,
    ctaLabel: input.ctaLabel,
    ctaHref: input.ctaHref,
    imageUrl: input.imageUrl,
    imageAlt: input.imageAlt,
    layout: input.layout,
  };

  if (input.id) {
    return prisma.homeBanner.update({ where: { id: input.id }, data });
  }

  // A singleton slot must never end up with two rows: the storefront reads it
  // with findFirst, so a duplicate would silently shadow the one being edited
  // and the admin would have no way to tell which is live. Creating one when
  // it already exists edits the existing row instead.
  if (isSingletonSlot(data.slot)) {
    const existing = await prisma.homeBanner.findFirst({ where: { slot: data.slot } });
    if (existing) {
      return prisma.homeBanner.update({ where: { id: existing.id }, data });
    }
  }

  return prisma.homeBanner.create({ data });
}

export function deleteBanner(id: string) {
  return prisma.homeBanner.delete({ where: { id } });
}

// Persist a new display order. `ids` is the full list of banner ids in the
// desired order; each row's sortOrder is set to its index.
export async function reorderBanners(ids: string[]) {
  await prisma.$transaction(
    ids.map((id, index) =>
      prisma.homeBanner.update({ where: { id }, data: { sortOrder: index } }),
    ),
  );
}
