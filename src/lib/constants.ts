// Constants safe to import from both client and server code.

export const ORDER_STATUSES = ["PENDING", "PAID", "FULFILLED", "CANCELLED"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PRODUCT_STATUSES = ["DRAFT", "ACTIVE", "ARCHIVED"] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

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
