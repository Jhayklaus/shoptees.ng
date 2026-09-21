import type { DisplayProduct } from "@/types";

/**
 * The archive reference for a product — TH-16, PS-11, UC-04.
 *
 * Not stored on Product: it is already encoded in every variant's SKU, which
 * the importer builds as `<collection code>-<number>-<SIZE>`. Deriving it
 * here keeps one source of truth rather than adding a column that could
 * drift out of step with the SKUs actually printed on the line sheet.
 *
 * Returns null for anything that doesn't carry an archive-shaped SKU —
 * products added by hand in /admin, for instance — so the caller can just
 * leave the stamp off rather than render something meaningless.
 */
const REF = /^([A-Z]{2,4}-\d{1,3})-/;

export function archiveRef(product: Pick<DisplayProduct, "variants">): string | null {
  for (const v of product.variants) {
    const m = REF.exec(v.sku ?? "");
    if (m) return m[1];
  }
  return null;
}
