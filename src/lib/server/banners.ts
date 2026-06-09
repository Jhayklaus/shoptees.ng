import "server-only";
import { prisma } from "@/lib/db";
import type { SaveBannerInput } from "@/lib/banners-shared";

export { BANNER_LAYOUTS, type BannerLayout, type SaveBannerInput } from "@/lib/banners-shared";

// Storefront: every enabled banner, in display order.
export function listEnabledBanners() {
  return prisma.homeBanner.findMany({
    where: { enabled: true },
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
    enabled: input.enabled,
    sortOrder: input.sortOrder,
    eyebrow: input.eyebrow,
    title: input.title,
    body: input.body,
    ctaLabel: input.ctaLabel,
    ctaHref: input.ctaHref,
    imageUrl: input.imageUrl,
    imageAlt: input.imageAlt,
    layout: input.layout,
  };

  if (input.id) {
    return prisma.homeBanner.update({ where: { id: input.id }, data });
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
