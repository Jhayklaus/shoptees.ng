import "server-only";
import { prisma } from "@/lib/db";
import { setSetting, getSetting } from "@/lib/server/settings";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/constants";

export { ORDER_STATUSES, type OrderStatus };

export function listOrders(opts?: { status?: OrderStatus }) {
  return prisma.order.findMany({
    where: opts?.status ? { status: opts.status } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      customer: true,
      items: true,
    },
  });
}

export function getOrderById(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      customer: true,
      address: true,
      items: { include: { product: true, variant: true } },
    },
  });
}

export function getOrderByNumber(orderNumber: string) {
  return prisma.order.findUnique({
    where: { orderNumber },
    include: {
      customer: true,
      address: true,
      items: { include: { product: true, variant: true } },
    },
  });
}

export function getOrderByPaystackReference(paystackReference: string) {
  return prisma.order.findFirst({
    where: { paystackReference },
    include: {
      customer: true,
      address: true,
      items: { include: { product: true, variant: true } },
    },
  });
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  return prisma.order.update({ where: { id }, data: { status } });
}

// Generates "SHP-2026-0001"-style numbers using SiteSetting counter+year.
// Resets the counter on year rollover.
export async function nextOrderNumber() {
  const year = new Date().getFullYear().toString();
  const storedYear = await getSetting("order.year");
  if (storedYear !== year) {
    await setSetting("order.year", year);
    await setSetting("order.counter", "0");
  }
  const counter = parseInt(await getSetting("order.counter"), 10) || 0;
  const next = counter + 1;
  await setSetting("order.counter", next.toString());
  return `SHP-${year}-${next.toString().padStart(4, "0")}`;
}
