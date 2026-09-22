import "server-only";
import { prisma } from "@/lib/db";
import { ARCHIVE_DESIGNS, type ArchiveDesign } from "@/lib/archive-catalogue";
import { CATEGORIES, COLLECTIONS } from "@/lib/taxonomy";

// Imports the Collection Archive as DRAFTS.
//
// Lives here rather than only in a script because the production database is
// not reachable from outside the deployment — so the import has to be able to
// run inside it, triggered from /admin/import by a logged-in admin. The CLI
// script in scripts/ calls the same function against whatever database its
// env points at.
//
// Artwork is served from public/archive, committed to the repo. These are the
// brand's own flats, not user uploads: static assets shipped with the site
// need no bucket, no credentials, and no upload step, and Next/Image still
// optimises them on delivery.
//
// PRICES ARE ₦0, deliberately. The Merch & Expense Reference prices SAMPLE
// PRODUCTION, not retail — importing at those figures would put the shop
// online selling at cost. The sample cost goes in the description to price
// against instead.

export type ImportReport = {
  applied: boolean;
  designs: number;
  colourways: number;
  categories: { slug: string; action: "created" | "exists" }[];
  collections: { slug: string; action: "created" | "exists"; status: string }[];
  products: {
    slug: string;
    name: string;
    action: "created" | "updated" | "skipped";
    reason?: string;
    colourways: number;
    variants: number;
  }[];
};

/** Public URL of a flat, served straight from the repo's public/ folder. */
export function archiveImageUrl(file: string) {
  return `/archive/${file}`;
}

/**
 * The customer-facing description, and nothing else.
 *
 * This used to append the colourway list, the archive refs and a sample
 * production cost. All three were wrong to put here:
 *
 *  - the sample cost is internal. It was a note to whoever set prices, and
 *    it shipped to customers as body copy reading "NOT a retail price";
 *  - colourways and refs are now structured data on the product page, so
 *    repeating them in prose duplicates what the UI already shows.
 *
 * A re-run of the import rewrites descriptions, so running it again is how
 * the existing 23 rows get cleaned up.
 */
function productDescription(d: ArchiveDesign) {
  return d.description;
}

function skuFor(code: string, size: string) {
  return `${code}-${size.replace(/\s+/g, "").toUpperCase()}`;
}

export async function importArchive({ apply }: { apply: boolean }): Promise<ImportReport> {
  const report: ImportReport = {
    applied: apply,
    designs: ARCHIVE_DESIGNS.length,
    colourways: ARCHIVE_DESIGNS.reduce((n, d) => n + d.colourways.length, 0),
    categories: [],
    collections: [],
    products: [],
  };

  // ── Categories ─────────────────────────────────────────────────────────
  // Created here rather than left to the CLI taxonomy script. The whole
  // reason this runs inside the deployment is that the database isn't
  // reachable from anywhere else — so telling someone to "run the sync
  // first" asks for the one thing they can't do. Only ever adds what the
  // archive needs; removing stale rows stays with the CLI script, where a
  // human is watching.
  // Slugs that will be in place by the time products are imported — existing
  // rows plus the ones this run creates. A preview writes nothing, so without
  // this it would look up categories that don't exist yet and report every
  // product as skipped, which is a lie about what --apply would do.
  const availableCategories = new Set<string>();
  const availableCollections = new Set<string>();

  for (const c of CATEGORIES) {
    const existing = await prisma.category.findUnique({ where: { slug: c.slug } });
    availableCategories.add(c.slug);
    if (existing) {
      report.categories.push({ slug: c.slug, action: "exists" });
      continue;
    }
    report.categories.push({ slug: c.slug, action: "created" });
    if (apply) await prisma.category.create({ data: c });
  }

  // ── Collections ────────────────────────────────────────────────────────
  for (const c of COLLECTIONS) {
    const existing = await prisma.collection.findUnique({ where: { slug: c.slug } });
    availableCollections.add(c.slug);
    if (existing) {
      report.collections.push({ slug: c.slug, action: "exists", status: existing.status });
      continue;
    }
    report.collections.push({ slug: c.slug, action: "created", status: "DRAFT" });
    if (apply) {
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

  // ── Products ───────────────────────────────────────────────────────────
  for (const d of ARCHIVE_DESIGNS) {
    const variants = d.colourways.flatMap((c) =>
      d.sizes.map((size) => ({
        size,
        color: c.name,
        sku: skuFor(c.code, size),
        stock: 0,
        priceOverrideNGN: null,
      })),
    );

    const base = {
      slug: d.slug,
      name: d.name,
      colourways: d.colourways.length,
      variants: variants.length,
    };

    if (!availableCollections.has(d.collection) || !availableCategories.has(d.category)) {
      report.products.push({
        ...base,
        action: "skipped",
        reason: !availableCollections.has(d.collection)
          ? `collection "${d.collection}" is not in the taxonomy`
          : `category "${d.category}" is not in the taxonomy`,
      });
      continue;
    }

    const existing = await prisma.product.findUnique({ where: { slug: d.slug } });
    report.products.push({ ...base, action: existing ? "updated" : "created" });
    if (!apply) continue;

    // Only needed for the write — by now both rows are guaranteed to exist.
    const [collection, category] = await Promise.all([
      prisma.collection.findUniqueOrThrow({ where: { slug: d.collection } }),
      prisma.category.findUniqueOrThrow({ where: { slug: d.category } }),
    ]);

    // What the archive owns: identity, copy and filing. On a product that
    // already exists these are safe to rewrite, because they come from the
    // archive document and nothing else edits them.
    const fromArchive = {
      slug: d.slug,
      name: d.name,
      description: productDescription(d),
      categoryId: category.id,
      collectionId: collection.id,
    };

    // What the SHOP owns: price and whether it is published. A re-run must
    // not touch these. They are set once, on create, and after that they
    // belong to whoever priced the piece and pressed publish — a second run
    // resetting them would zero every price and unpublish the catalogue.
    const product = existing
      ? await prisma.product.update({ where: { id: existing.id }, data: fromArchive })
      : await prisma.product.create({
          data: {
            ...fromArchive,
            priceNGN: 0, // see the note at the top of this file
            status: "DRAFT",
          },
        });

    // Replace variants and images so a re-run converges instead of
    // accumulating. Variants are only safe to replace while nothing has been
    // ordered against them — true for fresh drafts, but check anyway.
    const ordered = await prisma.orderItem.count({ where: { productId: product.id } });
    if (ordered === 0) {
      await prisma.variant.deleteMany({ where: { productId: product.id } });
      await prisma.variant.createMany({
        data: variants.map((v) => ({ ...v, productId: product.id })),
      });
    }

    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    await prisma.productImage.createMany({
      data: d.colourways.map((c, i) => ({
        productId: product.id,
        url: archiveImageUrl(c.file),
        alt: `${d.name} — ${c.name}`,
        sortOrder: i,
      })),
    });
  }

  return report;
}
