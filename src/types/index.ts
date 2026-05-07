export type Size = "XS" | "S" | "M" | "L" | "XL" | "XXL";

export type ProductVariant = {
  id: string;
  size: Size;
  color: string;
  sku: string;
  inStock: boolean;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  priceNGN: number;
  images: { src: string; alt: string }[];
  variants: ProductVariant[];
  category: string;
  isPlaceholder?: boolean;
};

export type CartLine = {
  productId: string;
  variantId: string;
  quantity: number;
};

export type CartLineHydrated = CartLine & {
  product: Product;
  variant: ProductVariant;
  lineTotalNGN: number;
};
