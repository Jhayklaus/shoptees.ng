import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { resolveDatabaseUrls } from "../src/config/env";

const prisma = new PrismaClient({ datasourceUrl: resolveDatabaseUrls().databaseUrl });

// ────────────────────────────────────────────────────────────────────
// Placeholder catalogue. Migrated verbatim from the old src/data/products.ts.
// Names use the [PLACEHOLDER ...] convention so they can never be mistaken
// for real Shoptees copy.
// ────────────────────────────────────────────────────────────────────

const categorySeed = [
  { slug: "tees", name: "Tees", sortOrder: 1 },
  { slug: "shirts", name: "Shirts", sortOrder: 2 },
  { slug: "outerwear", name: "Outerwear", sortOrder: 3 },
  { slug: "accessories", name: "Accessories", sortOrder: 4 },
];

type ProductSeed = {
  slug: string;
  categorySlug: string;
  imageIndex: number; // 1..6 → /placeholders/product-N.svg
};

const productSeed: ProductSeed[] = [
  { slug: "harmattan-tee", categorySlug: "tees", imageIndex: 1 },
  { slug: "ankara-shirt", categorySlug: "shirts", imageIndex: 2 },
  { slug: "lagos-hoodie", categorySlug: "outerwear", imageIndex: 3 },
  { slug: "studio-tote", categorySlug: "accessories", imageIndex: 4 },
  { slug: "field-cap", categorySlug: "accessories", imageIndex: 5 },
  { slug: "studio-tee-cream", categorySlug: "tees", imageIndex: 6 },
  { slug: "dispatch-shirt", categorySlug: "shirts", imageIndex: 1 },
  { slug: "long-sleeve-mono", categorySlug: "tees", imageIndex: 6 },
];

const sizes = ["S", "M", "L", "XL"] as const;

async function seedCategoriesAndProducts() {
  for (const c of categorySeed) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      create: c,
      update: { name: c.name, sortOrder: c.sortOrder },
    });
  }

  for (let i = 0; i < productSeed.length; i++) {
    const p = productSeed[i];
    const category = await prisma.category.findUnique({ where: { slug: p.categorySlug } });
    const productNumber = i + 1;

    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      create: {
        slug: p.slug,
        name: `[PLACEHOLDER: Product ${productNumber} name]`,
        description: `[PLACEHOLDER: Product ${productNumber} description — material, fit, story, sourcing.]`,
        priceNGN: 0,
        status: "ACTIVE",
        categoryId: category?.id,
      },
      update: {
        categoryId: category?.id,
      },
    });

    // Variants
    for (const size of sizes) {
      const sku = `P${productNumber}-${size}`;
      await prisma.variant.upsert({
        where: { sku },
        create: {
          productId: product.id,
          size,
          color: "Default",
          sku,
          stock: size === "XL" ? 0 : 10,
        },
        update: {},
      });
    }

    // Image — only insert if product has none
    const existingImages = await prisma.productImage.count({ where: { productId: product.id } });
    if (existingImages === 0) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: `/placeholders/product-${p.imageIndex}.svg`,
          alt: `[PLACEHOLDER product ${productNumber}]`,
          sortOrder: 0,
        },
      });
    }
  }
}

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
      update: {}, // never overwrite settings the admin may have edited
    });
  }
}

async function seedAdmin() {
  const email = process.env.ADMIN_BOOTSTRAP_EMAIL;
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  if (!email || !password) {
    console.warn(
      "⚠ ADMIN_BOOTSTRAP_EMAIL / ADMIN_BOOTSTRAP_PASSWORD not set — skipping admin user creation."
    );
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
  await seedCategoriesAndProducts();
  await seedSiteSettings();
  await seedAdmin();
  console.log("✓ seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
