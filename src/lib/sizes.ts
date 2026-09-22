import type { DisplayVariant } from "@/types";

/**
 * Garment size order, for display.
 *
 * Variants come back from the product query sorted by `size` ascending,
 * which is alphabetical — so a shirt offers "L, M, S, XL". Sorting here
 * rather than in the query keeps the fix out of the data layer: this is a
 * presentation concern, and the query is shared with the admin and the
 * cart.
 *
 * Anything unrecognised (a numeric waist, a one-off label) keeps its
 * original relative position at the end rather than being dropped or
 * reshuffled arbitrarily.
 */
const ORDER = [
  "ONE SIZE",
  "OS",
  "XXS",
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "2XL",
  "3XL",
  "4XL",
];

function rank(size: string): number {
  const i = ORDER.indexOf(size.trim().toUpperCase());
  if (i !== -1) return i;
  // Numeric sizes (waist, shoe) sort numerically, after the lettered run.
  const n = Number.parseFloat(size);
  return Number.isFinite(n) ? ORDER.length + n : Number.MAX_SAFE_INTEGER;
}

export function sortBySize<T extends Pick<DisplayVariant, "size">>(variants: T[]): T[] {
  return [...variants]
    .map((v, i) => ({ v, i }))
    .sort((a, b) => rank(a.v.size) - rank(b.v.size) || a.i - b.i)
    .map(({ v }) => v);
}
