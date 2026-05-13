// Single source of truth for brand-level config.
// `contact.email` and `contact.phone` are overridden by SiteSetting values when
// the admin sets them in /admin/settings.
export const siteConfig = {
  name: "Shoptees",
  description:
    "Streetwear and football jerseys for men and women. Built in Lagos, sold by the piece or by the carton.",
  url: "https://shoptees.ng",
  ogImage: "/og-image.jpg",
  social: {
    instagram: "https://www.instagram.com/shopteesng/",
    x: "https://x.com/_Shoptees",
  },
  contact: {
    email: "contact@shoptees.ng",
    phone: "+2348110513407",
  },
} as const;

export const CURRENCY = "NGN" as const;
export const LOCALE = "en-NG" as const;
