// Top nav can mix plain links and dropdown triggers. Dropdowns are
// declared by `kind`; the Header decides what menu content to render
// based on that key (e.g. "collections" → live categories from the DB).
export type NavItem =
  | { type: "link"; label: string; href: string }
  | { type: "dropdown"; label: string; kind: "collections" };

export const mainNav: NavItem[] = [
  { type: "dropdown", label: "Collections", kind: "collections" },
  { type: "link", label: "Shop", href: "/shop" },
  { type: "link", label: "About", href: "/about" },
];

export const footerNav = {
  shop: [
    { label: "All Products", href: "/shop" },
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
