import "server-only";
import { prisma } from "@/lib/db";

export async function listCustomersWithStats() {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      orders: {
        where: { status: { in: ["PAID", "FULFILLED"] } },
        select: { totalNGN: true },
      },
    },
  });
  return customers.map((c) => ({
    id: c.id,
    email: c.email,
    firstName: c.firstName,
    lastName: c.lastName,
    phone: c.phone,
    createdAt: c.createdAt,
    orderCount: c.orders.length,
    lifetimeNGN: c.orders.reduce((s, o) => s + o.totalNGN, 0),
  }));
}
