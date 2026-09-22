import "server-only";
import { prisma } from "@/lib/db";

export const SETTING_KEYS = [
  "site.name",
  "site.tagline",
  "contact.email",
  "contact.phone",
  "order.counter",
  "order.year",
  // Homepage hero — a featured-collection banner
  "hero.collection",
  "hero.eyebrow",
  "hero.headline",
  "hero.body",
  "hero.cta_label",
  "hero.image_url",
  "hero.image_alt",
  "hero.caption",
  // Homepage full-bleed campaign banner (below the hero)
  "campaign.enabled",
  "campaign.headline",
  "campaign.subcopy",
  "campaign.cta_label",
  "campaign.cta_href",
  "campaign.image_url",
  "campaign.image_alt",
  // Notifications
  "notifications.admin_email",
  // Currency — naira is the source of truth; USD is derived from this rate.
  "currency.usd_enabled",
  "currency.ngn_per_usd",
  "currency.usd_rounding",
  "currency.charge_in_usd",
] as const;
export type SettingKey = (typeof SETTING_KEYS)[number];

const fallback: Record<SettingKey, string> = {
  "site.name": "Shoptees",
  "site.tagline":
    "Streetwear and football jerseys for men and women. Built in Lagos, sold by the piece or by the carton.",
  "contact.email": "",
  "contact.phone": "",
  "order.counter": "0",
  "order.year": new Date().getFullYear().toString(),
  // Hero — a FEATURED COLLECTION banner, not brand copy.
  //
  // `hero.collection` names which collection leads the homepage. Blank, or
  // pointing at a collection that is missing or unpublished, falls back to
  // the first active collection in the archive's own order — so the hero is
  // never empty and never advertises something a customer cannot open.
  //
  // The copy keys below are OVERRIDES. Left blank, the hero uses the
  // collection's own name, description and artwork, which means it stays
  // correct when a collection is edited and needs no second edit here.
  "hero.collection": "",
  "hero.eyebrow": "",
  "hero.headline": "",
  "hero.body": "",
  "hero.cta_label": "",
  "hero.image_url": "/hero2.webp",
  "hero.image_alt": "Shoptees — current collection banner",
  "hero.caption": "",
  "campaign.enabled": "false",
  "campaign.headline": "New season, new drop.",
  "campaign.subcopy": "A short line about the latest campaign or collection.",
  "campaign.cta_label": "Shop the drop",
  "campaign.cta_href": "/shop",
  "campaign.image_url": "",
  "campaign.image_alt": "",
  "notifications.admin_email": "",
  "currency.usd_enabled": "false",
  "currency.ngn_per_usd": "1600",
  "currency.usd_rounding": "charm",
  // Off until Paystack has USD enabled on the business and a domiciliary
  // account to settle into. Until then USD is display-only and the card is
  // charged in naira.
  "currency.charge_in_usd": "false",
};

export async function getAllSettings(): Promise<Record<SettingKey, string>> {
  const rows = await prisma.siteSetting.findMany();
  const map: Record<string, string> = { ...fallback };
  for (const r of rows) map[r.key] = r.value;
  return map as Record<SettingKey, string>;
}

export async function getSetting(key: SettingKey) {
  const row = await prisma.siteSetting.findUnique({ where: { key } });
  return row?.value ?? fallback[key];
}

export async function setSetting(key: string, value: string) {
  return prisma.siteSetting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
}
