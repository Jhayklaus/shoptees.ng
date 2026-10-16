import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { toDisplayProduct } from "@/lib/server/products";
import type { CartLineHydrated } from "@/types";

const schema = z.object({
  lines: z
    .array(
      z.object({
        productId: z.string(),
        variantId: z.string(),
        quantity: z.number().int().positive().max(99),
      })
    )
    .max(50),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const productIds = Array.from(new Set(parsed.data.lines.map((l) => l.productId)));
  const products = await prisma.product.findMany({
    // COMING_SOON is excluded alongside ARCHIVED, so a line for a piece
    // that has not dropped drops out of the cart instead of sitting there
    // priced and un-checkout-able. There is no route that puts one in —
    // the product page has no add button — but the cart lives in
    // localStorage, so a piece that was ACTIVE when it was added and has
    // since been pulled back into the next wave would otherwise survive.
    where: { id: { in: productIds }, status: { notIn: ["ARCHIVED", "COMING_SOON"] } },
    include: {
      category: true,
      collection: true,
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      variants: true,
    },
  });

  const productMap = new Map(products.map((p) => [p.id, toDisplayProduct(p)]));

  const hydrated: CartLineHydrated[] = [];
  const dropped: string[] = [];

  for (const line of parsed.data.lines) {
    const product = productMap.get(line.productId);
    if (!product) {
      dropped.push(line.variantId);
      continue;
    }
    const variant = product.variants.find((v) => v.id === line.variantId);
    if (!variant) {
      dropped.push(line.variantId);
      continue;
    }
    const unitPriceNGN = variant.priceOverrideNGN ?? product.priceNGN;
    hydrated.push({
      ...line,
      product,
      variant,
      unitPriceNGN,
      lineTotalNGN: unitPriceNGN * line.quantity,
    });
  }

  return NextResponse.json({ lines: hydrated, dropped });
}
