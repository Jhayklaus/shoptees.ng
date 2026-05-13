// One-off: align Category rows with the live brand taxonomy.
// Keeps Tees (has products), removes the 3 unused defaults, adds the new set.
//
//   npx tsx scripts/seed-categories.ts

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { resolveDatabaseUrls } from "../src/config/env";

const prisma = new PrismaClient({ datasourceUrl: resolveDatabaseUrls().databaseUrl });

const TARGET = [
  { slug: "tees", name: "Tees", sortOrder: 1 },
  { slug: "jerseys", name: "Jerseys", sortOrder: 2 },
  { slug: "jorts", name: "Jorts", sortOrder: 3 },
  { slug: "hoodies", name: "Hoodies", sortOrder: 4 },
  { slug: "pants", name: "Pants", sortOrder: 5 },
  { slug: "extras", name: "Extras", sortOrder: 6 },
];

async function main() {
  const existing = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
  });
  const targetSlugs = new Set(TARGET.map((t) => t.slug));

  // Delete unused legacy categories (no products attached).
  for (const c of existing) {
    if (targetSlugs.has(c.slug)) continue;
    if (c._count.products > 0) {
      console.log(`  skip-delete "${c.slug}" — has ${c._count.products} products`);
      continue;
    }
    await prisma.category.delete({ where: { id: c.id } });
    console.log(`  - deleted ${c.slug}`);
  }

  // Upsert the target set (keeps Tees' id + linked products intact).
  for (const t of TARGET) {
    await prisma.category.upsert({
      where: { slug: t.slug },
      update: { name: t.name, sortOrder: t.sortOrder },
      create: t,
    });
    console.log(`  + ${t.slug.padEnd(8)} sortOrder=${t.sortOrder}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
