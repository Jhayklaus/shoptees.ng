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
};

export type DisplayCategory = {
  slug: string;
  name: string;
};

export type DisplayCollection = {
  slug: string;
  name: string;
};

export type DisplayProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
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
