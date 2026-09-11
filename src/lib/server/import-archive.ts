import "server-only";
import { prisma } from "@/lib/db";
import { ARCHIVE_DESIGNS, type ArchiveDesign } from "@/lib/archive-catalogue";
import { COLLECTIONS } from "@/lib/taxonomy";

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

function productDescription(d: ArchiveDesign) {
  const colours = d.colourways.map((c) => c.name).join(", ");
  const codes = d.colourways.map((c) => c.code).join(", ");
  const cost =
    d.sampleCostNGN != null
      ? `\n\nSample cost: ₦${d.sampleCostNGN.toLocaleString()} per unit — production cost, NOT a retail price. Set a price before publishing.`
      : `\n\nNot costed in the merch reference. Set a price before publishing.`;
  return `${d.description}\n\nColourways: ${colours}.\nArchive refs: ${codes}.${cost}`;
}

function skuFor(code: string, size: string) {
  return `${code}-${size.replace(/\s+/g, "").toUpperCase()}`;
}

export async function importArchive({ apply }: { apply: boolean }): Promise<ImportReport> {
  const report: ImportReport = {
    applied: apply,
    designs: ARCHIVE_DESIGNS.length,
    colourways: ARCHIVE_DESIGNS.reduce((n, d) => n + d.colourways.length, 0),
    collections: [],
    products: [],
  };

  // ── Collections ────────────────────────────────────────────────────────
  for (const c of COLLECTIONS) {
    const existing = await prisma.collection.findUnique({ where: { slug: c.slug } });
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
    const [collection, category] = await Promise.all([
      prisma.collection.findUnique({ where: { slug: d.collection } }),
      prisma.category.findUnique({ where: { slug: d.category } }),
    ]);

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

    if (!collection || !category) {
      report.products.push({
        ...base,
        action: "skipped",
        reason: !collection
          ? `collection "${d.collection}" missing`
          : `category "${d.category}" missing`,
      });
      continue;
    }

    const existing = await prisma.product.findUnique({ where: { slug: d.slug } });
    report.products.push({ ...base, action: existing ? "updated" : "created" });
    if (!apply) continue;

    const data = {
      slug: d.slug,
      name: d.name,
      description: productDescription(d),
      priceNGN: 0, // see the note at the top of this file
      status: "DRAFT",
      categoryId: category.id,
      collectionId: collection.id,
    };

    const product = existing
      ? await prisma.product.update({ where: { id: existing.id }, data })
      : await prisma.product.create({ data });

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
