# Shoptees — UI Revamp Design Brief

**Phase 1 deliverable. Nothing in this document touches code until approved.**

The current site reads as "tasteful editorial template": serif display
(Fraunces), italic accents, cream-adjacent neutrals, polite hairlines. It is
clean but it is not *streetwear* — it whispers where the brand should talk
loud. This brief replaces the identity wholesale.

---

## 1. Attitude

Shoptees sits where Lagos street culture meets football terrace culture —
jerseys and cut-and-sew, sold by the piece or by the carton. The visual
language should feel like:

- a matchday programme photocopied and re-stapled in a Surulere print shop
- shipping cartons, customs stamps, waybills, SKU labels
- terrace chants set in type: loud, compressed, repeated

**One line:** *industrial freight meets matchday.* Not "dark mode fashion
site" — a brand with ink on its hands.

---

## 2. Typography (full replacement)

| Role | Face | Why |
|---|---|---|
| Display | **Archivo** (variable, `wdth` axis 62–125, weights 500–900) — used as **Archivo Expanded Black** for headlines and **Archivo Condensed** for tickers/stamps | One family covers ultra-expanded hero type *and* compressed marquee type, so the whole site shares DNA. Hard grotesque skeleton, zero softness, reads "athletics + industry". Loaded via `next/font/google` with the width axis — no extra requests. |
| Body / UI | **Archivo** (normal width, 400–600) | Same family at text sizes keeps the system tight; grotesque body suits spec-sheet product copy. |
| Mono / labels | **Martian Mono** (400–700) | Prices, SKUs, counts, timestamps, "stamp" chips. Wide, slabby, machine-printed feel — much more character than JetBrains Mono. Used small and in uppercase everywhere. |

Conventions: headlines are **UPPERCASE, expanded, tracking -2%**, frequently
broken mid-word across lines like stencilled crate text. Prices and metadata
are always mono. The italic-serif accent voice is retired completely.

## 3. Color

| Token | Hex | Use |
|---|---|---|
| `chalk` | `#F4F3EF` | Page ground — warm chalk, not gallery white. |
| `tar` | `#0D0D0C` | Ink, blocks, inverted sections. |
| `tar-soft` | `#3D3C38` | Secondary text. |
| `hazard` | `#FF3D00` | THE brand accent. Safety-orange / hazard-label red-orange. CTAs, sale flashes, stamps, live indicators. |
| `pitch` | `#0E7A3C` | Secondary accent — Super Eagles pitch green. Used sparingly: "in stock", success states, occasional stamp. A quiet Nigeria nod without flag-waving. |
| `line` | `#D9D7CF` | Hairlines on chalk. |
| `line-dark` | `#27261F` | Hairlines on tar. |

Rules: large fields are only chalk or tar. Hazard never exceeds ~10% of any
viewport. No gradients anywhere — flat ink only. Grain/noise overlay stays
(strengthened slightly on tar sections), because print texture is the brand.

## 4. Graphic motifs

- **Stamps & waybills**: rotated 1–2° bordered mono chips ("PAID", "NEW IN",
  "LAGOS → EVERYWHERE", order numbers). Custom inline SVG, no emoji ever.
- **Crate rules**: thick 2–3px rules and corner brackets replacing the
  current 1px-hairline-everywhere look. Hairlines remain for tables/metadata.
- **Barcode/SKU strip**: decorative barcode mark next to prices and on
  order confirmation — generated SVG, consistent everywhere.
- **Tickers**: marquee strips between sections (already exist — re-set in
  condensed Archivo, more aggressive).
- **Edges**: sharp. `border-radius: 0` globally except fully-round pills for
  counts/badges. Nothing in between.

## 5. Motion language

Principles: **snap, don't float.** Easing is `cubic-bezier(.16,1,.3,1)`
(hard out), durations 150–450ms. Marquees are the only infinite motion.
Everything honors `prefers-reduced-motion` (existing CSS hook retained) and
animates only `transform`/`opacity` for 60fps.

- Scroll entrances: blocks slide up 12–16px with a slight clip-path reveal,
  staggered ~60ms — once, not scroll-scrubbed.
- Hover on images: instant crop-zoom (1.04) + second image swap where
  available.
- Buttons: background wipes (left→right fill), not color fades.
- Stamps: "thunk" in — scale 1.15→1 with 1.5° rotation settle.

## 6. Three signature interactive moments

1. **Hero stamp-clock** (landing): the hero keeps the live Lagos ticker but
   re-cast as a rotating rubber-stamp badge (SVG, circular text
   "SHOPTEES · LAGOS · WAT") that spins slowly and *thunks* a re-stamp each
   minute. The cycling headline word stays, re-set in expanded Archivo with a
   hard clip-reveal instead of the current soft rise.
2. **Jersey-number size picker** (product detail): sizes rendered as big
   mono squad-number chips; picking one "stamps" it (scale-settle + hazard
   fill) and the price line live-updates with a barcode flick. Out-of-stock
   chips are struck through like a crossed-out team sheet.
3. **Waybill cart** (cart + add-to-cart): adding to cart fires a "PACKED"
   stamp on the button and the cart count pill does a hard tick-up; the cart
   page itself is laid out as a waybill/packing-slip document — mono columns,
   perforated rule above the total, order summary as a freight label.

## 7. Per-page intent (one line each)

- **Landing**: full-bleed campaign hero (kept, re-skinned), denser "new in"
  rail with oversized names, ticker, categories as crate-label tiles.
- **Shop**: filter panel as a spec-sheet sidebar; product grid with
  oversized lowercase-to-UPPERCASE names, mono prices, hover swap.
- **Product detail**: editorial left image column, spec-sheet right column,
  jersey-number sizes, sticky add-to-cart bar on mobile.
- **Collections**: each line gets a full-width "crate lid" banner — name
  huge, stamped metadata.
- **Cart/Checkout/Success**: the waybill metaphor end-to-end; success page
  is a printed receipt with a big PAID stamp.
- **About/Contact/404/legal**: type-led, cheap to do, same stamps + rules.

## 8. Constraint compliance

Mobile-first (375px audited every phase), WCAG-reasonable contrast
(hazard on chalk used at large sizes only; body text is tar on chalk),
visible `:focus-visible` rings (2px hazard offset), zero logic changes.

---

**STOP — awaiting approval before Phase 2 (design system build).**
