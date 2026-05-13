"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/session";
import {
  saveProduct,
  deleteProduct,
  PRODUCT_STATUSES,
  type SaveProductInput,
} from "@/lib/server/products";

const variantSchema = z.object({
  id: z.string().optional(),
  size: z.string().min(1),
  color: z.string().min(1),
  sku: z.string().min(1),
  stock: z.number().int().nonnegative(),
  priceOverrideNGN: z.number().int().nonnegative().nullable(),
});

const imageSchema = z.object({
  id: z.string().optional(),
  url: z.string().url(),
  alt: z.string(),
  sortOrder: z.number().int().nonnegative(),
});

const schema = z.object({
  id: z.string().optional(),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers, and hyphens"),
  name: z.string().min(1).max(200),
  description: z.string(),
  priceNGN: z.number().int().nonnegative(),
  status: z.enum(PRODUCT_STATUSES),
  categoryId: z.string().nullable(),
  variants: z.array(variantSchema).min(1),
  images: z.array(imageSchema),
});

export async function saveProductAction(
  input: SaveProductInput
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const user = await requireAdmin();
  if (!user) return { ok: false, error: "Unauthorized" };

  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    const saved = await saveProduct(parsed.data);
    revalidatePath("/admin/products");
    revalidatePath("/shop");
    revalidatePath(`/shop/${parsed.data.slug}`);
    return { ok: true, id: saved!.id };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Save failed";
    if (msg.includes("Unique") && msg.includes("slug")) {
      return { ok: false, error: "Slug already in use by another product." };
    }
    if (msg.includes("Unique") && msg.includes("sku")) {
      return { ok: false, error: "SKU already in use by another variant." };
    }
    return { ok: false, error: msg };
  }
}

export async function deleteProductAction(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await requireAdmin();
  if (!user) return { ok: false, error: "Unauthorized" };

  try {
    await deleteProduct(id);
    revalidatePath("/admin/products");
    revalidatePath("/shop");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Delete failed" };
  }
}
