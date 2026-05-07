import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { products } from "@/data/products";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  const staticRoutes = ["", "/shop", "/cart", "/checkout", "/about", "/contact"];
  return [
    ...staticRoutes.map((p) => ({
      url: `${base}${p}`,
      lastModified: new Date(),
    })),
    ...products.map((product) => ({
      url: `${base}/shop/${product.slug}`,
      lastModified: new Date(),
    })),
  ];
}
