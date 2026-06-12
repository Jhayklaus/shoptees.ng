"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/session";
import { saveCollection, deleteCollection } from "@/lib/server/collections";

// Mirrors TaxonomyFormInitial — optional fields may be omitted by the form.
type CollectionFormInput = {
  id?: string;
  slug: string;
  name: string;
  description?: string;
  imageUrl?: string;
  imageAlt?: string;
  sortOrder: number;
};

const schema = z.object({
  id: z.string().optional(),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers, and hyphens"),
  name: z.string().min(1).max(200),
  description: z.string().default(""),
  imageUrl: z.string().default(""),
  imageAlt: z.string().default(""),
  sortOrder: z.number().int(),
});

function revalidateStorefront() {
  revalidatePath("/admin/collections");
  revalidatePath("/shop");
  revalidatePath("/collections");
  revalidatePath("/");
}

export async function saveCollectionAction(
  input: CollectionFormInput
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const user = await requireAdmin();
  if (!user) return { ok: false, error: "Unauthorized" };

  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    const saved = await saveCollection(parsed.data);
    revalidateStorefront();
    return { ok: true, id: saved.id };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Save failed";
    if (msg.includes("Unique") && msg.includes("slug")) {
      return { ok: false, error: "Slug already in use by another collection." };
    }
    return { ok: false, error: msg };
  }
}

export async function deleteCollectionAction(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await requireAdmin();
  if (!user) return { ok: false, error: "Unauthorized" };

  try {
    await deleteCollection(id);
    revalidateStorefront();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Delete failed" };
  }
}
