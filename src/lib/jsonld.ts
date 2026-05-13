import type { DisplayProduct } from "@/types";
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

// Image URLs may be absolute (R2 public URL) or relative (/placeholders/...).
// Only prepend the site origin when the URL is relative.
function absolutize(url: string) {
  return /^https?:\/\//i.test(url) ? url : `${siteConfig.url}${url}`;
}

export function productJsonLd(product: DisplayProduct) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((i) => absolutize(i.url)),
    sku: product.variants[0]?.sku,
    offers: {
      "@type": "Offer",
      priceCurrency: CURRENCY,
      price: product.priceNGN,
      availability: product.variants.some((v) => v.stock > 0)
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${siteConfig.url}/shop/${product.slug}`,
    },
  };
}
