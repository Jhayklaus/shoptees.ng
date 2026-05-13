import "server-only";
import { prisma } from "@/lib/db";

export const SETTING_KEYS = [
  "site.name",
  "site.tagline",
  "contact.email",
  "contact.phone",
  "order.counter",
  "order.year",
  // Homepage announcement banner
  "banner.enabled",
  "banner.eyebrow",
  "banner.title",
  "banner.body",
  "banner.cta_label",
  "banner.cta_href",
  "banner.image_url",
  "banner.image_alt",
] as const;
export type SettingKey = (typeof SETTING_KEYS)[number];

const fallback: Record<SettingKey, string> = {
  "site.name": "Shoptees",
  "site.tagline": "[PLACEHOLDER: brand tagline / one-line description]",
  "contact.email": "[PLACEHOLDER: customer email]",
  "contact.phone": "[PLACEHOLDER: +234 ...]",
  "order.counter": "0",
  "order.year": new Date().getFullYear().toString(),
  "banner.enabled": "false",
  "banner.eyebrow": "New arrival · 01",
  "banner.title": "A new chapter, on the table.",
  "banner.body": "A short note about the new collection or restock.",
  "banner.cta_label": "Shop the drop",
  "banner.cta_href": "/shop",
  "banner.image_url": "",
  "banner.image_alt": "",
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
