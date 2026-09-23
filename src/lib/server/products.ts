import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { PRODUCT_STATUSES, type ProductStatus } from "@/lib/constants";
import type { DisplayProduct } from "@/types";

export { PRODUCT_STATUSES, type ProductStatus };

// Prisma row → storefront DisplayProduct shape.
type WithRelations = {
  id: string;
  slug: string;
  name: string;
  description: string;
  priceNGN: number;
  category: { slug: string; name: string } | null;
  collection: { slug: string; name: string } | null;
  images: { url: string; alt: string }[];
  variants: {
    id: string;
    size: string;
    color: string;
    sku: string;
    stock: number;
    priceOverrideNGN: number | null;
  }[];
};

export function toDisplayProduct(p: WithRelations): DisplayProduct {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    priceNGN: p.priceNGN,
    category: p.category ? { slug: p.category.slug, name: p.category.name } : null,
    collection: p.collection ? { slug: p.collection.slug, name: p.collection.name } : null,
    images: p.images.map((i) => ({ url: i.url, alt: i.alt })),
    variants: p.variants.map((v) => ({
      id: v.id,
      size: v.size,
      color: v.color,
      sku: v.sku,
      stock: v.stock,
      priceOverrideNGN: v.priceOverrideNGN,
    })),
  };
}

export function listAdminProducts() {
  return prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      collection: true,
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      variants: true,
      _count: { select: { orderItems: true } },
    },
  });
}

export function listActiveProducts(opts?: { categorySlug?: string; collectionSlug?: string }) {
  const where: Prisma.ProductWhereInput = { status: "ACTIVE" };
  if (opts?.categorySlug) where.category = { slug: opts.categorySlug };
  if (opts?.collectionSlug) where.collection = { slug: opts.collectionSlug };
  return prisma.product.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      collection: true,
      images: { orderBy: { sortOrder: "asc" } },
      variants: true,
    },
  });
}

// `cache` so the segment layout's existence guard and the page itself share
// a single query per request.
export const getProductBySlug = cache((slug: string) => {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      collection: true,
      images: { orderBy: { sortOrder: "asc" } },
      variants: { orderBy: { size: "asc" } },
    },
  });
});

export function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: { orderBy: { createdAt: "asc" } },
    },
  });
}

export async function getActiveCategories() {
  return prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
}

export type SaveProductInput = {
  id?: string;
  slug: string;
  name: string;
  description: string;
  priceNGN: number;
  status: ProductStatus;
  categoryId: string | null;
  collectionId: string | null;
  variants: {
    id?: string;
    size: string;
    color: string;
    sku: string;
    stock: number;
    priceOverrideNGN: number | null;
  }[];
  images: {
    id?: string;
    url: string;
    alt: string;
    sortOrder: number;
  }[];
};

/**
 * Create or update a product with its variants and images.
 *
 * Kept in one interactive transaction so a half-written product can never be
 * published, but the shape matters: an interactive transaction holds a
 * connection open for its whole body, and every statement inside it is a
 * round trip to a Postgres that is not in this datacentre. The first version
 * of this issued one INSERT per variant and one per image, sequentially, and
 * re-read the product with two joins before committing. A product with a few
 * variants and half a dozen photos ran to a dozen-odd round trips, which on a
 * pooled remote connection is seconds — past Prisma's 5s default, at which
 * point the transaction is rolled back and the next statement fails with
 * "Transaction not found ... refers to an old closed transaction". It
 * surfaced on the last loop, productImage.create, because that is simply the
 * furthest point reached before the clock ran out.
 *
 * So: new rows go in with one createMany each, the final read moved out past
 * the commit, and the budget raised well clear of what the work now needs.
 */
export async function saveProduct(input: SaveProductInput) {
  const data: Prisma.ProductUncheckedCreateInput = {
    slug: input.slug,
    name: input.name,
    description: input.description,
    priceNGN: input.priceNGN,
    status: input.status,
    categoryId: input.categoryId,
    collectionId: input.collectionId,
  };

  const productId = await prisma.$transaction(
    async (tx) => {
      let productId = input.id;

      if (productId) {
        await tx.product.update({ where: { id: productId }, data });
      } else {
        const created = await tx.product.create({ data });
        productId = created.id;
      }

      // Variants — replace strategy: delete missing, update provided, insert new.
      const existingVariants = await tx.variant.findMany({
        where: { productId },
        select: { id: true },
      });
      const incomingIds = new Set(input.variants.map((v) => v.id).filter(Boolean) as string[]);
      const toDelete = existingVariants.filter((v) => !incomingIds.has(v.id));
      if (toDelete.length) {
        await tx.variant.deleteMany({ where: { id: { in: toDelete.map((v) => v.id) } } });
      }

      // Updates carry different data per row, so they stay one statement each.
      for (const v of input.variants) {
        if (!v.id) continue;
        await tx.variant.update({
          where: { id: v.id },
          data: {
            size: v.size,
            color: v.color,
            sku: v.sku,
            stock: v.stock,
            priceOverrideNGN: v.priceOverrideNGN,
          },
        });
      }

      // New ones are all the same shape, so they go in together.
      const newVariants = input.variants.filter((v) => !v.id);
      if (newVariants.length) {
        await tx.variant.createMany({
          data: newVariants.map((v) => ({
            productId: productId!,
            size: v.size,
            color: v.color,
            sku: v.sku,
            stock: v.stock,
            priceOverrideNGN: v.priceOverrideNGN,
          })),
        });
      }

      // Images — same replace strategy. sortOrder is the position in the
      // submitted list, not the submitted sortOrder, so dragging to reorder
      // is what decides it.
      const existingImages = await tx.productImage.findMany({
        where: { productId },
        select: { id: true },
      });
      const incomingImageIds = new Set(input.images.map((i) => i.id).filter(Boolean) as string[]);
      const imagesToDelete = existingImages.filter((i) => !incomingImageIds.has(i.id));
      if (imagesToDelete.length) {
        await tx.productImage.deleteMany({
          where: { id: { in: imagesToDelete.map((i) => i.id) } },
        });
      }

      for (let i = 0; i < input.images.length; i++) {
        const img = input.images[i];
        if (!img.id) continue;
        await tx.productImage.update({
          where: { id: img.id },
          data: { url: img.url, alt: img.alt, sortOrder: i },
        });
      }

      const newImages = input.images
        .map((img, i) => ({ img, i }))
        .filter(({ img }) => !img.id);
      if (newImages.length) {
        await tx.productImage.createMany({
          data: newImages.map(({ img, i }) => ({
            productId: productId!,
            url: img.url,
            alt: img.alt,
            sortOrder: i,
          })),
        });
      }

      return productId!;
    },
    {
      // Generous, because the cost of stopping early is a product the admin
      // believes they saved. The work inside is now a handful of statements,
      // so this is headroom for a slow link, not an expected duration.
      maxWait: 15_000,
      timeout: 30_000,
    },
  );

  // Read back after the commit rather than inside it. The caller wants the
  // saved product, but fetching it with two joins while still holding the
  // transaction open added a round trip to the part of the request that is
  // actually under a deadline.
  return prisma.product.findUnique({
    where: { id: productId },
    include: { variants: true, images: { orderBy: { sortOrder: "asc" } } },
  });
}

export async function deleteProduct(id: string) {
  // Variants + images cascade. OrderItems are nullable on productId, so historical
  // orders survive deletion (snapshot fields preserve the line item display).
  return prisma.product.delete({ where: { id } });
}

export async function totalStockForProduct(productId: string) {
  const r = await prisma.variant.aggregate({
    where: { productId },
    _sum: { stock: true },
  });
  return r._sum.stock ?? 0;
}
