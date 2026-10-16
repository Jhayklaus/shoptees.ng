// Constants safe to import from both client and server code.

export const ORDER_STATUSES = ["PENDING", "PAID", "FULFILLED", "CANCELLED"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

// Product lifecycle.
//
// COMING_SOON sits between DRAFT and ACTIVE, and it exists because a drop
// rolls out in waves. The pieces that are not in the first wave are not
// secret — they are the reason to come back — so hiding them as drafts is
// the wrong tool. A COMING_SOON piece is listed, blurred and tagged on the
// storefront and its page is reachable, but it cannot be added to a cart or
// bought, and an ACTIVE piece always sorts ahead of it.
export const PRODUCT_STATUSES = ["DRAFT", "COMING_SOON", "ACTIVE", "ARCHIVED"] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

/**
 * The two statuses a customer may see. Everything the storefront queries
 * filters on this; DRAFT and ARCHIVED are admin-only and 404 in public.
 */
export const STOREFRONT_PRODUCT_STATUSES = ["ACTIVE", "COMING_SOON"] as const;

/**
 * May a customer see a product in this status at all?
 *
 * The guards in the public routes read a `string` off a Prisma row, so this
 * narrows rather than making every call site cast the tuple to string[].
 */
export function isStorefrontStatus(
  status: string,
): status is (typeof STOREFRONT_PRODUCT_STATUSES)[number] {
  return (STOREFRONT_PRODUCT_STATUSES as readonly string[]).includes(status);
}

/** Admin-facing names. The raw values are shouty and carry an underscore. */
export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  DRAFT: "Draft",
  COMING_SOON: "Coming soon",
  ACTIVE: "Active",
  ARCHIVED: "Archived",
};

// Collections deliberately have no COMING_SOON of their own: a collection
// reads as coming soon when none of its products are ACTIVE, which is
// derived from the products rather than set by hand. Two switches for one
// fact go out of sync the first week — a line whose pieces all went live
// would still be flagged "coming soon" until someone remembered to flip it.
export const COLLECTION_STATUSES = ["DRAFT", "ACTIVE", "ARCHIVED"] as const;
export type CollectionStatus = (typeof COLLECTION_STATUSES)[number];

// ── Shipping destinations ────────────────────────────────────────────────
// Checkout is limited to countries we actually ship to. `states` doubles as
// the validation list for the address form, so adding a country here is the
// only change needed to open a new destination.

export const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
  "FCT - Abuja", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina",
  "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo",
  "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
] as const;

export const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
  "Connecticut", "Delaware", "District of Columbia", "Florida", "Georgia",
  "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky",
  "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
  "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota",
  "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island",
  "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont",
  "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming",
] as const;

export type ShippingCountry = {
  name: string;
  /** Label for the region field — "State" reads wrong in most of the world. */
  stateLabel: string;
  states: readonly string[];
  postalLabel: string;
  postalRequired: boolean;
  /** Currency this destination is presented in by default. */
  currency: "NGN" | "USD";
};

export const SHIPPING_COUNTRIES: Record<string, ShippingCountry> = {
  Nigeria: {
    name: "Nigeria",
    stateLabel: "State",
    states: NIGERIAN_STATES,
    postalLabel: "Postal code (optional)",
    postalRequired: false,
    currency: "NGN",
  },
  "United States": {
    name: "United States",
    stateLabel: "State",
    states: US_STATES,
    postalLabel: "ZIP code",
    postalRequired: true,
    currency: "USD",
  },
};

export const SHIPPING_COUNTRY_NAMES = Object.keys(SHIPPING_COUNTRIES);
