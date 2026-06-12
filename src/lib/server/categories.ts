import "server-only";
import { prisma } from "@/lib/db";

// Categories are product types (jerseys, hoodies, pants…). They're global:
// the same category can show up inside any collection via its products.

export function listAdminCategories() {
  return prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { products: true } },
    },
  });
}

export function getCategoryById(id: string) {
  return prisma.category.findUnique({ where: { id } });
}

export type SaveCategoryInput = {
  id?: string;
  slug: string;
  name: string;
  sortOrder: number;
};

export function saveCategory(input: SaveCategoryInput) {
  const data = {
    slug: input.slug,
    name: input.name,
    sortOrder: input.sortOrder,
  };
  return input.id
    ? prisma.category.update({ where: { id: input.id }, data })
    : prisma.category.create({ data });
}

export function deleteCategory(id: string) {
  // Product.categoryId is nullable, so products keep existing uncategorised.
  return prisma.category.delete({ where: { id } });
}
