// Storefront display shapes. These mirror the DB rows but are the contract
// the customer-facing components rely on, so server queries get normalised
// into these shapes via toDisplayProduct() in lib/server/products.ts.

export type DisplayVariant = {
  id: string;
  size: string;
  color: string;
  sku: string;
  stock: number;
  priceOverrideNGN: number | null;
};

export type DisplayImage = {
  url: string;
  alt: string;
  /**
   * Colourway the photo shows, matching DisplayVariant.color. Empty means
   * it is not specific to one, and it shows under every colourway.
   */
  color: string;
};

export type DisplayCategory = {
  slug: string;
  name: string;
};

export type DisplayCollection = {
  slug: string;
  name: string;
};

/** Spec-sheet rows. Empty strings are omitted from the table entirely. */
export type ProductSpec = {
  composition: string;
  fabricWeight: string;
  fit: string;
  care: string;
  madeIn: string;
};

export type DisplayProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  spec: ProductSpec;
  priceNGN: number;
  category: DisplayCategory | null;
  collection: DisplayCollection | null;
  images: DisplayImage[];
  variants: DisplayVariant[];
};

// What the cart actually persists in localStorage.
export type CartLine = {
  productId: string;
  variantId: string;
  quantity: number;
};

// Hydrated cart line — joined against current product/variant data.
export type CartLineHydrated = CartLine & {
  product: DisplayProduct;
  variant: DisplayVariant;
  unitPriceNGN: number;
  lineTotalNGN: number;
};
