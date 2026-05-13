import "server-only";
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
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      variants: true,
      _count: { select: { orderItems: true } },
    },
  });
}

export function listActiveProducts() {
  return prisma.product.findMany({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
      variants: true,
    },
  });
}

export function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
      variants: { orderBy: { size: "asc" } },
    },
  });
}

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

export async function saveProduct(input: SaveProductInput) {
  const data: Prisma.ProductUncheckedCreateInput = {
    slug: input.slug,
    name: input.name,
    description: input.description,
    priceNGN: input.priceNGN,
    status: input.status,
    categoryId: input.categoryId,
  };

  return prisma.$transaction(async (tx) => {
    let productId = input.id;

    if (productId) {
      await tx.product.update({ where: { id: productId }, data });
    } else {
      const created = await tx.product.create({ data });
      productId = created.id;
    }

    // Variants — replace strategy: delete missing, upsert provided.
    const existingVariants = await tx.variant.findMany({ where: { productId } });
    const incomingIds = new Set(input.variants.map((v) => v.id).filter(Boolean) as string[]);
    const toDelete = existingVariants.filter((v) => !incomingIds.has(v.id));
    if (toDelete.length) {
      await tx.variant.deleteMany({ where: { id: { in: toDelete.map((v) => v.id) } } });
    }
    for (const v of input.variants) {
      if (v.id) {
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
      } else {
        await tx.variant.create({
          data: {
            productId,
            size: v.size,
            color: v.color,
            sku: v.sku,
            stock: v.stock,
            priceOverrideNGN: v.priceOverrideNGN,
          },
        });
      }
    }

    // Images — same replace strategy.
    const existingImages = await tx.productImage.findMany({ where: { productId } });
    const incomingImageIds = new Set(input.images.map((i) => i.id).filter(Boolean) as string[]);
    const imagesToDelete = existingImages.filter((i) => !incomingImageIds.has(i.id));
    if (imagesToDelete.length) {
      await tx.productImage.deleteMany({ where: { id: { in: imagesToDelete.map((i) => i.id) } } });
    }
    for (let i = 0; i < input.images.length; i++) {
      const img = input.images[i];
      if (img.id) {
        await tx.productImage.update({
          where: { id: img.id },
          data: { url: img.url, alt: img.alt, sortOrder: i },
        });
      } else {
        await tx.productImage.create({
          data: { productId, url: img.url, alt: img.alt, sortOrder: i },
        });
      }
    }

    return tx.product.findUnique({
      where: { id: productId },
      include: { variants: true, images: { orderBy: { sortOrder: "asc" } } },
    });
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
