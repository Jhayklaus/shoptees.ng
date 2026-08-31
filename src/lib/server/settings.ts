import "server-only";
import { prisma } from "@/lib/db";

export const SETTING_KEYS = [
  "site.name",
  "site.tagline",
  "contact.email",
  "contact.phone",
  "order.counter",
  "order.year",
  // Homepage editorial hero
  "hero.eyebrow",
  "hero.headline",
  "hero.cycle_words",
  "hero.body",
  "hero.cta_label",
  "hero.cta_href",
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
  // Hero — falls back to the original hardcoded copy so the page looks right
  // out of the box before anything is set in admin.
  "hero.eyebrow": "Spring/Summer · Lagos",
  "hero.headline": "Threads for the\nculture,\nbuilt for the",
  "hero.cycle_words": "streets.,stands.,block.,pitch.,city.,long haul.",
  "hero.body":
    "Shoptees is a Nigerian streetwear label. Cut-and-sew apparel and football jerseys for the everyday and the matchday — sold by the piece or by the carton.",
  "hero.cta_label": "Shop the collection",
  "hero.cta_href": "/shop",
  "hero.image_url": "/hero2.webp",
  "hero.image_alt": "Shoptees — current collection banner",
  "hero.caption": "· THE CLASSIC collection ·",
  "campaign.enabled": "false",
  "campaign.headline": "New season, new drop.",
  "campaign.subcopy": "A short line about the latest campaign or collection.",
  "campaign.cta_label": "Shop the drop",
  "campaign.cta_href": "/shop",
  "campaign.image_url": "",
  "campaign.image_alt": "",
  "notifications.admin_email": "",
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
