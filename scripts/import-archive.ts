// Import the Collection Archive into the catalogue as DRAFTS.
//
//   npx tsx scripts/import-archive.ts --dir ./collections              # dry run
//   npx tsx scripts/import-archive.ts --dir ./collections --apply
//   npx tsx scripts/import-archive.ts --dir ./collections --apply --no-images
//
// `--dir` points at the `collections/` folder from the archive zip (the one
// containing trap-house/, urban-classic/, …).
//
// What it does, all of it idempotent by slug so a re-run updates rather than
// duplicates:
//   · creates the six collections as DRAFT
//   · uploads each flat to R2 under a deterministic key
//   · creates one DRAFT product per design (see src/lib/archive-catalogue.ts)
//   · attaches every colourway's flat as a product image
//   · creates a variant per colourway × size, stock 0
//
// Everything lands as DRAFT. Nothing is visible on the storefront until it is
// published by hand.
//
// PRICES ARE ₦0, deliberately. The figures in the Merch & Expense Reference
// are sample production costs, not retail prices — importing at cost would
// put the shop online with no margin. Each product's sample cost is written
// into its description so it can be priced against, and a ₦0 product is
// impossible to miss during review.
//
// Requires the same env as the app: the *_DATABASE_URL pair for the target
// environment, plus the R2_* credentials. Run it against production only with
// NEXT_PUBLIC_APP_ENVIRONMENT=production.

import "dotenv/config";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { resolveDatabaseUrls, resolveAppEnvironment } from "../src/config/env";
import { ARCHIVE_DESIGNS, type ArchiveDesign } from "../src/lib/archive-catalogue";
import { COLLECTIONS } from "../src/lib/taxonomy";

const prisma = new PrismaClient({ datasourceUrl: resolveDatabaseUrls().databaseUrl });

const args = process.argv.slice(2);
const APPLY = args.includes("--apply");
/** Import the catalogue without touching R2 — useful to stage metadata first. */
const NO_IMAGES = args.includes("--no-images");
const dirArg = args.indexOf("--dir");
const ARCHIVE_DIR = dirArg >= 0 ? args[dirArg + 1] : "./collections";

const log = (s: string) => console.log(s);

// ── R2 ────────────────────────────────────────────────────────────────────

const R2_BUCKET = process.env.R2_BUCKET ?? "";
const R2_PUBLIC_URL = (process.env.R2_PUBLIC_URL ?? "").replace(/\/$/, "");

function r2() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!accountId || !accessKeyId || !secretAccessKey || !R2_BUCKET || !R2_PUBLIC_URL) {
    throw new Error("R2 is not configured — set R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY / R2_BUCKET / R2_PUBLIC_URL.");
  }
  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

/**
 * Deterministic key — the archive path itself. Re-running overwrites the same
 * object instead of piling up timestamped copies, which is what an importer
 * wants (the app's own uploader stamps keys because those are user uploads
 * that must never collide).
 */
function objectKey(file: string) {
  const folder = resolveAppEnvironment() === "production" ? "products" : "staging-products";
  return `${folder}/archive/${file}`;
}

function publicUrl(file: string) {
  return `${R2_PUBLIC_URL}/${objectKey(file)}`;
}

async function uploadFlat(client: S3Client, file: string) {
  const full = path.join(ARCHIVE_DIR, file);
  const body = await readFile(full);
  await client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: objectKey(file),
      Body: body,
      ContentType: "image/png",
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
}

// ── Import ────────────────────────────────────────────────────────────────

function productDescription(d: ArchiveDesign) {
  const colours = d.colourways.map((c) => c.name).join(", ");
  const cost =
    d.sampleCostNGN != null
      ? `\n\nSample cost: ₦${d.sampleCostNGN.toLocaleString()} per unit (production cost, not a retail price — set a price before publishing).`
      : `\n\nNot costed in the merch reference — set a price before publishing.`;
  const codes = d.colourways.map((c) => c.code).join(", ");
  return `${d.description}\n\nColourways: ${colours}.\nArchive refs: ${codes}.${cost}`;
}

function skuFor(d: ArchiveDesign, code: string, size: string) {
  return `${code}-${size.replace(/\s+/g, "").toUpperCase()}`;
}

async function verifyFiles() {
  const missing: string[] = [];
  for (const d of ARCHIVE_DESIGNS) {
    for (const c of d.colourways) {
      if (!existsSync(path.join(ARCHIVE_DIR, c.file))) missing.push(c.file);
    }
  }
  if (missing.length) {
    log(`\n${missing.length} file(s) from the catalogue are missing under ${ARCHIVE_DIR}:`);
    missing.forEach((m) => log(`  ! ${m}`));
    throw new Error("Archive is incomplete — refusing to import a partial catalogue.");
  }
  const flats = ARCHIVE_DESIGNS.reduce((n, d) => n + d.colourways.length, 0);
  log(`Archive check: ${ARCHIVE_DESIGNS.length} designs · ${flats} colourways · all files present.`);
}

async function importCollections() {
  log("\nCollections (as DRAFT)");
  for (const c of COLLECTIONS) {
    const existing = await prisma.collection.findUnique({ where: { slug: c.slug } });
    if (existing) {
      log(`  = exists   ${c.slug} (${existing.status}) — left as is`);
      continue;
    }
    log(`  + create   ${c.slug} — ${c.name}`);
    if (APPLY) {
      await prisma.collection.create({
        data: {
          slug: c.slug,
          name: c.name,
          description: c.description,
          sortOrder: c.sortOrder,
          status: "DRAFT",
        },
      });
    }
  }
}

async function importProducts(client: S3Client | null) {
  log("\nProducts (as DRAFT)");
  for (const d of ARCHIVE_DESIGNS) {
    const [collection, category] = await Promise.all([
      prisma.collection.findUnique({ where: { slug: d.collection } }),
      prisma.category.findUnique({ where: { slug: d.category } }),
    ]);
    if (!collection) {
      log(`  ! skip     ${d.slug} — collection "${d.collection}" not found; run sync-taxonomy first`);
      continue;
    }
    if (!category) {
      log(`  ! skip     ${d.slug} — category "${d.category}" not found; run sync-taxonomy first`);
      continue;
    }

    const variants = d.colourways.flatMap((c) =>
      d.sizes.map((size) => ({
        size,
        color: c.name,
        sku: skuFor(d, c.code, size),
        stock: 0,
        priceOverrideNGN: null,
      })),
    );

    const existing = await prisma.product.findUnique({ where: { slug: d.slug } });
    const verb = existing ? "update " : "create ";
    log(
      `  ${existing ? "~" : "+"} ${verb}  ${d.slug} — ${d.colourways.length} colourway(s), ${variants.length} variant(s)`,
    );
    if (!APPLY) continue;

    if (client) {
      for (const c of d.colourways) await uploadFlat(client, c.file);
    }

    const data = {
      slug: d.slug,
      name: d.name,
      description: productDescription(d),
      // ₦0 on purpose — see the header note.
      priceNGN: 0,
      status: "DRAFT",
      categoryId: category.id,
      collectionId: collection.id,
    };

    const product = existing
      ? await prisma.product.update({ where: { id: existing.id }, data })
      : await prisma.product.create({ data });

    // Replace images and variants wholesale so a re-run converges rather than
    // accumulating. Variants are only safe to delete while nothing has been
    // ordered — these are fresh drafts, but bail if that ever stops being true.
    const ordered = await prisma.orderItem.count({ where: { productId: product.id } });
    if (ordered > 0) {
      log(`    ! ${d.slug} has ${ordered} order line(s) — leaving variants alone`);
    } else {
      await prisma.variant.deleteMany({ where: { productId: product.id } });
      await prisma.variant.createMany({
        data: variants.map((v) => ({ ...v, productId: product.id })),
      });
    }

    if (!client) continue; // --no-images: leave any existing images alone
    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    await prisma.productImage.createMany({
      data: d.colourways.map((c, i) => ({
        productId: product.id,
        url: publicUrl(c.file),
        alt: `${d.name} — ${c.name}`,
        sortOrder: i,
      })),
    });
  }
}

async function main() {
  const env = resolveAppEnvironment();
  log(APPLY ? `Importing into ${env.toUpperCase()}…` : `Dry run against ${env.toUpperCase()} — pass --apply to write.`);
  await verifyFiles();

  const client = APPLY && !NO_IMAGES ? r2() : null;
  if (APPLY && NO_IMAGES) log("--no-images: skipping R2 upload, product images will not be set.");
  await importCollections();
  await importProducts(client);

  log(
    APPLY
      ? "\nDone. Everything is DRAFT — review in /admin, set prices and stock, then publish."
      : "\nNothing written.",
  );
}

main()
  .catch((e) => {
    console.error("\n" + (e instanceof Error ? e.message : String(e)));
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
