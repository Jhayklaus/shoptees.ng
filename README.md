# Shoptees

A production-grade Next.js storefront for **Shoptees**, a Nigerian fashion/clothing studio. Built with Next.js 16 (App Router), TypeScript, Tailwind v4, and Zustand.

> **Status:** scaffolded with clearly-labeled placeholders. Real brand copy, products, photography, prices, and Paystack keys are not yet in. See `BRAND_BRIEF.md` and `OPEN_QUESTIONS.md`.

---

## Stack

| | |
|---|---|
| Framework | Next.js 16.2 (App Router, Turbopack) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 (CSS-first config in `globals.css`) |
| State | Zustand 5 with `persist` middleware → `localStorage` |
| Icons | lucide-react |
| Type | Fraunces (display), Instrument Serif (italic accent), JetBrains Mono (labels) — all via `next/font/google` |
| Payments | **Paystack** (NGN). SDK not yet installed — gated behind HILCS #3. |
| Deployment | Vercel (recommended) |

---

## Local development

```bash
# 1. Install
npm install

# 2. Configure env
cp .env.local.example .env.local
# fill in NEXT_PUBLIC_SITE_URL etc.

# 3. Dev server
npm run dev
# → http://localhost:3000

# 4. Production build
npm run build
npm start

# 5. Lint
npm run lint
```

Node ≥ 20.19 is recommended (the toolchain warns on Node 23 LTS-ish builds; runs fine on Node 24+).

---

## Project layout

```
src/
├── app/
│   ├── layout.tsx              fonts, root metadata, Organization JSON-LD, header/footer
│   ├── page.tsx                Home (Hero · Featured · Manifesto · Editorial · Newsletter)
│   ├── globals.css             Tailwind v4 + design tokens (paper / ink / vermillion)
│   ├── shop/page.tsx           catalogue
│   ├── shop/[slug]/page.tsx    product detail + Product JSON-LD
│   ├── cart/page.tsx
│   ├── checkout/page.tsx       form + Paystack stub (disabled until keys land)
│   ├── checkout/success/page.tsx
│   ├── about/page.tsx
│   ├── contact/page.tsx
│   ├── api/paystack/{initialize,verify}/route.ts   501 stubs
│   ├── sitemap.ts · robots.ts · not-found.tsx
├── components/
│   ├── layout/   Header · Footer · AnnouncementBar
│   ├── marketing/ Hero · FeaturedGrid · Manifesto · EditorialSplit · Newsletter
│   ├── product/  ProductCard · ProductDetail
│   ├── cart/     CartButton · CartView
│   ├── checkout/ CheckoutForm
│   └── contact/  ContactForm
├── store/
│   ├── cart.ts        zustand + persist
│   └── useHydrated.ts useSyncExternalStore-based hydration gate
├── lib/  utils · seo · jsonld · paystack (stub)
├── data/products.ts   placeholder catalogue (8 entries, all clearly labeled)
├── config/ site.ts · nav.ts
└── types/index.ts
public/placeholders/   six SVG placeholders (cream + ink + vermillion)
```

---

## Environment variables

`.env.local` (never commit):

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Paystack — empty until HILCS #3
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=
PAYSTACK_SECRET_KEY=
```

When unset, `/api/paystack/*` returns `501` and the checkout submit button is disabled with a placeholder banner. No silent failures.

---

## Deploying to Vercel

1. Push to a GitHub repo.
2. `vercel link` (or import via the dashboard — framework: Next.js, root: `/`).
3. Add env vars in **Project Settings → Environment Variables** (don't commit them):
   - `NEXT_PUBLIC_SITE_URL` = your production URL
   - `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` (after HILCS #3)
   - `PAYSTACK_SECRET_KEY` (after HILCS #3)
4. `vercel --prod` (or merge to `main`).
5. Set the **production domain** in `src/config/site.ts → siteConfig.url` so SEO + JSON-LD URLs are correct.

> **Do not run `vercel --prod` without HILCS #4 explicit approval.**

---

## Aesthetic direction

Editorial/brutalist with West African warmth — paper cream `#F4EFE6`, deep ink `#0B0B0A`, single accent of burnt vermillion `#D4441E`. Display in Fraunces with the optical-size and WONK axes turned up; italic asides in Instrument Serif; microcopy and prices in JetBrains Mono small-caps. Asymmetric magazine grid, marquee announcement bar, faint film-grain overlay.

This is intentional and committed — not a generic Inter/purple-gradient site.

---

## What's incomplete (for handoff)

See **`OPEN_QUESTIONS.md`** for the full list. Major buckets:

- All real brand copy (tagline, founder story, manifesto)
- All real product data (names, prices, sizes, photography)
- Paystack SDK install + keys
- Mailing-list provider (newsletter form)
- Transactional email provider (contact form)
- Legal pages (Privacy, Terms, Refund/Return) — currently 404
- Real OG image / favicon / logo

---

## Cart persistence

Cart state lives in `src/store/cart.ts` via Zustand with the `persist` middleware writing to `localStorage` under the key `shoptees-cart`. On hard refresh the cart re-hydrates client-side; `src/store/useHydrated.ts` (built on `useSyncExternalStore` + `persist.onFinishHydration`) gates render-time UI to avoid SSR/CSR mismatches.

---

## Image policy

Per the project brief: never hotlink Instagram/X CDN images. Currently using six locally-authored SVGs in `public/placeholders/` — clearly marked as placeholders both visually and in ALT text. Real photography should be uploaded into `public/products/` and referenced from `src/data/products.ts`.

`next.config.ts` has `dangerouslyAllowSVG: true` because the SVGs are first-party files we control. **Remove this option once you switch to raster product photography**, or restrict it via a stricter CSP.
