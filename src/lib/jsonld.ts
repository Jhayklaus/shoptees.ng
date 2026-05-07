import type { Product } from "@/types";
import { siteConfig, CURRENCY } from "@/config/site";

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/placeholders/logo.svg`,
    sameAs: [siteConfig.social.instagram, siteConfig.social.x],
  };
}

export function productJsonLd(product: Product) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((i) => `${siteConfig.url}${i.src}`),
    sku: product.variants[0]?.sku,
    offers: {
      "@type": "Offer",
      priceCurrency: CURRENCY,
      price: product.priceNGN,
      availability: product.variants.some((v) => v.inStock)
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${siteConfig.url}/shop/${product.slug}`,
    },
  };
}
