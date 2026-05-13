import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

// Keyword set surfaced site-wide. Google ignores this meta for ranking, but
// it still shows up in: smaller search engines, some internal/site search
// systems, AI crawler context windows, and social previews. Keep it focused
// on terms the brand actually wants to be associated with — no stuffing.
const KEYWORDS = [
  // Brand
  "Shoptees", "Shopteesng", "Shoptees NG", "Shoptees Nigeria", "shptz",
  // Categories
  "streetwear", "football jerseys", "soccer jerseys", "tees", "t-shirts",
  "graphic tees", "jorts", "jersey shorts", "hoodies", "pants", "trousers",
  // Audience
  "men's streetwear", "women's streetwear", "unisex apparel",
  "men's clothing Nigeria", "women's clothing Nigeria",
  // Geography
  "Nigerian streetwear", "Lagos streetwear", "Nigerian fashion",
  "Lagos fashion", "Nigeria clothing brand", "made in Nigeria",
  "African streetwear",
  // B2B
  "wholesale clothing Nigeria", "wholesale streetwear",
  "bulk t-shirts Nigeria", "jersey wholesale Nigeria",
  // Football culture
  "football kits Nigeria", "club jerseys", "supporters wear",
  "terrace fashion", "matchday wear",
];

// Root-layout metadata. The title template means every other page just sets
// its short title (e.g. "About") and Next renders "About — Shoptees".
// `title.default` is the homepage value when no per-page title is set.
export const rootMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — Streetwear & football jerseys`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: KEYWORDS,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  category: "Fashion",
  openGraph: {
    title: `${siteConfig.name} — Streetwear & football jerseys`,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    images: [{ url: siteConfig.ogImage }],
    locale: "en_NG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — Streetwear & football jerseys`,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
};

// Per-page metadata. Pass the short title only ("About"); the layout template
// suffixes the brand name. Use `noIndex: true` on transactional/cart pages.
export function buildMetadata(input: {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
}): Metadata {
  const url = `${siteConfig.url}${input.path ?? ""}`;
  const description = input.description ?? siteConfig.description;
  const image = input.image ?? siteConfig.ogImage;
  const fullTitle = `${input.title} — ${siteConfig.name}`;

  return {
    title: input.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: siteConfig.name,
      images: [{ url: image }],
      locale: "en_NG",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
    },
    ...(input.noIndex && {
      robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
    }),
  };
}
