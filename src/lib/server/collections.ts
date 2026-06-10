import "server-only";
import { prisma } from "@/lib/db";

// Collections are curated lines ("Urban Retro"). A collection's categories are
// never assigned directly — they're derived from the products inside it, so
// adding an Urban Retro hoodie automatically surfaces "Hoodies" under the
// collection. See getCollectionCategories().

export function listAdminCollections() {
  return prisma.collection.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { products: true } },
    },
  });
}

export function getActiveCollections() {
  return prisma.collection.findMany({ orderBy: { sortOrder: "asc" } });
}

export function getCollectionById(id: string) {
  return prisma.collection.findUnique({ where: { id } });
}

export function getCollectionBySlug(slug: string) {
  return prisma.collection.findUnique({ where: { slug } });
}

// /collections index — every collection with a short rail of its newest
// active products (carousel under each banner) plus the full count.
export function listCollectionsWithProducts(perCollection = 10) {
  return prisma.collection.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      products: {
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
        take: perCollection,
        include: {
          category: true,
          collection: true,
          images: { orderBy: { sortOrder: "asc" } },
          variants: true,
        },
      },
      _count: { select: { products: { where: { status: "ACTIVE" } } } },
    },
  });
}

// /collections/[slug] — one page of the collection's active products.
export async function getCollectionProductsPage(slug: string, page: number, perPage: number) {
  const where = { status: "ACTIVE", collection: { slug } };
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
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
  ]);
  return { products, total };
}

// Distinct categories represented by the ACTIVE products of a collection,
// in category sortOrder. Drives the category chips shown while browsing
// a collection on /shop.
export async function getCollectionCategories(collectionSlug: string) {
  return prisma.category.findMany({
    where: {
      products: {
        some: { status: "ACTIVE", collection: { slug: collectionSlug } },
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
  imageUrl: string;
  imageAlt: string;
  sortOrder: number;
};

export function saveCollection(input: SaveCollectionInput) {
  const data = {
    slug: input.slug,
    name: input.name,
    description: input.description,
    imageUrl: input.imageUrl,
    imageAlt: input.imageAlt,
    sortOrder: input.sortOrder,
  };
  return input.id
    ? prisma.collection.update({ where: { id: input.id }, data })
    : prisma.collection.create({ data });
}

export function deleteCollection(id: string) {
  // Product.collectionId is nullable with no cascade, so products in the
  // collection survive and simply become collection-less.
  return prisma.collection.delete({ where: { id } });
}
