"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/session";
import { ORDER_STATUSES, updateOrderStatus } from "@/lib/server/orders";

const schema = z.object({
  id: z.string().min(1),
  status: z.enum(ORDER_STATUSES),
});

export async function updateOrderStatusAction(
  id: string,
  status: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await requireAdmin();
  if (!user) return { ok: false, error: "Unauthorized" };

  const parsed = schema.safeParse({ id, status });
  if (!parsed.success) return { ok: false, error: "Invalid status" };

  await updateOrderStatus(parsed.data.id, parsed.data.status);
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin");
  return { ok: true };
}
