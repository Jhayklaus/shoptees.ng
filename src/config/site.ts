// Single source of truth for brand-level config.
// All real values come from BRAND_BRIEF.md gaps — placeholders until user provides.
export const siteConfig = {
  name: "Shoptees",
  // [PLACEHOLDER: tagline] — needs verbatim copy from user
  description: "[PLACEHOLDER: brand tagline / one-line description]",
  // [PLACEHOLDER: production domain]
  url: "https://example.com",
  ogImage: "/placeholders/og-default.svg",
  social: {
    instagram: "https://www.instagram.com/shopteesng/",
    x: "https://x.com/_Shoptees",
  },
  contact: {
    // [PLACEHOLDER: customer email]
    email: "[PLACEHOLDER: customer email]",
    // [PLACEHOLDER: phone / WhatsApp]
    phone: "[PLACEHOLDER: +234 ...]",
  },
} as const;

export const CURRENCY = "NGN" as const;
export const LOCALE = "en-NG" as const;
