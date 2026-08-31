// Regression tests for the money math behind the ₦ / $ switcher.
// No test runner in this project — run with: npm run test:currency
import {
  fromNGN,
  priceLines,
  formatMoney,
  formatStored,
  toMinor,
  roundMajor,
} from "../src/lib/currency";

const ctx = { code: "USD" as const, rate: 1600, rounding: "charm" as const };
let fails = 0;
const eq = (label: string, got: unknown, want: unknown) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) { fails++; console.log(`FAIL ${label}: got ${JSON.stringify(got)} want ${JSON.stringify(want)}`); }
  else console.log(`ok   ${label} → ${JSON.stringify(got)}`);
};

eq("45000 NGN @1600 charm", fromNGN(45000, ctx), 28.99);          // 28.125 → 28.99
eq("exact $1.00 rounds up not down", fromNGN(1600, ctx), 1.99);
eq("charm is idempotent", roundMajor(28.99, "USD", "charm"), 28.99);
eq("charm never below true value", roundMajor(0.5, "USD", "charm"), 0.99);
eq("charm on a big price", roundMajor(1234.01, "USD", "charm"), 1234.99);
eq("zero stays zero", fromNGN(0, ctx), 0);
eq("whole mode", fromNGN(45000, { ...ctx, rounding: "whole" }), 29);
eq("exact mode", fromNGN(45000, { ...ctx, rounding: "exact" }), 28.13);
eq("NGN passthrough", fromNGN(45000, { code: "NGN", rate: 1, rounding: "whole" }), 45000);
eq("bad rate falls back", fromNGN(45000, { ...ctx, rate: 0 }), 45000);

const p = priceLines(
  [{ unitPriceNGN: 45000, quantity: 2 }, { unitPriceNGN: 30000, quantity: 1 }],
  0,
  ctx,
);
eq("line units", p.lines.map((l) => l.unitMajor), [28.99, 18.99]);
eq("subtotal = sum of lines", p.subtotalMinor, 2899 * 2 + 1899);
eq("shipping 0 stays 0", p.shippingMinor, 0);
eq("total", p.totalMinor, p.subtotalMinor);

eq("format USD", formatMoney(28.99, "USD"), "$28.99");
eq("format NGN", formatMoney(45000, "NGN"), "₦45,000");
eq("stored USD wins", formatStored(45000, 2899, "USD"), "$28.99");
eq("stored NGN fallback", formatStored(45000, null, "USD"), "₦45,000");
eq("stored NGN order", formatStored(45000, null, "NGN"), "₦45,000");
eq("toMinor", toMinor(28.99, "USD"), 2899);
eq("roundMajor negative", roundMajor(-5, "USD", "charm"), 0);

console.log(fails === 0 ? "\nALL PASS" : `\n${fails} FAILED`);
process.exit(fails === 0 ? 0 : 1);
