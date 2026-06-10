// Top nav can mix plain links and dropdown triggers. Dropdowns are
// declared by `kind`; the Header decides what menu content to render
// based on that key — "collections" lists curated lines (Urban Retro…),
// "categories" lists product types (jerseys, hoodies…), both live from the DB.
export type NavItem =
  | { type: "link"; label: string; href: string }
  | { type: "dropdown"; label: string; kind: "collections" | "categories" };

export const mainNav: NavItem[] = [
  { type: "dropdown", label: "Collections", kind: "collections" },
  { type: "dropdown", label: "Categories", kind: "categories" },
  { type: "link", label: "Shop", href: "/shop" },
  { type: "link", label: "About", href: "/about" },
];

export const footerNav = {
  shop: [
    { label: "All Products", href: "/shop" },
    { label: "Collections", href: "/collections" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  legal: [
    // TODO: confirm with user — privacy & terms copy
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
} as const;
