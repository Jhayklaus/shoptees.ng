import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Keep admin, internal APIs, and transactional pages out of search.
        // The cart/checkout pages also carry `noIndex` meta as belt-and-braces.
        disallow: ["/admin", "/admin/", "/api", "/api/", "/cart", "/checkout"],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
