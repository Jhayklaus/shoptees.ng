// Align the live Category and Collection rows with the official taxonomy in
// src/lib/taxonomy.ts (transcribed from the Collection Archive).
//
//   npx tsx scripts/sync-taxonomy.ts            # report only, changes nothing
//   npx tsx scripts/sync-taxonomy.ts --apply    # write
//
// Idempotent, and deliberately conservative: rows that are not in the
// archive are only removed when nothing is attached to them. Anything
// holding products is reported and left alone — a catalogue row is the
// product's history, and dropping it to match a document would be the wrong
// trade every time.

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { resolveDatabaseUrls } from "../src/config/env";
import { CATEGORIES, COLLECTIONS } from "../src/lib/taxonomy";

const prisma = new PrismaClient({ datasourceUrl: resolveDatabaseUrls().databaseUrl });

const APPLY = process.argv.includes("--apply");
const log = (s: string) => console.log(s);

async function syncCategories() {
  log("\nCategories");
  const existing = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
  });
  const wanted = new Set(CATEGORIES.map((c) => c.slug));

  for (const c of CATEGORIES) {
    const row = existing.find((e) => e.slug === c.slug);
    if (!row) {
      log(`  + add     ${c.slug} — ${c.name}`);
      if (APPLY) await prisma.category.create({ data: c });
    } else {
      const changes: string[] = [];
      if (row.name !== c.name) changes.push(`name "${row.name}"→"${c.name}"`);
      if (row.sortOrder !== c.sortOrder) changes.push(`order ${row.sortOrder}→${c.sortOrder}`);
      if (!changes.length) continue;
      log(`  ~ update  ${c.slug} — ${changes.join(", ")}`);
      if (APPLY) {
        await prisma.category.update({
          where: { slug: c.slug },
          data: { name: c.name, sortOrder: c.sortOrder },
        });
      }
    }
  }

  for (const row of existing) {
    if (wanted.has(row.slug)) continue;
    if (row._count.products > 0) {
      log(`  ! keep    ${row.slug} — not in the archive, but ${row._count.products} product(s) attached; reassign them first`);
      continue;
    }
    log(`  - remove  ${row.slug} — not in the archive, no products`);
    if (APPLY) await prisma.category.delete({ where: { id: row.id } });
  }
}

async function syncCollections() {
  log("\nCollections");
  const existing = await prisma.collection.findMany({
    include: { _count: { select: { products: true } } },
  });
  const wanted = new Set(COLLECTIONS.map((c) => c.slug));

  for (const c of COLLECTIONS) {
    const row = existing.find((e) => e.slug === c.slug);
    const data = { name: c.name, description: c.description, sortOrder: c.sortOrder };
    if (!row) {
      // New collections arrive as drafts. A collection appearing on the
      // storefront the instant it is created, before it has a banner or a
      // single product, is never what anyone wants.
      log(`  + add     ${c.slug} — ${c.name} (${c.code}) [draft]`);
      if (APPLY) {
        await prisma.collection.create({ data: { slug: c.slug, ...data, status: "DRAFT" } });
      }
      continue;
    }
    const changes: string[] = [];
    if (row.name !== c.name) changes.push(`name "${row.name}"→"${c.name}"`);
    if (row.sortOrder !== c.sortOrder) changes.push(`order ${row.sortOrder}→${c.sortOrder}`);
    // Don't clobber copy someone has written in admin; only fill a blank one.
    const fillDescription = row.description.trim() === "";
    if (fillDescription) changes.push("description (was blank)");
    if (!changes.length) continue;
    log(`  ~ update  ${c.slug} — ${changes.join(", ")}`);
    if (APPLY) {
      await prisma.collection.update({
        where: { slug: c.slug },
        data: {
          name: c.name,
          sortOrder: c.sortOrder,
          ...(fillDescription ? { description: c.description } : {}),
        },
      });
    }
  }

  for (const row of existing) {
    if (wanted.has(row.slug)) continue;
    if (row._count.products > 0) {
      log(`  ! keep    ${row.slug} — not in the archive, but ${row._count.products} product(s) attached; reassign them first`);
      continue;
    }
    log(`  - remove  ${row.slug} — not in the archive, no products`);
    if (APPLY) await prisma.collection.delete({ where: { id: row.id } });
  }
}

async function main() {
  log(APPLY ? "Applying taxonomy…" : "Dry run — pass --apply to write.");
  await syncCategories();
  await syncCollections();
  log(APPLY ? "\nDone." : "\nNothing written.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
