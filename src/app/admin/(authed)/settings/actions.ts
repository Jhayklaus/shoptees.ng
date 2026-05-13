"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/session";
import { setSetting } from "@/lib/server/settings";

// Whitelist of admin-editable settings. order.counter / order.year are
// system-managed and must NEVER be touched from this action.
const allowedKeys = [
  "site.name",
  "site.tagline",
  "contact.email",
  "contact.phone",
  "banner.enabled",
  "banner.eyebrow",
  "banner.title",
  "banner.body",
  "banner.cta_label",
  "banner.cta_href",
  "banner.image_url",
  "banner.image_alt",
] as const;
type AllowedKey = (typeof allowedKeys)[number];

const valueSchema = z.string().max(2000);

export async function saveSettingsAction(
  values: Record<string, string>
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await requireAdmin();
  if (!user) return { ok: false, error: "Unauthorized" };

  // Defense-in-depth: drop any key not on the whitelist before validating.
  const filtered: Partial<Record<AllowedKey, string>> = {};
  for (const key of allowedKeys) {
    const v = values[key];
    if (typeof v === "string") filtered[key] = v;
  }

  const parsed = z.record(z.enum(allowedKeys), valueSchema).safeParse(filtered);
  if (!parsed.success) return { ok: false, error: "Invalid input" };

  for (const [key, value] of Object.entries(parsed.data)) {
    await setSetting(key, value as string);
  }
  revalidatePath("/", "layout");
  return { ok: true };
}
