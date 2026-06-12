// Shared banner constants/types — safe to import from both client and server.
// Keep this free of "server-only" and any DB imports.

export const BANNER_LAYOUTS = ["imageLeft", "imageRight"] as const;
export type BannerLayout = (typeof BANNER_LAYOUTS)[number];

export type SaveBannerInput = {
  id?: string;
  slot?: "hero" | "banner";
  enabled: boolean;
  sortOrder: number;
  eyebrow: string;
  title: string;
  body: string;
  cycleWords: string;
  caption: string;
  ctaLabel: string;
  ctaHref: string;
  imageUrl: string;
  imageAlt: string;
  layout: BannerLayout;
};
