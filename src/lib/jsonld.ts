import type { DisplayProduct } from "@/types";
import { siteConfig, CURRENCY } from "@/config/site";

export function organizationJsonLd() {
  const contactPoints: Record<string, unknown>[] = [];
  if (siteConfig.contact.email || siteConfig.contact.phone) {
    contactPoints.push({
      "@type": "ContactPoint",
      contactType: "customer service",
      ...(siteConfig.contact.email && { email: siteConfig.contact.email }),
      ...(siteConfig.contact.phone && { telephone: siteConfig.contact.phone }),
      areaServed: "NG",
      availableLanguage: ["English"],
    });
  }

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.png`,
    description: siteConfig.description,
    sameAs: [siteConfig.social.instagram, siteConfig.social.x],
    ...(contactPoints.length > 0 && { contactPoint: contactPoints }),
  };
}

// Image URLs may be absolute (R2 public URL) or relative (/...).
// Only prepend the site origin when the URL is relative.
function absolutize(url: string) {
  return /^https?:\/\//i.test(url) ? url : `${siteConfig.url}${url}`;
}

export function productJsonLd(product: DisplayProduct) {
  const inStock = product.variants.some((v) => v.stock > 0);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((i) => absolutize(i.url)),
    sku: product.variants[0]?.sku,
    brand: { "@type": "Brand", name: siteConfig.name },
    ...(product.category && { category: product.category.name }),
    offers: {
      "@type": "Offer",
      priceCurrency: CURRENCY,
      price: product.priceNGN,
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${siteConfig.url}/shop/${product.slug}`,
      seller: { "@type": "Organization", name: siteConfig.name },
    },
  };
}

// BreadcrumbList — Google uses this to render breadcrumbs in search results
// instead of the bare URL path. Drop into <script type="application/ld+json">.
export function breadcrumbJsonLd(
  trail: { name: string; url: string }[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((step, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: step.name,
      item: step.url.startsWith("http") ? step.url : `${siteConfig.url}${step.url}`,
    })),
  };
}
