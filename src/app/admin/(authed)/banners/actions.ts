"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/session";
import {
  saveBanner,
  deleteBanner,
  reorderBanners,
  BANNER_LAYOUTS,
  type SaveBannerInput,
} from "@/lib/server/banners";

const schema = z.object({
  id: z.string().optional(),
  slot: z.enum(["hero", "banner"]).optional(),
  enabled: z.boolean(),
  sortOrder: z.number().int(),
  eyebrow: z.string().max(200),
  title: z.string().min(1, "Headline is required").max(300),
  body: z.string().max(2000),
  cycleWords: z.string().max(500),
  caption: z.string().max(300),
  ctaLabel: z.string().max(120),
  ctaHref: z.string().max(500),
  imageUrl: z.string().max(1000),
  imageAlt: z.string().max(300),
  layout: z.enum(BANNER_LAYOUTS),
});

export async function saveBannerAction(
  input: SaveBannerInput
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const user = await requireAdmin();
  if (!user) return { ok: false, error: "Unauthorized" };

  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    const saved = await saveBanner(parsed.data);
    revalidatePath("/admin/banners");
    revalidatePath("/", "layout");
    return { ok: true, id: saved.id };
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : "Save failed" };
  }
}

export async function reorderBannersAction(
  ids: string[]
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await requireAdmin();
  if (!user) return { ok: false, error: "Unauthorized" };

  const parsed = z.array(z.string().min(1)).safeParse(ids);
  if (!parsed.success) return { ok: false, error: "Invalid input" };

  try {
    await reorderBanners(parsed.data);
    revalidatePath("/admin/banners");
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : "Reorder failed" };
  }
}

export async function deleteBannerAction(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await requireAdmin();
  if (!user) return { ok: false, error: "Unauthorized" };

  try {
    await deleteBanner(id);
    revalidatePath("/admin/banners");
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : "Delete failed" };
  }
}
