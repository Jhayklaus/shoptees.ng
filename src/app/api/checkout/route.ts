import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { nextOrderNumber } from "@/lib/server/orders";

const lineSchema = z.object({
  productId: z.string(),
  variantId: z.string(),
  quantity: z.number().int().positive().max(99),
});

const schema = z.object({
  email: z.string().email(),
  phone: z.string().min(5).max(40),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  address: z.object({
    line1: z.string().min(1).max(200),
    line2: z.string().max(200).optional().nullable(),
    city: z.string().min(1).max(100),
    state: z.string().min(1).max(100),
    postal: z.string().max(40).optional().nullable(),
  }),
  lines: z.array(lineSchema).min(1).max(50),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }
  const data = parsed.data;

  // Re-fetch products + variants on the server. Never trust client prices.
  const productIds = Array.from(new Set(data.lines.map((l) => l.productId)));
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, status: "ACTIVE" },
    include: { variants: true },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));

  type Resolved = {
    product: (typeof products)[number];
    variant: (typeof products)[number]["variants"][number];
    quantity: number;
    unitPriceNGN: number;
  };
  const resolved: Resolved[] = [];

  for (const line of data.lines) {
    const product = productMap.get(line.productId);
    if (!product) {
      return NextResponse.json(
        { error: "One or more products are no longer available." },
        { status: 409 }
      );
    }
    const variant = product.variants.find((v) => v.id === line.variantId);
    if (!variant) {
      return NextResponse.json(
        { error: "One or more variants are no longer available." },
        { status: 409 }
      );
    }
    if (variant.stock < line.quantity) {
      return NextResponse.json(
        { error: `Only ${variant.stock} of "${product.name}" (${variant.size}) left in stock.` },
        { status: 409 }
      );
    }
    resolved.push({
      product,
      variant,
      quantity: line.quantity,
      unitPriceNGN: variant.priceOverrideNGN ?? product.priceNGN,
    });
  }

  const subtotal = resolved.reduce((s, r) => s + r.unitPriceNGN * r.quantity, 0);
  const shipping = 0; // TODO: shipping zone lookup once user provides rates
  const total = subtotal + shipping;

  const orderNumber = await nextOrderNumber();

  // Customer + Address: upsert by email, append fresh address row.
  const customer = await prisma.customer.upsert({
    where: { email: data.email.toLowerCase() },
    create: {
      email: data.email.toLowerCase(),
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
    },
    update: {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
    },
  });

  const address = await prisma.address.create({
    data: {
      customerId: customer.id,
      line1: data.address.line1,
      line2: data.address.line2 ?? null,
      city: data.address.city,
      state: data.address.state,
      postal: data.address.postal ?? null,
    },
  });

  const order = await prisma.order.create({
    data: {
      orderNumber,
      customerId: customer.id,
      addressId: address.id,
      status: "PENDING",
      subtotalNGN: subtotal,
      shippingNGN: shipping,
      totalNGN: total,
      items: {
        create: resolved.map((r) => ({
          productId: r.product.id,
          variantId: r.variant.id,
          productName: r.product.name,
          variantSize: r.variant.size,
          unitPriceNGN: r.unitPriceNGN,
          quantity: r.quantity,
        })),
      },
    },
  });

  // Stock decrement is intentionally NOT done here — it happens when the order
  // is marked PAID (via Paystack webhook in a future slice). Holding stock at
  // PENDING risks lock-in if customers abandon the Paystack flow.

  return NextResponse.json({
    ok: true,
    orderNumber: order.orderNumber,
    orderId: order.id,
  });
}
