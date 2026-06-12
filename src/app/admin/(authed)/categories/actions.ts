"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/session";
import { saveCategory, deleteCategory } from "@/lib/server/categories";

// Mirrors TaxonomyFormInitial (description is ignored for categories).
type CategoryFormInput = {
  id?: string;
  slug: string;
  name: string;
  description?: string;
  sortOrder: number;
};

const schema = z.object({
  id: z.string().optional(),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers, and hyphens"),
  name: z.string().min(1).max(200),
  sortOrder: z.number().int(),
});

function revalidateStorefront() {
  revalidatePath("/admin/categories");
  revalidatePath("/shop");
  revalidatePath("/");
}

export async function saveCategoryAction(
  input: CategoryFormInput
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const user = await requireAdmin();
  if (!user) return { ok: false, error: "Unauthorized" };

  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    const saved = await saveCategory(parsed.data);
    revalidateStorefront();
    return { ok: true, id: saved.id };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Save failed";
    if (msg.includes("Unique") && msg.includes("slug")) {
      return { ok: false, error: "Slug already in use by another category." };
    }
    return { ok: false, error: msg };
  }
}

export async function deleteCategoryAction(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await requireAdmin();
  if (!user) return { ok: false, error: "Unauthorized" };

  try {
    await deleteCategory(id);
    revalidateStorefront();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Delete failed" };
  }
}
