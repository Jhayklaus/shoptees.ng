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
  "hero.eyebrow",
  "hero.headline",
  "hero.cycle_words",
  "hero.body",
  "hero.cta_label",
  "hero.cta_href",
  "hero.image_url",
  "hero.image_alt",
  "hero.caption",
  "campaign.enabled",
  "campaign.headline",
  "campaign.subcopy",
  "campaign.cta_label",
  "campaign.cta_href",
  "campaign.image_url",
  "campaign.image_alt",
  "notifications.admin_email",
  "currency.usd_enabled",
  "currency.ngn_per_usd",
  "currency.usd_rounding",
  "currency.charge_in_usd",
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

  // A broken rate would silently reprice the whole catalogue, so refuse it
  // here rather than letting resolveCurrency quietly fall back to naira.
  if (parsed.data["currency.usd_enabled"] === "true") {
    const rate = Number(parsed.data["currency.ngn_per_usd"]);
    if (!Number.isFinite(rate) || rate <= 0) {
      return { ok: false, error: "Enter a naira-per-dollar rate greater than zero." };
    }
  }

  for (const [key, value] of Object.entries(parsed.data)) {
    await setSetting(key, value as string);
  }
  revalidatePath("/", "layout");
  return { ok: true };
}
