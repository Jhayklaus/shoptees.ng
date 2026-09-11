// The official Shptz Wrld taxonomy, transcribed from the Collection Archive
// (internal, 56 flats across 6 collections).
//
// The archive's own sorting rule is the one this app already models:
//
//   "a collection is defined by the graphic on the chest, not by the garment
//    or the colourway. A category is the garment type."
//
// So Collection = the chest graphic (Trap House, Urban Classic…) and
// Category = the silhouette (Polos, Jerseys, Buckets…). Slugs follow the
// archive's own filing convention, collections/<collection>/<category>/…,
// so a slug here and a path in the artwork archive are the same string.
//
// Counts are the archive's flat counts, kept as a comment rather than data:
// they describe artwork on file, not sellable stock, and would go stale the
// moment a colourway is added. They drive sortOrder and nothing else.

export type TaxonomyCollection = {
  slug: string;
  name: string;
  /** Reference code used on line sheets and costings (TH-01, UC-04…). */
  code: string;
  /** What puts a garment in this collection. */
  definingGraphic: string;
  /** Storefront copy, drawn from the archive's own description. */
  description: string;
  sortOrder: number;
};

export type TaxonomyCategory = {
  slug: string;
  name: string;
  sortOrder: number;
};

/**
 * Current collections in descending order of size, previous season last —
 * the archive's own ordering.
 */
export const COLLECTIONS: TaxonomyCollection[] = [
  {
    slug: "trap-house",
    name: "Trap House",
    code: "TH",
    definingGraphic: "Flaming-dice mark, TRAP HOUSE set across the die faces",
    description:
      "The accessories and casualwear engine of the line — the only collection that runs headwear, socks and bottoms. Headwear three ways; bottoms in denim, mesh and fleece. One mark, applied at every scale from a sock cuff to an all-over beanie repeat.",
    sortOrder: 1, // 25 flats · 9 categories
  },
  {
    slug: "urban-classic",
    name: "Urban Classic",
    code: "UC",
    definingGraphic: "Arched gothic URBAN CLASSIC wordmark",
    description:
      "Three treatments of one name: a blackletter front on the football jersey, a gold script on the crew tees, and the arched graffiti wordmark on the polos — running as two designs, one pairing the wordmark with the crest and one letting it stand alone.",
    sortOrder: 2, // 7 flats · 3 categories
  },
  {
    slug: "shptz-wrld",
    name: "Shptz Wrld",
    code: "SW",
    definingGraphic: "House marks only — laurel seal or rampant-horse crest",
    description:
      "The core programme. No slogan on the chest, so these carry the range on the house marks alone — the laurel seal or the rampant-horse crest — and sit under every other collection as the blank.",
    sortOrder: 3, // 6 flats · 1 category
  },
  {
    slug: "fight-or-flight",
    name: "Fight or Flight",
    code: "FF",
    definingGraphic: "“FIGHT OR FLIGHT” chest script + graffiti brick-wall back print",
    description:
      "Bubble script at the left chest, backed by a writer on a ladder tagging Shptz across a brick wall. The back print is the whole point: the front hit is small, the wall is the garment.",
    sortOrder: 4, // 4 flats · 1 category
  },
  {
    slug: "live-laugh-love",
    name: "Live.Laugh.Love.",
    code: "LLL",
    definingGraphic: "Copperplate “Live.Laugh.Love.” chest script",
    description:
      "The script runs across the chest over the crest and the Urban Classic wordmark, and it is what reads first. The smallest group on file, and the only one that exists in a single silhouette.",
    sortOrder: 5, // 3 flats · 1 category
  },
  {
    slug: "previous-season",
    name: "Previous Season",
    code: "PS",
    definingGraphic: "Four chest graphics — a jersey programme predating the current line",
    description:
      "The earlier drop, kept apart from the current collections because it is a season rather than a graphic. Football jerseys throughout, on four chest graphics that appear nowhere in the current line: the SHPTZ WORLDWIDE oval, a chunky URBAN front, a graffiti CLASSIC lock-up over an all-over squiggle, and the SHOPTEES striped long sleeve. The jerseys carry the number 25.",
    sortOrder: 6, // 11 flats · 2 categories
  },
];

/** Garment types, ordered by how much of the archive each holds. */
export const CATEGORIES: TaxonomyCategory[] = [
  { slug: "polos", name: "Polos", sortOrder: 1 }, // 13 flats
  { slug: "jerseys", name: "Jerseys", sortOrder: 2 }, // 11
  { slug: "long-sleeves", name: "Long sleeves", sortOrder: 3 }, // 6
  { slug: "tees", name: "Tees", sortOrder: 4 }, // 6
  { slug: "buckets", name: "Buckets", sortOrder: 5 }, // 3
  { slug: "caps", name: "Caps", sortOrder: 6 }, // 3
  { slug: "hoodies", name: "Hoodies", sortOrder: 7 }, // 3
  { slug: "socks", name: "Socks", sortOrder: 8 }, // 3
  { slug: "beanies", name: "Beanies", sortOrder: 9 }, // 2
  { slug: "denim-shorts", name: "Denim shorts", sortOrder: 10 }, // 2
  { slug: "sweatpants", name: "Sweatpants", sortOrder: 11 }, // 2
  { slug: "long-sleeve-jerseys", name: "Long-sleeve jerseys", sortOrder: 12 }, // 1
  { slug: "shorts", name: "Shorts", sortOrder: 13 }, // 1
];

/**
 * Which categories the archive files under each collection. Not enforced —
 * a product's category is its own field — but useful for checking a
 * catalogue against the archive, and for seeding sensible sample data.
 */
export const COLLECTION_CATEGORIES: Record<string, string[]> = {
  "trap-house": [
    "long-sleeves",
    "hoodies",
    "caps",
    "socks",
    "buckets",
    "beanies",
    "denim-shorts",
    "sweatpants",
    "shorts",
  ],
  "urban-classic": ["polos", "tees", "jerseys"],
  "shptz-wrld": ["polos"],
  "fight-or-flight": ["tees"],
  "live-laugh-love": ["polos"],
  "previous-season": ["jerseys", "long-sleeve-jerseys"],
};

/**
 * House marks run across the whole range, so finding one on a garment says
 * nothing about which collection it belongs to. Kept here so nobody is
 * tempted to turn them into collections later.
 */
export const HOUSE_MARKS = [
  {
    name: "Shptz Wrld crest",
    form: "Rampant-horse shield, ribbon beneath",
    appearsOn: "Chest of most polos and the Urban Classic jersey",
  },
  {
    name: "SHPTZ·WRLD wordmark",
    form: "Small block wordmark",
    appearsOn: "Back neck of nearly every top on file",
  },
  {
    name: "Shptz Wrld laurel seal",
    form: "S monogram in a laurel wreath, star above",
    appearsOn: "Chest of two core polos only",
  },
] as const;
