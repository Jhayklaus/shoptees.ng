import type { Product } from "@/types";

// [PLACEHOLDER catalog] — every entry is structural placeholder, NOT real Shoptees data.
// Names use the `[PLACEHOLDER: ...]` convention so they CANNOT be mistaken for real copy.
// Replace wholesale once the user supplies the real product list.
const make = (i: number, opts: Partial<Product>): Product => ({
  id: `p-${String(i).padStart(3, "0")}`,
  slug: `placeholder-${i}`,
  name: `[PLACEHOLDER: Product ${i} name]`,
  description: `[PLACEHOLDER: Product ${i} description — material, fit, story, sourcing.]`,
  priceNGN: 0,
  category: "[PLACEHOLDER: category]",
  isPlaceholder: true,
  images: [
    { src: `/placeholders/product-${((i - 1) % 6) + 1}.svg`, alt: `[PLACEHOLDER product ${i}]` },
  ],
  variants: [
    { id: `p-${String(i).padStart(3, "0")}-s`, size: "S", color: "Default", sku: `P${i}-S`, inStock: true },
    { id: `p-${String(i).padStart(3, "0")}-m`, size: "M", color: "Default", sku: `P${i}-M`, inStock: true },
    { id: `p-${String(i).padStart(3, "0")}-l`, size: "L", color: "Default", sku: `P${i}-L`, inStock: true },
    { id: `p-${String(i).padStart(3, "0")}-xl`, size: "XL", color: "Default", sku: `P${i}-XL`, inStock: false },
  ],
  ...opts,
});

export const products: Product[] = [
  make(1, { slug: "harmattan-tee", category: "Tees" }),
  make(2, { slug: "ankara-shirt", category: "Shirts" }),
  make(3, { slug: "lagos-hoodie", category: "Outerwear" }),
  make(4, { slug: "studio-tote", category: "Accessories" }),
  make(5, { slug: "field-cap", category: "Accessories" }),
  make(6, { slug: "studio-tee-cream", category: "Tees" }),
  make(7, { slug: "dispatch-shirt", category: "Shirts" }),
  make(8, { slug: "long-sleeve-mono", category: "Tees" }),
];

export const categories = Array.from(new Set(products.map((p) => p.category)));

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}
