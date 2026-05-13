// One-off prod bootstrap: site settings defaults + admin user from env.
// Categories are handled separately by scripts/seed-categories.ts.
// Placeholder products are intentionally skipped on prod.
//
//   npx tsx scripts/seed-prod-bootstrap.ts

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { resolveDatabaseUrls } from "../src/config/env";

const prisma = new PrismaClient({ datasourceUrl: resolveDatabaseUrls().databaseUrl });

async function seedSiteSettings() {
  const defaults: Record<string, string> = {
    "site.name": "Shoptees",
    "site.tagline": "[PLACEHOLDER: brand tagline / one-line description]",
    "contact.email": "[PLACEHOLDER: customer email]",
    "contact.phone": "[PLACEHOLDER: +234 ...]",
    "order.counter": "0",
    "order.year": new Date().getFullYear().toString(),
  };
  for (const [key, value] of Object.entries(defaults)) {
    await prisma.siteSetting.upsert({
      where: { key },
      create: { key, value },
      update: {},
    });
  }
  console.log("✓ site settings seeded");
}

async function seedAdmin() {
  const email = process.env.ADMIN_BOOTSTRAP_EMAIL;
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  if (!email || !password) {
    console.warn("⚠ ADMIN_BOOTSTRAP_EMAIL / ADMIN_BOOTSTRAP_PASSWORD not set — skipping admin user.");
    return;
  }
  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    console.log(`ℹ admin user ${email} already exists — leaving as-is.`);
    return;
  }
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.adminUser.create({
    data: { email, passwordHash, name: email.split("@")[0] },
  });
  console.log(`✓ created admin user ${email}`);
}

async function main() {
  await seedSiteSettings();
  await seedAdmin();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
