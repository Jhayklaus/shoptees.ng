import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export function buildMetadata(input: {
  title: string;
  description?: string;
  path?: string;
  image?: string;
}): Metadata {
  const url = `${siteConfig.url}${input.path ?? ""}`;
  const description = input.description ?? siteConfig.description;
  const image = input.image ?? siteConfig.ogImage;

  return {
    title: input.title,
    description,
    metadataBase: new URL(siteConfig.url),
    openGraph: {
      title: input.title,
      description,
      url,
      siteName: siteConfig.name,
      images: [{ url: image }],
      locale: "en_NG",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description,
      images: [image],
    },
    alternates: { canonical: url },
  };
}
