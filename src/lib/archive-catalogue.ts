// The archive's 56 flats, grouped into the designs a customer actually buys.
//
// A flat is one colourway of one design. The shop sells the design — "Urban
// Classic polo, wordmark + crest" — and the colourway is a variant, which is
// how the merch reference already thinks about it: one hero colourway is
// sampled and "every other colourway stays on the line sheet and is offered
// to customers as 'also available in —'".
//
// 23 designs · 56 colourways. Reference codes are the archive's own, stable
// enough to quote on a line sheet or a costing.
//
// `sampleCostNGN` is what ONE SAMPLE COSTS TO PRODUCE, taken from the Merch &
// Expense Reference. It is NOT a retail price and must never be used as one —
// that document is a budget for a photoshoot sample run, and even it flags
// that the figures may be batch rather than per-unit. Products are imported
// at ₦0 so a price has to be set deliberately before anything goes live.

export type ArchiveColourway = {
  /** Archive reference code, e.g. "TH-01". */
  code: string;
  /** Human name for the colourway — becomes the variant colour. */
  name: string;
  /** Path inside the archive zip, relative to its `collections/` root. */
  file: string;
};

export type ArchiveDesign = {
  slug: string;
  name: string;
  /** Collection slug — the chest graphic. */
  collection: string;
  /** Category slug — the garment type. */
  category: string;
  description: string;
  /** Production cost of one sample, in naira. NOT a retail price. */
  sampleCostNGN: number | null;
  /** Sizes to generate variants for, per colourway. */
  sizes: readonly string[];
  colourways: ArchiveColourway[];
};

const APPAREL = ["S", "M", "L", "XL"] as const;
const ONE_SIZE = ["One size"] as const;

export const ARCHIVE_DESIGNS: ArchiveDesign[] = [
  // ── Trap House ────────────────────────────────────────────────────────
  {
    slug: "trap-house-crew-long-sleeve",
    name: "Trap House crew long sleeve",
    collection: "trap-house",
    category: "long-sleeves",
    description:
      "Solid-body crew long sleeve carrying the flaming-dice mark, TRAP HOUSE spelled across the die faces.",
    sampleCostNGN: 17000,
    sizes: APPAREL,
    colourways: [
      { code: "TH-01", name: "Royal blue", file: "trap-house/long-sleeves/ls-tee-royal-blue_nnshptzx23.png" },
      { code: "TH-03", name: "Black / pink", file: "trap-house/long-sleeves/ls-tee-black-pink_nnshptzx25.png" },
      { code: "TH-05", name: "Red / white", file: "trap-house/long-sleeves/ls-tee-red-white_nnshptzx27.png" },
    ],
  },
  {
    slug: "trap-house-raglan-long-sleeve",
    name: "Trap House raglan long sleeve",
    collection: "trap-house",
    category: "long-sleeves",
    description:
      "Raglan long sleeve, white body with contrast sleeves, flaming-dice mark at the chest.",
    sampleCostNGN: 17000,
    sizes: APPAREL,
    colourways: [
      { code: "TH-02", name: "White / blue", file: "trap-house/long-sleeves/ls-raglan-white-blue_nnshptzx24.png" },
      { code: "TH-04", name: "White / black", file: "trap-house/long-sleeves/ls-raglan-white-black_nnshptzx26.png" },
      { code: "TH-06", name: "White / red", file: "trap-house/long-sleeves/ls-raglan-white-red_nnshptzx28.png" },
    ],
  },
  {
    slug: "trap-house-hoodie",
    name: "Trap House hoodie",
    collection: "trap-house",
    category: "hoodies",
    description:
      "Dice chest hit, Fight or Flight graffiti brick-wall print across the back. The black colourway runs with a blank back.",
    sampleCostNGN: 25000,
    sizes: APPAREL,
    colourways: [
      { code: "TH-07", name: "Black (blank back)", file: "trap-house/hoodies/hoodie-black-blank-back_nnshptzx49.png" },
      { code: "TH-08", name: "Red (graffiti back)", file: "trap-house/hoodies/hoodie-red-graffiti-back_nnshptzx51.png" },
      { code: "TH-09", name: "White (graffiti back)", file: "trap-house/hoodies/hoodie-white-graffiti-back_nnshptzx52.png" },
    ],
  },
  {
    slug: "trap-house-snapback",
    name: "Trap House snapback",
    collection: "trap-house",
    category: "caps",
    description: "Five-panel snapback, white front panel, tonal brim, dice mark at the front.",
    sampleCostNGN: 10000,
    sizes: ONE_SIZE,
    colourways: [
      { code: "TH-10", name: "Black / white", file: "trap-house/caps/snapback-black-white_nnshptzx30.png" },
      { code: "TH-11", name: "Red / white", file: "trap-house/caps/snapback-red-white_nnshptzx31.png" },
      { code: "TH-12", name: "Blue / white", file: "trap-house/caps/snapback-blue-white_nnshptzx32.png" },
    ],
  },
  {
    slug: "trap-house-crew-socks",
    name: "Trap House crew socks",
    collection: "trap-house",
    category: "socks",
    description: "Ribbed crew sock, flaming dice at the cuff.",
    sampleCostNGN: 8000,
    sizes: ONE_SIZE,
    colourways: [
      { code: "TH-13", name: "White", file: "trap-house/socks/crew-socks-white_nnshptzx4.png" },
      { code: "TH-14", name: "Red", file: "trap-house/socks/crew-socks-red_nnshptzx5.png" },
      { code: "TH-15", name: "Black", file: "trap-house/socks/crew-socks-black_nnshptzx6.png" },
    ],
  },
  {
    slug: "trap-house-bucket-hat",
    name: "Trap House bucket hat",
    collection: "trap-house",
    category: "buckets",
    description: "Bucket hat with the dice mark at the front panel.",
    sampleCostNGN: 10000,
    sizes: ONE_SIZE,
    colourways: [
      { code: "TH-16", name: "Black / pink dice", file: "trap-house/buckets/bucket-hat-black-pink-dice_shptzBKT1.png" },
      { code: "TH-17", name: "White / pink dice", file: "trap-house/buckets/bucket-hat-white-pink-dice_shptzBKT2.png" },
      { code: "TH-18", name: "Red / white dice", file: "trap-house/buckets/bucket-hat-red-white-dice_shptzBKT3.png" },
    ],
  },
  {
    slug: "trap-house-beanie",
    name: "Trap House beanie",
    collection: "trap-house",
    category: "beanies",
    description: "Solid cuffed beanie, pink dice logo.",
    sampleCostNGN: 10000,
    sizes: ONE_SIZE,
    colourways: [
      { code: "TH-19", name: "Black / pink logo", file: "trap-house/beanies/beanie-black-pink-logo_nnshptzx9.png" },
    ],
  },
  {
    slug: "trap-house-allover-beanie",
    name: "Trap House all-over beanie",
    collection: "trap-house",
    category: "beanies",
    description: "Cuffed beanie in an all-over dice repeat — a separate design from the solid, not a colourway of it.",
    sampleCostNGN: 10000,
    sizes: ONE_SIZE,
    colourways: [
      { code: "TH-20", name: "All-over dice repeat", file: "trap-house/beanies/beanie-allover-dice_nnshptzx10.png" },
    ],
  },
  {
    slug: "trap-house-denim-shorts",
    name: "Trap House denim shorts",
    collection: "trap-house",
    category: "denim-shorts",
    description: "Baggy jorts with embroidered dice back pockets.",
    sampleCostNGN: 16000,
    sizes: APPAREL,
    colourways: [
      { code: "TH-21", name: "Washed blue", file: "trap-house/denim-shorts/jorts-washed-blue_nnshptzx1.png" },
      { code: "TH-22", name: "Black", file: "trap-house/denim-shorts/jorts-black_nnshptzx2.png" },
    ],
  },
  {
    slug: "trap-house-sweatpants",
    name: "Trap House sweatpants",
    collection: "trap-house",
    category: "sweatpants",
    description: "Baggy drawcord sweatpants, dice at the hip.",
    // Not costed in the merch reference — sweats aren't in the sample run.
    sampleCostNGN: null,
    sizes: APPAREL,
    colourways: [
      { code: "TH-23", name: "Black", file: "trap-house/sweatpants/sweatpants-black_shptzPNTSone.png" },
      { code: "TH-24", name: "Olive", file: "trap-house/sweatpants/sweatpants-olive_shptzPNTStwo.png" },
    ],
  },
  {
    slug: "trap-house-mesh-shorts",
    name: "Trap House mesh shorts",
    collection: "trap-house",
    category: "shorts",
    description: "Black mesh shorts with pink dice at the hem.",
    sampleCostNGN: 16000,
    sizes: APPAREL,
    colourways: [
      { code: "TH-25", name: "Black mesh", file: "trap-house/shorts/mesh-shorts-black_nnshptzx3.png" },
    ],
  },

  // ── Urban Classic ─────────────────────────────────────────────────────
  {
    slug: "urban-classic-polo-wordmark-crest",
    name: "Urban Classic polo — wordmark + crest",
    collection: "urban-classic",
    category: "polos",
    description:
      "Boxy rugby polo with the arched graffiti URBAN CLASSIC wordmark paired with the rampant-horse crest.",
    sampleCostNGN: 17000,
    sizes: APPAREL,
    colourways: [
      { code: "UC-01", name: "White / green", file: "urban-classic/polos/polo-white-green-crest_nnshptzx15.png" },
      { code: "UC-02", name: "Black / green", file: "urban-classic/polos/polo-black-green-crest_nnshptzx17.png" },
    ],
  },
  {
    slug: "urban-classic-polo-wordmark",
    name: "Urban Classic polo — wordmark",
    collection: "urban-classic",
    category: "polos",
    description: "The same boxy rugby polo running the arched wordmark alone, without the crest.",
    sampleCostNGN: 17000,
    sizes: APPAREL,
    colourways: [
      { code: "UC-03", name: "Red / white", file: "urban-classic/polos/polo-red-white-wordmark_nnshptzx16.png" },
      { code: "UC-04", name: "Black / green", file: "urban-classic/polos/polo-black-green-wordmark_nnshptzx18.png" },
    ],
  },
  {
    slug: "urban-classic-tee",
    name: "Urban Classic tee",
    collection: "urban-classic",
    category: "tees",
    description: "Crew tee with the URBAN CLASSIC name in gold script across the chest.",
    sampleCostNGN: 17000,
    sizes: APPAREL,
    colourways: [
      { code: "UC-05", name: "White / gold", file: "urban-classic/tees/tee-white-gold-script_nnshptzx33.png" },
      { code: "UC-06", name: "Black / gold", file: "urban-classic/tees/tee-black-gold-script_nnshptzx35.png" },
    ],
  },
  {
    slug: "urban-classic-football-jersey",
    name: "Urban Classic football jersey",
    collection: "urban-classic",
    category: "jerseys",
    description: "Football jersey with the blackletter URBAN CLASSIC front.",
    sampleCostNGN: 17000,
    sizes: APPAREL,
    colourways: [
      { code: "UC-07", name: "White / maroon", file: "urban-classic/jerseys/football-jersey-white-maroon_nnshptzx29.png" },
    ],
  },

  // ── Shptz Wrld ────────────────────────────────────────────────────────
  {
    slug: "shptz-wrld-polo-laurel-seal",
    name: "Shptz Wrld polo — laurel seal",
    collection: "shptz-wrld",
    category: "polos",
    description:
      "Core polo carrying the laurel seal at the chest — the S monogram in a wreath, star above. No slogan.",
    sampleCostNGN: 17000,
    sizes: APPAREL,
    colourways: [
      { code: "SW-01", name: "Black / red", file: "shptz-wrld/polos/polo-black-red-seal_nnshptzx11.png" },
      { code: "SW-02", name: "White / red", file: "shptz-wrld/polos/polo-white-red-seal_nnshptzx13.png" },
    ],
  },
  {
    slug: "shptz-wrld-polo-crest",
    name: "Shptz Wrld polo — crest",
    collection: "shptz-wrld",
    category: "polos",
    description: "Core polo carrying the rampant-horse crest at the chest. No slogan.",
    sampleCostNGN: 17000,
    sizes: APPAREL,
    colourways: [
      { code: "SW-03", name: "Green / black", file: "shptz-wrld/polos/polo-green-black-crest_nnshptzx19.png" },
      { code: "SW-04", name: "Red tonal", file: "shptz-wrld/polos/polo-red-tonal-crest_nnshptzx20.png" },
      { code: "SW-05", name: "Black / green", file: "shptz-wrld/polos/polo-black-green-crest_nnshptzx21.png" },
      { code: "SW-06", name: "White / green", file: "shptz-wrld/polos/polo-white-green-crest_nnshptzx22.png" },
    ],
  },

  // ── Fight or Flight ───────────────────────────────────────────────────
  {
    slug: "fight-or-flight-tee",
    name: "Fight or Flight tee",
    collection: "fight-or-flight",
    category: "tees",
    description:
      "FIGHT OR FLIGHT bubble script at the left chest, backed by a writer on a ladder tagging Shptz across a brick wall. The black colourway runs the front hit only.",
    sampleCostNGN: 17000,
    sizes: APPAREL,
    colourways: [
      { code: "FF-01", name: "Black (front hit only)", file: "fight-or-flight/tees/tee-black-front-hit-only_nnshptzx45.png" },
      { code: "FF-02", name: "Royal blue", file: "fight-or-flight/tees/tee-royal-blue-graffiti-back_nnshptzx46.png" },
      { code: "FF-03", name: "Red", file: "fight-or-flight/tees/tee-red-graffiti-back_nnshptzx47.png" },
      { code: "FF-04", name: "White", file: "fight-or-flight/tees/tee-white-graffiti-back_nnshptzx48.png" },
    ],
  },

  // ── Live.Laugh.Love. ──────────────────────────────────────────────────
  {
    slug: "live-laugh-love-polo",
    name: "Live.Laugh.Love. polo",
    collection: "live-laugh-love",
    category: "polos",
    description:
      "Copperplate Live.Laugh.Love. script across the chest, over the crest and the Urban Classic wordmark.",
    sampleCostNGN: 17000,
    sizes: APPAREL,
    colourways: [
      { code: "LLL-01", name: "Red / white collar", file: "live-laugh-love/polos/polo-red-white-collar_nnshptzx8.png" },
      { code: "LLL-02", name: "White / pink", file: "live-laugh-love/polos/polo-white-pink_nnshptzx12.png" },
      { code: "LLL-03", name: "Black / pink", file: "live-laugh-love/polos/polo-black-pink_nnshptzx14.png" },
    ],
  },

  // ── Previous Season ───────────────────────────────────────────────────
  {
    slug: "previous-season-worldwide-jersey",
    name: "Shptz Worldwide jersey",
    collection: "previous-season",
    category: "jerseys",
    description: "Football jersey carrying the SHPTZ WORLDWIDE oval. Numbered 25.",
    sampleCostNGN: 17000,
    sizes: APPAREL,
    colourways: [
      { code: "PS-01", name: "White / green", file: "previous-season/jerseys/jersey-worldwide-white-green_Nshpshp-green.png" },
      { code: "PS-02", name: "White / pink", file: "previous-season/jerseys/jersey-worldwide-white-pink_Nshpshp.png" },
      { code: "PS-03", name: "Black / pink", file: "previous-season/jerseys/jersey-worldwide-black-pink_shpshp2.png" },
    ],
  },
  {
    slug: "previous-season-urban-jersey",
    name: "URBAN front jersey",
    collection: "previous-season",
    category: "jerseys",
    description: "Football jersey with the chunky URBAN front. Numbered 25.",
    sampleCostNGN: 17000,
    sizes: APPAREL,
    colourways: [
      { code: "PS-04", name: "Blue", file: "previous-season/jerseys/jersey-urban-blue_shp1a.png" },
      { code: "PS-05", name: "Green", file: "previous-season/jerseys/jersey-urban-green_shp1b.png" },
      { code: "PS-06", name: "Black", file: "previous-season/jerseys/jersey-urban-black_shp2a.png" },
      { code: "PS-07", name: "Red", file: "previous-season/jerseys/jersey-urban-red_shp2b.png" },
    ],
  },
  {
    slug: "previous-season-classic-jersey",
    name: "CLASSIC squiggle jersey",
    collection: "previous-season",
    category: "jerseys",
    description:
      "Football jersey with the graffiti CLASSIC lock-up over an all-over squiggle. Numbered 25.",
    sampleCostNGN: 17000,
    sizes: APPAREL,
    colourways: [
      { code: "PS-08", name: "White / pink", file: "previous-season/jerseys/jersey-classic-white-pink_shp3.png" },
      { code: "PS-09", name: "Pink / orange", file: "previous-season/jerseys/jersey-classic-pink-orange_shp4.png" },
      { code: "PS-10", name: "Red / white", file: "previous-season/jerseys/jersey-classic-red-white_shp5.png" },
    ],
  },
  {
    slug: "previous-season-shoptees-long-sleeve-jersey",
    name: "Shoptees striped long-sleeve jersey",
    collection: "previous-season",
    category: "long-sleeve-jerseys",
    description:
      "Striped long-sleeve jersey. Reissued as a 26 — this is the reissue; the 25 it replaces is out of the archive.",
    sampleCostNGN: 17000,
    sizes: APPAREL,
    colourways: [
      { code: "PS-11", name: "Black / blue stripe", file: "previous-season/long-sleeve-jerseys/ls-jersey-shoptees-black-blue_shptzBLU.png" },
    ],
  },
];

/** Every flat referenced above — used to check the catalogue against the zip. */
export function allArchiveFiles(): string[] {
  return ARCHIVE_DESIGNS.flatMap((d) => d.colourways.map((c) => c.file));
}
