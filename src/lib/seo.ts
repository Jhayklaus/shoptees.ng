import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

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
