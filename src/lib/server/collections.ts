import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/db";
import {
  STOREFRONT_PRODUCT_STATUSES,
  type CollectionStatus,
} from "@/lib/constants";
import { STOREFRONT_PRODUCT_ORDER, storefrontProductWhere } from "@/lib/server/products";

// Collections are curated lines ("Urban Retro"). A collection's categories are
// never assigned directly — they're derived from the products inside it, so
// adding an Urban Retro hoodie automatically surfaces "Hoodies" under the
// collection. See getCollectionCategories().
//
// Whether a collection reads as COMING SOON is derived the same way: a line
// with no ACTIVE products in it has nothing to sell yet, so the storefront
// labels the line itself rather than leaving a customer to work it out from
// a grid of blurred tiles. See collectionTallies().

/** Live and coming-soon product counts for one collection. */
export type CollectionTally = { active: number; comingSoon: number };

export type WithTally<T> = T & {
  /** Pieces that can be bought today. */
  activeCount: number;
  comingSoonCount: number;
  /** Everything the collection's page will actually render. */
  pieces: number;
  /** Nothing live in it — the line itself is still coming. */
  comingSoon: boolean;
};

const EMPTY_TALLY: CollectionTally = { active: 0, comingSoon: 0 };

/**
 * How many live and how many coming-soon pieces each collection holds.
 *
 * One groupBy for the whole catalogue rather than a filtered `_count` per
 * collection, because `_count` takes a single `where` and two numbers are
 * needed per row: the live tally decides whether the line reads as coming
 * soon at all, and the two together are what its page will show.
 */
export async function collectionTallies(): Promise<Map<string, CollectionTally>> {
  const rows = await prisma.product.groupBy({
    by: ["collectionId", "status"],
    where: storefrontProductWhere(),
    _count: { _all: true },
  });

  const tallies = new Map<string, CollectionTally>();
  for (const row of rows) {
    if (!row.collectionId) continue; // collection-less pieces count for nobody
    const current = tallies.get(row.collectionId) ?? { ...EMPTY_TALLY };
    if (row.status === "ACTIVE") current.active += row._count._all;
    else current.comingSoon += row._count._all;
    tallies.set(row.collectionId, current);
  }
  return tallies;
}

function attachTally<T extends { id: string }>(
  row: T,
  tally: CollectionTally | undefined,
): WithTally<T> {
  const { active, comingSoon } = tally ?? EMPTY_TALLY;
  return {
    ...row,
    activeCount: active,
    comingSoonCount: comingSoon,
    pieces: active + comingSoon,
    // An empty collection counts as coming soon too. From the outside the
    // two are the same thing — a line that is announced but not out — and
    // "00 pieces" was never a useful thing to print on a tile.
    comingSoon: active === 0,
  };
}

/** Shoppable lines first, then the ones still coming. */
function shoppableFirst<T extends { comingSoon: boolean }>(a: T, b: T) {
  return Number(a.comingSoon) - Number(b.comingSoon);
}

export async function listAdminCollections() {
  const [rows, tallies] = await Promise.all([
    prisma.collection.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        _count: { select: { products: true } },
      },
    }),
    collectionTallies(),
  ]);
  // Admin order stays sortOrder — the list is a register, not a storefront.
  // The tallies ride along so the table can show which lines the storefront
  // is currently labelling "coming soon", and why.
  return rows.map((row) => attachTally(row, tallies.get(row.id)));
}

/** Storefront: published collections only. Drafts are admin-visible only. */
export function getActiveCollections() {
  return prisma.collection.findMany({
    where: { status: "ACTIVE" },
    orderBy: { sortOrder: "asc" },
  });
}

export function getCollectionById(id: string) {
  return prisma.collection.findUnique({ where: { id } });
}

// `cache` so the segment layout's existence guard and the page itself share
// a single query per request.
export const getCollectionBySlug = cache((slug: string) => {
  return prisma.collection.findUnique({ where: { slug } });
});

// /collections/[slug] — one page of the collection's storefront products:
// live pieces first, then the ones coming soon. `activeTotal` comes back
// alongside the page because the masthead needs to know whether anything
// in the line can be bought at all, and that cannot be read off a single
// page of twelve.
export async function getCollectionProductsPage(slug: string, page: number, perPage: number) {
  const where = {
    ...storefrontProductWhere(),
    collection: { slug, status: "ACTIVE" },
  };
  const [products, total, activeTotal] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: STOREFRONT_PRODUCT_ORDER,
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        category: true,
        collection: true,
        images: { orderBy: { sortOrder: "asc" } },
        variants: true,
      },
    }),
    prisma.product.count({ where }),
    prisma.product.count({ where: { ...where, status: "ACTIVE" } }),
  ]);
  return { products, total, activeTotal };
}

// Distinct categories represented by the storefront products of a collection,
// in category sortOrder. Drives the category chips shown while browsing
// a collection on /shop.
//
// Coming-soon pieces count here: a collection whose hoodies are all in the
// next wave still has a Hoodies chip, and the chip leads to the blurred
// tiles rather than to a dead end.
export async function getCollectionCategories(collectionSlug: string) {
  return prisma.category.findMany({
    where: {
      products: {
        some: {
          status: { in: [...STOREFRONT_PRODUCT_STATUSES] },
          collection: { slug: collectionSlug },
        },
      },
    },
    orderBy: { sortOrder: "asc" },
  });
}

export type SaveCollectionInput = {
  id?: string;
  slug: string;
  name: string;
  description: string;
  bannerImageUrl: string;
  bannerImageAlt: string;
  cardImageUrl: string;
  cardImageAlt: string;
  featured: boolean;
  sortOrder: number;
  status: CollectionStatus;
};

export function saveCollection(input: SaveCollectionInput) {
  // `imageUrl`/`imageAlt` are deliberately absent: they are the legacy
  // single-image columns, read as a fallback but never written again.
  const data = {
    slug: input.slug,
    name: input.name,
    description: input.description,
    bannerImageUrl: input.bannerImageUrl,
    bannerImageAlt: input.bannerImageAlt,
    cardImageUrl: input.cardImageUrl,
    cardImageAlt: input.cardImageAlt,
    featured: input.featured,
    sortOrder: input.sortOrder,
    status: input.status,
  };
  return input.id
    ? prisma.collection.update({ where: { id: input.id }, data })
    : prisma.collection.create({ data });
}

/**
 * Every published collection, with its live / coming-soon tallies.
 *
 * The homepage needs the whole list, not just the featured slice: the hero
 * and the feature block each resolve a slug against it, and a collection
 * that is not itself featured must still be pickable for those. The
 * featured slice is taken from this in the page.
 *
 * /collections renders straight from this too — the index is a grid of
 * tiles showing a graphic and a count, so it never needed the product rows
 * themselves, only the numbers.
 */
export async function listPublishedCollections() {
  const [rows, tallies] = await Promise.all([
    prisma.collection.findMany({
      where: { status: "ACTIVE" },
      orderBy: { sortOrder: "asc" },
    }),
    collectionTallies(),
  ]);
  // Lines you can buy from lead. `sort` is stable, so sortOrder still
  // decides the order inside each band.
  return rows
    .map((row) => attachTally(row, tallies.get(row.id)))
    .sort(shoppableFirst);
}

export function deleteCollection(id: string) {
  // Product.collectionId is nullable with no cascade, so products in the
  // collection survive and simply become collection-less.
  return prisma.collection.delete({ where: { id } });
}
